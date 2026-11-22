import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test, { type TestContext } from "node:test";
import { createAssistantMessageEventStream, type AssistantMessage } from "@earendil-works/pi-ai";
import type { AgentSessionRuntime } from "@earendil-works/pi-coding-agent";
import type { SessionDriverEvent } from "@fxagent/session-driver";
import { PiSdkDriver } from "../dist/pi-sdk-driver.js";
import { createAgentSessionRuntimeWithNpmFallback } from "../dist/npm-package-fallback.js";

type StreamFunction = AgentSessionRuntime["session"]["agent"]["streamFunction"];

const PROVIDER = "fxagent-fallback-test";

const reply: StreamFunction = (model) => {
  const stream = createAssistantMessageEventStream();
  const message: AssistantMessage = {
    role: "assistant",
    content: [{ type: "text", text: "done" }],
    api: model.api,
    provider: model.provider,
    model: model.id,
    usage: {
      input: 1,
      output: 1,
      cacheRead: 0,
      cacheWrite: 0,
      totalTokens: 2,
      cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
    },
    stopReason: "stop",
    timestamp: Date.now(),
  };
  stream.push({ type: "start", partial: { ...message, content: [] } });
  stream.push({ type: "done", reason: "stop", message });
  return stream;
};

function modelsJson(modelIds: string[]): string {
  return JSON.stringify({
    providers: {
      [PROVIDER]: {
        baseUrl: "http://127.0.0.1:9/never-contact",
        apiKey: "LOCAL_TEST_CANARY",
        api: "openai-completions",
        models: modelIds.map((id) => ({
          id,
          input: ["text"],
          contextWindow: 128000,
          maxTokens: 4096,
        })),
      },
    },
  });
}

async function setup(t: TestContext, modelIds: string[]) {
  const root = await mkdtemp(join(tmpdir(), "fxagent-model-fallback-"));
  const agentDir = join(root, "agent");
  const workspacePath = join(root, "workspace");
  await mkdir(agentDir);
  await mkdir(workspacePath);
  const previousAgentDir = process.env.PI_CODING_AGENT_DIR;
  process.env.PI_CODING_AGENT_DIR = agentDir;
  t.after(() => {
    if (previousAgentDir === undefined) delete process.env.PI_CODING_AGENT_DIR;
    else process.env.PI_CODING_AGENT_DIR = previousAgentDir;
  });
  t.mock.method(globalThis, "fetch", async () => {
    throw new Error("model fallback tests must never use the network");
  });
  await writeFile(join(agentDir, "auth.json"), "{}");
  await writeFile(join(agentDir, "settings.json"), JSON.stringify({ packages: [] }));
  const modelsPath = join(agentDir, "models.json");
  await writeFile(modelsPath, modelsJson(modelIds));
  return {
    agentDir,
    modelsPath,
    workspace: { workspaceId: "fallback-workspace", path: workspacePath },
  };
}

function scriptedDriver(agentDir: string) {
  return new PiSdkDriver({
    agentDir,
    catalogFilePath: join(agentDir, "catalogs.json"),
    createAgentSessionRuntimeImpl: async (options) => {
      const runtime = await createAgentSessionRuntimeWithNpmFallback({ ...options, tools: [] });
      runtime.session.agent.streamFunction = reply;
      return runtime;
    },
  });
}

/**
 * Creates a session that has a turn and then a selectable model change, so reopening
 * it restores the model named in its log.
 */
async function sessionWithStoredModel(
  t: TestContext,
  driver: PiSdkDriver,
  workspace: { workspaceId: string; path: string },
  modelId: string,
) {
  const snapshot = await driver.createSession(workspace, {
    initialModel: { provider: PROVIDER, modelId: "kept" },
  });
  const completed = new Promise<() => void>((resolve) => {
    const unsubscribe = driver.subscribe(snapshot.ref, (event) => {
      if (event.type === "runCompleted") resolve(unsubscribe);
    });
  });
  await driver.sendUserMessage(snapshot.ref, { text: "hello" });
  // Nothing may listen when the session reloads, so its notices stay queued for the next subscriber.
  (await completed)();
  await driver.setSessionModel(snapshot.ref, { provider: PROVIDER, modelId });
  await driver.closeSession(snapshot.ref);
  return snapshot.ref;
}

function noticesAfterSubscribe(
  driver: PiSdkDriver,
  ref: { workspaceId: string; sessionId: string },
) {
  const notices: string[] = [];
  const unsubscribe = driver.subscribe(ref, (event: SessionDriverEvent) => {
    if (event.type === "hostUiRequest" && event.request.kind === "notify") {
      notices.push(`${event.request.level}: ${event.request.message}`);
    }
  });
  unsubscribe();
  return notices;
}

await test("reopening a session whose model is gone reports the fallback model", async (t) => {
  const { agentDir, modelsPath, workspace } = await setup(t, ["kept", "retired"]);
  const driver = scriptedDriver(agentDir);
  const ref = await sessionWithStoredModel(t, driver, workspace, "retired");

  // The model the session stored no longer exists, so pi opens it on another one.
  await writeFile(modelsPath, modelsJson(["kept"]));
  await driver.openSession(ref);
  t.after(() => driver.closeSession(ref));

  assert.deepEqual(noticesAfterSubscribe(driver, ref), [
    `warning: Could not restore model ${PROVIDER}/retired. Using ${PROVIDER}/kept`,
  ]);
});

await test("reopening a session whose model is still there reports no fallback", async (t) => {
  const { agentDir, workspace } = await setup(t, ["kept", "retired"]);
  const driver = scriptedDriver(agentDir);
  const ref = await sessionWithStoredModel(t, driver, workspace, "retired");
  await driver.openSession(ref);
  t.after(() => driver.closeSession(ref));

  assert.deepEqual(noticesAfterSubscribe(driver, ref), []);
});
