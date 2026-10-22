import { useCallback, useEffect, useState } from "react";
import type {
  McpServerRecord,
  McpServerScope,
  McpServersSnapshot,
  NewMcpServerInput,
} from "../../../contracts/ipc";
import { t, useI18n } from "../../i18n";
import { SettingsSegmented, SettingsSwitch } from "./settings-controls";
import { SettingsGroup, SettingsRow } from "./settings-utils";

/** Each returns the error to show, or undefined when the change was saved. */
export interface McpSettingsActions {
  readonly onAddServer: (server: NewMcpServerInput) => Promise<string | undefined>;
  readonly onRemoveServer: (name: string) => Promise<string | undefined>;
  readonly onSetServerEnabled: (
    scope: McpServerScope,
    name: string,
    enabled: boolean,
  ) => Promise<string | undefined>;
  readonly onSetCodemodeAlwaysOn: (alwaysOn: boolean) => Promise<string | undefined>;
}

interface SettingsMcpSectionProps {
  readonly workspaceId: string;
  readonly actions: McpSettingsActions;
}

export function SettingsMcpSection({ workspaceId, actions }: SettingsMcpSectionProps) {
  const { t } = useI18n();
  // Tagged with its workspace: after a switch, the old list (whose buttons would act on the new
  // workspace) is gone at once, until the new one loads.
  const [loaded, setLoaded] = useState<
    { readonly workspaceId: string; readonly snapshot: McpServersSnapshot } | undefined
  >();
  const snapshot = loaded?.workspaceId === workspaceId ? loaded.snapshot : undefined;
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => setError(undefined), [workspaceId]);

  // pi in the terminal may have edited mcp.json while the app was in the background.
  useEffect(() => window.fxagentApp?.onWindowFocused(() => setReloadKey((key) => key + 1)), []);

  useEffect(() => {
    const api = window.fxagentApp;
    if (!api) return;
    let cancelled = false;
    api
      .listMcpServers(workspaceId)
      .then((next) => {
        if (!cancelled) setLoaded({ workspaceId, snapshot: next });
      })
      .catch((loadError: unknown) => {
        if (!cancelled) setError(errorText(loadError));
      });
    return () => {
      cancelled = true;
    };
  }, [workspaceId, reloadKey]);

  /** Runs one change, shows its error, and re-reads the files either way. */
  const apply = useCallback(async (change: () => Promise<string | undefined>) => {
    setPending(true);
    try {
      const failure = await change();
      setError(failure);
      return failure;
    } catch (changeError) {
      const failure = errorText(changeError);
      setError(failure);
      return failure;
    } finally {
      setPending(false);
      setReloadKey((key) => key + 1);
    }
  }, []);

  const run = useCallback(
    (change: () => Promise<string | undefined>) => {
      apply(change).catch((changeError: unknown) => setError(errorText(changeError)));
    },
    [apply],
  );

  const servers = snapshot?.servers ?? [];
  const problems = [...(error ? [error] : []), ...(snapshot?.errors ?? [])];
  const globalConfigPath = snapshot?.globalConfigPath ?? t("settings.mcp.globalConfigFallback");

  return (
    <>
      <SettingsGroup
        title={t("settings.mcp.servers.title")}
        description={t("settings.mcp.servers.description", { path: globalConfigPath })}
      >
        {problems.map((problem) => (
          <div className="settings-row" key={problem}>
            <span className="settings-row__description settings-warning">{problem}</span>
          </div>
        ))}
        {snapshot && servers.length === 0 ? (
          <div className="settings-row" data-testid="mcp-servers-empty">
            <span className="settings-row__description">
              {t("settings.mcp.servers.empty", { path: globalConfigPath })}
            </span>
          </div>
        ) : null}
        {servers.map((server) => (
          <McpServerRow
            disabled={pending}
            key={`${server.scope}:${server.name}`}
            server={server}
            onRemove={() => {
              if (window.confirm(removeServerQuestion(server))) {
                run(() => actions.onRemoveServer(server.name));
              }
            }}
            onToggle={(enabled) =>
              run(() => actions.onSetServerEnabled(server.scope, server.name, enabled))
            }
          />
        ))}
      </SettingsGroup>

      <AddMcpServerForm
        configPath={globalConfigPath}
        disabled={pending}
        onAdd={(server) => apply(() => actions.onAddServer(server))}
      />

      <SettingsGroup title={t("settings.mcp.codeMode.title")}>
        <SettingsRow
          title={t("settings.mcp.codeMode.alwaysOn.title")}
          description={t("settings.mcp.codeMode.alwaysOn.description")}
        >
          <SettingsSwitch
            checked={snapshot?.codemodeAlwaysOn ?? false}
            disabled={pending || !snapshot}
            label={t("settings.mcp.codeMode.alwaysOn.label")}
            onChange={(alwaysOn) => run(() => actions.onSetCodemodeAlwaysOn(alwaysOn))}
          />
        </SettingsRow>
      </SettingsGroup>
    </>
  );
}

function McpServerRow({
  server,
  disabled,
  onToggle,
  onRemove,
}: {
  readonly server: McpServerRecord;
  readonly disabled: boolean;
  readonly onToggle: (enabled: boolean) => void;
  readonly onRemove: () => void;
}) {
  const { t } = useI18n();
  const target =
    server.transport === "http"
      ? (server.url ?? "")
      : [server.command ?? "", ...(server.args ?? []).map(quoteArgument)].join(" ");
  return (
    <div className="settings-row" data-testid="mcp-server-row" data-server-name={server.name}>
      <div className="settings-row__label">
        <div className="settings-row__title">{server.name}</div>
        {server.description ? (
          <div className="settings-row__description">{server.description}</div>
        ) : null}
        <div className="settings-row__description">
          {server.scope === "project" ? t("settings.mcp.server.thisProject", { target }) : target}
        </div>
      </div>
      <div className="settings-row__actions">
        {server.scope === "global" ? (
          <button
            className="button button--secondary"
            disabled={disabled}
            type="button"
            onClick={onRemove}
          >
            {t("settings.mcp.server.remove")}
          </button>
        ) : null}
        <SettingsSwitch
          checked={server.enabled}
          disabled={disabled}
          label={t("settings.mcp.server.enable", { name: server.name })}
          onChange={onToggle}
        />
      </div>
    </div>
  );
}

/** Removing deletes the whole entry, including the settings the list never shows. */
export function removeServerQuestion(server: McpServerRecord): string {
  const question = t("settings.mcp.removeQuestion", { name: server.name });
  return server.hasHiddenSettings
    ? `${question} ${t("settings.mcp.removeQuestionHidden")}`
    : question;
}

type ServerKind = "command" | "url";

function AddMcpServerForm({
  configPath,
  disabled,
  onAdd,
}: {
  readonly configPath: string;
  readonly disabled: boolean;
  readonly onAdd: (server: NewMcpServerInput) => Promise<string | undefined>;
}) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [kind, setKind] = useState<ServerKind>("command");
  const [command, setCommand] = useState("");
  const [args, setArgs] = useState("");
  const [url, setUrl] = useState("");

  const ready = name.trim() !== "" && (kind === "command" ? command.trim() : url.trim()) !== "";

  const submit = async () => {
    const named = description.trim()
      ? { name: name.trim(), description: description.trim() }
      : { name: name.trim() };
    const server: NewMcpServerInput =
      kind === "command"
        ? { ...named, command: command.trim(), args: splitArguments(args) }
        : { ...named, url: url.trim() };
    if (!(await onAdd(server))) {
      setName("");
      setDescription("");
      setCommand("");
      setArgs("");
      setUrl("");
    }
  };

  return (
    <SettingsGroup
      title={t("settings.mcp.add.title")}
      description={t("settings.mcp.add.description", { path: configPath })}
    >
      <SettingsRow title={t("settings.mcp.add.name.title")}>
        <input
          aria-label={t("settings.mcp.add.name.label")}
          className="settings-text-input"
          disabled={disabled}
          placeholder="docs"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </SettingsRow>
      <SettingsRow
        title={t("settings.mcp.add.description.title")}
        description={t("settings.mcp.add.description.description")}
      >
        <input
          aria-label={t("settings.mcp.add.description.label")}
          className="settings-text-input"
          disabled={disabled}
          placeholder={t("settings.mcp.add.description.placeholder")}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </SettingsRow>
      <SettingsRow title={t("settings.mcp.add.type.title")}>
        <SettingsSegmented<ServerKind>
          label={t("settings.mcp.add.type.label")}
          options={[
            { value: "command", label: t("settings.mcp.add.type.command") },
            { value: "url", label: t("settings.mcp.add.type.url") },
          ]}
          value={kind}
          onChange={setKind}
        />
      </SettingsRow>
      {kind === "command" ? (
        <>
          <SettingsRow
            title={t("settings.mcp.add.command.title")}
            description={t("settings.mcp.add.command.description")}
          >
            <input
              aria-label={t("settings.mcp.add.command.label")}
              className="settings-text-input"
              disabled={disabled}
              placeholder="npx"
              value={command}
              onChange={(event) => setCommand(event.target.value)}
            />
          </SettingsRow>
          <SettingsRow
            title={t("settings.mcp.add.arguments.title")}
            description={t("settings.mcp.add.arguments.description")}
          >
            <input
              aria-label={t("settings.mcp.add.arguments.label")}
              className="settings-text-input"
              disabled={disabled}
              placeholder="-y @modelcontextprotocol/server-filesystem ."
              value={args}
              onChange={(event) => setArgs(event.target.value)}
            />
          </SettingsRow>
        </>
      ) : (
        <SettingsRow
          title={t("settings.mcp.add.url.title")}
          description={t("settings.mcp.add.url.description")}
        >
          <input
            aria-label={t("settings.mcp.add.url.label")}
            className="settings-text-input"
            disabled={disabled}
            placeholder="https://example.com/mcp"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
          />
        </SettingsRow>
      )}
      <div className="settings-row">
        <span className="settings-row__description">{t("settings.mcp.add.note")}</span>
        <div className="settings-row__control">
          <button
            className="button"
            disabled={disabled || !ready}
            type="button"
            onClick={() => {
              submit().catch(() => undefined);
            }}
          >
            {t("settings.mcp.add.submit")}
          </button>
        </div>
      </div>
    </SettingsGroup>
  );
}

/** Splits on spaces, keeping quoted parts ("a b" or 'a b') together. */
export function splitArguments(text: string): string[] {
  const args: string[] = [];
  let current = "";
  let quote: string | undefined;
  let started = false;
  for (const char of text) {
    if (quote) {
      if (char === quote) quote = undefined;
      else current += char;
    } else if (char === '"' || char === "'") {
      quote = char;
      started = true;
    } else if (/\s/.test(char)) {
      if (started) args.push(current);
      current = "";
      started = false;
    } else {
      current += char;
      started = true;
    }
  }
  if (started) args.push(current);
  return args;
}

function quoteArgument(arg: string): string {
  return arg === "" || /\s/.test(arg) ? JSON.stringify(arg) : arg;
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
