import { resolveRuntimeCommands } from "../../../contracts/composer-commands";
import type {
  RuntimeCommandRecord,
  RuntimeProviderRecord,
  RuntimeSettingsSnapshot,
  RuntimeSnapshot,
} from "@pi-gui/session-driver/runtime-types";
import type { ExtensionCommandCompatibilityRecord } from "../../../contracts/desktop-state";
import { titleCase } from "../../lib/string-utils";
import { t } from "../../i18n";

export type ComposerSlashCommandKind =
  | "runtime"
  | "model"
  | "thinking"
  | "tree"
  | "status"
  | "session"
  | "reload"
  | "compact"
  | "name"
  | "login"
  | "logout"
  | "settings"
  | "scoped-models";

export interface ComposerSlashCommand {
  readonly id: string;
  readonly kind: ComposerSlashCommandKind;
  readonly command: string;
  readonly template: string;
  readonly title: string;
  readonly description: string;
  readonly submitMode?: "immediate" | "prefill" | "pick-option";
  readonly section: "runtime" | "host";
  readonly runtimeCommand?: RuntimeCommandRecord;
  readonly sourceLabel?: string;
  readonly compatibility?: ExtensionCommandCompatibilityRecord;
}

export interface ComposerSlashCommandSection {
  readonly id: "runtime" | "host";
  readonly title?: string;
  readonly items: readonly ComposerSlashCommand[];
}

export interface ComposerSlashOption {
  readonly value: string;
  readonly label: string;
  readonly description: string;
}

export interface ComposerSlashOptionEmptyState {
  readonly title: string;
  readonly description: string;
}

export interface ComposerModelOption extends ComposerSlashOption {
  readonly providerId: string;
  readonly modelId: string;
}

export interface ComposerProviderOption extends ComposerSlashOption {
  readonly providerId: string;
}

/** Built-in app actions; translated when built, so a language switch reaches the menu. */
function hostActionSlashCommands(): readonly ComposerSlashCommand[] {
  return [
    {
      id: "host:model",
      kind: "model",
      command: "/model",
      template: "/model",
      title: t("composer.commands.model.title"),
      description: t("composer.commands.model.description"),
      submitMode: "pick-option",
      section: "host",
    },
    {
      id: "host:thinking",
      kind: "thinking",
      command: "/thinking",
      template: "/thinking",
      title: t("composer.commands.reasoning.title"),
      description: t("composer.commands.reasoning.description"),
      submitMode: "pick-option",
      section: "host",
    },
    {
      id: "host:tree",
      kind: "tree",
      command: "/tree",
      template: "/tree",
      title: t("composer.commands.tree.title"),
      description: t("composer.commands.tree.description"),
      submitMode: "immediate",
      section: "host",
    },
    {
      id: "host:status",
      kind: "status",
      command: "/status",
      template: "/status",
      title: t("composer.commands.status.title"),
      description: t("composer.commands.status.description"),
      submitMode: "immediate",
      section: "host",
    },
    {
      id: "host:login",
      kind: "login",
      command: "/login",
      template: "/login",
      title: t("composer.commands.login.title"),
      description: t("composer.commands.login.description"),
      submitMode: "pick-option",
      section: "host",
    },
    {
      id: "host:logout",
      kind: "logout",
      command: "/logout",
      template: "/logout",
      title: t("composer.commands.logout.title"),
      description: t("composer.commands.logout.description"),
      submitMode: "pick-option",
      section: "host",
    },
    {
      id: "host:settings",
      kind: "settings",
      command: "/settings",
      template: "/settings",
      title: t("composer.commands.settings.title"),
      description: t("composer.commands.settings.description"),
      submitMode: "immediate",
      section: "host",
    },
    {
      id: "host:scoped-models",
      kind: "scoped-models",
      command: "/scoped-models",
      template: "/scoped-models",
      title: t("composer.commands.enabledModels.title"),
      description: t("composer.commands.enabledModels.description"),
      submitMode: "immediate",
      section: "host",
    },
    {
      id: "host:session",
      kind: "session",
      command: "/session",
      template: "/session",
      title: t("composer.commands.session.title"),
      description: t("composer.commands.session.description"),
      submitMode: "immediate",
      section: "host",
    },
    {
      id: "host:name",
      kind: "name",
      command: "/name",
      // Command syntax and its example title stay as-is: the user edits this text and sends it.
      template: "/name New thread title",
      title: t("composer.commands.rename.title"),
      description: t("composer.commands.rename.description"),
      submitMode: "prefill",
      section: "host",
    },
    {
      id: "host:compact",
      kind: "compact",
      command: "/compact",
      template: "/compact",
      title: t("composer.commands.compact.title"),
      description: t("composer.commands.compact.description"),
      submitMode: "immediate",
      section: "host",
    },
    {
      id: "host:reload",
      kind: "reload",
      command: "/reload",
      template: "/reload",
      title: t("composer.commands.reload.title"),
      description: t("composer.commands.reload.description"),
      submitMode: "immediate",
      section: "host",
    },
  ];
}

/** Thinking levels; the values are what pi receives, so only the labels and prose translate. */
export function thinkingOptions(): readonly ComposerSlashOption[] {
  return [
    {
      value: "low",
      label: t("composer.commands.thinking.low.label"),
      description: t("composer.commands.thinking.low.description"),
    },
    {
      value: "medium",
      label: t("composer.commands.thinking.medium.label"),
      description: t("composer.commands.thinking.medium.description"),
    },
    {
      value: "high",
      label: t("composer.commands.thinking.high.label"),
      description: t("composer.commands.thinking.high.description"),
    },
    {
      value: "xhigh",
      label: t("composer.commands.thinking.xhigh.label"),
      description: t("composer.commands.thinking.xhigh.description"),
    },
    {
      value: "max",
      label: t("composer.commands.thinking.max.label"),
      description: t("composer.commands.thinking.max.description"),
    },
  ];
}

export function buildSlashCommandSections(
  query: string,
  runtime: RuntimeSnapshot | undefined,
  sessionCommands: readonly RuntimeCommandRecord[],
  compatibilityRecords: readonly ExtensionCommandCompatibilityRecord[] = [],
  options: {
    readonly allowTreeCommand?: boolean;
  } = {},
): readonly ComposerSlashCommandSection[] {
  const normalizedQuery = query.trim().toLowerCase();
  const availableRuntimeCommands = resolveRuntimeCommands(runtime, sessionCommands);
  const compatibilityByKey = new Map(
    compatibilityRecords.map(
      (record) => [`${record.extensionPath}::${record.commandName}`, record] as const,
    ),
  );
  const runtimeMatches = availableRuntimeCommands
    .map<ComposerSlashCommand>((command) => ({
      id: `runtime:${command.source}:${command.name}`,
      kind: "runtime",
      command: `/${command.name}`,
      template: `/${command.name} `,
      title: formatRuntimeCommandTitle(command),
      description: formatRuntimeCommandDescription(command),
      submitMode: "prefill",
      section: "runtime",
      runtimeCommand: command,
      sourceLabel: formatRuntimeSourceLabel(command),
      compatibility: compatibilityByKey.get(`${command.sourceInfo.path}::${command.name}`),
    }))
    .filter((command) => matchesCommand(command, normalizedQuery));
  const allowTreeCommand = options.allowTreeCommand ?? true;
  const hostMatches = hostActionSlashCommands().filter(
    (command) =>
      (allowTreeCommand || command.kind !== "tree") && matchesCommand(command, normalizedQuery),
  );

  // Prefer a host action when it is a prefix match and runtime skills only
  // match fuzzily. Otherwise an installed skill such as `observe-state` can
  // steal `/stat` from the built-in `/status` command on Tab.
  const hostHasPrefixMatch = hostMatches.some((command) =>
    command.command.toLowerCase().startsWith(normalizedQuery),
  );
  const runtimeHasPrefixMatch = runtimeMatches.some((command) =>
    command.command.toLowerCase().startsWith(normalizedQuery),
  );
  const runtimeSection: ComposerSlashCommandSection = {
    id: "runtime",
    title: runtimeMatches.length > 0 ? t("composer.commands.runtimeSectionTitle") : undefined,
    items: runtimeMatches,
  };
  const hostSection: ComposerSlashCommandSection = {
    id: "host",
    title: hostMatches.length > 0 ? t("composer.commands.hostSectionTitle") : undefined,
    items: hostMatches,
  };
  const sections: ComposerSlashCommandSection[] =
    hostHasPrefixMatch && !runtimeHasPrefixMatch
      ? [hostSection, runtimeSection]
      : [runtimeSection, hostSection];

  return sections.filter((section) => section.items.length > 0);
}

export function flattenSlashSections(
  sections: readonly ComposerSlashCommandSection[],
): readonly ComposerSlashCommand[] {
  return sections.flatMap((section) => section.items);
}

export function buildProviderOptions(
  providers: readonly RuntimeProviderRecord[],
  filter: (provider: RuntimeProviderRecord) => boolean = () => true,
): readonly ComposerProviderOption[] {
  return providers
    .filter(filter)
    .sort(compareProviders)
    .map((provider) => ({
      value: provider.id,
      label: provider.name,
      description: describeProvider(provider),
      providerId: provider.id,
    }));
}

export function buildModelOptions(
  runtime: RuntimeSnapshot | undefined,
): readonly ComposerModelOption[] {
  if (!runtime) {
    return [];
  }

  const enabledPatterns = runtime.settings.enabledModelPatterns;
  const allAvailable = enabledPatterns.length === 0;
  const enabledSet = allAvailable ? undefined : new Set(enabledPatterns);

  return [...runtime.models]
    .filter((model) => {
      if (!model.available) return false;
      if (!enabledSet) return true;
      return enabledSet.has(`${model.providerId}/${model.modelId}`);
    })
    .sort((left: RuntimeSnapshot["models"][number], right: RuntimeSnapshot["models"][number]) => {
      const providerCompare =
        providerRankForId(runtime.providers, left.providerId) -
        providerRankForId(runtime.providers, right.providerId);
      if (providerCompare !== 0) {
        return providerCompare;
      }
      return `${left.providerName} ${left.label}`.localeCompare(
        `${right.providerName} ${right.label}`,
      );
    })
    .map((model: RuntimeSnapshot["models"][number]) => ({
      value: model.modelId,
      label: `${model.providerName} · ${model.label}`,
      description: model.modelId,
      providerId: model.providerId,
      modelId: model.modelId,
    }));
}

export function slashOptionsForCommand(
  command: ComposerSlashCommand | undefined,
  runtime?: RuntimeSnapshot,
): readonly ComposerSlashOption[] {
  if (!command) {
    return [];
  }

  if (command.kind === "thinking") {
    return thinkingOptions();
  }
  if (command.kind === "model") {
    return buildModelOptions(runtime);
  }
  if (command.kind === "login") {
    return buildProviderOptions(runtime?.providers ?? [], (provider) => provider.oauthSupported);
  }
  if (command.kind === "logout") {
    return buildProviderOptions(
      runtime?.providers ?? [],
      (provider) => provider.authSource === "oauth" || provider.authSource === "auth_file",
    );
  }

  return [];
}

export function slashOptionEmptyState(
  command: ComposerSlashCommand | undefined,
  runtime?: RuntimeSnapshot,
): ComposerSlashOptionEmptyState | undefined {
  if (!command) {
    return undefined;
  }

  if (command.kind === "model" && buildModelOptions(runtime).length === 0) {
    return {
      title: t("composer.modelSelector.noModelsAvailable"),
      description: t("composer.modelSelector.noModelsAvailableDescription"),
    };
  }

  return undefined;
}

function matchesCommand(command: ComposerSlashCommand, normalizedQuery: string): boolean {
  if (!normalizedQuery.startsWith("/")) {
    return false;
  }

  if (normalizedQuery === "/") {
    return true;
  }

  const queryWithoutSlash = normalizedQuery.replace(/^\/+/, "").trim();
  const rawSearchTerms = [command.command.toLowerCase()];
  const aliasSearchTerms = buildSlashSearchAliases(command);
  if (rawSearchTerms.some((value) => value.includes(normalizedQuery))) {
    return true;
  }

  if (!queryWithoutSlash) {
    return false;
  }

  return aliasSearchTerms.some((value) => value.includes(queryWithoutSlash));
}

function buildSlashSearchAliases(command: ComposerSlashCommand): readonly string[] {
  const aliases = new Set<string>([
    command.command.replace(/^\/+/, "").toLowerCase(),
    command.title.toLowerCase(),
    command.sourceLabel?.toLowerCase() ?? "",
    command.compatibility?.status === "terminal-only" ? "terminal-only" : "",
  ]);

  if (command.runtimeCommand) {
    aliases.add(command.runtimeCommand.name.toLowerCase());
    aliases.add(command.runtimeCommand.name.replace(/^skill:/, "").toLowerCase());
  }

  return [...aliases].filter(Boolean);
}

function describeProvider(provider: RuntimeProviderRecord): string {
  if (provider.authSource === "oauth") {
    return t("composer.commands.provider.oauthConnected");
  }
  if (provider.authSource === "auth_file") {
    return t("composer.commands.provider.savedApiKey");
  }
  if (provider.authSource === "env") {
    return t("composer.commands.provider.environment");
  }
  if (provider.authSource === "external") {
    return t("composer.commands.provider.external");
  }
  if (provider.oauthSupported) {
    return t("composer.commands.provider.oauthAvailable");
  }
  if (provider.apiKeySetupSupported) {
    return t("composer.commands.provider.needsApiKey");
  }
  return t("composer.commands.provider.available");
}

function compareProviders(left: RuntimeProviderRecord, right: RuntimeProviderRecord): number {
  const leftRank = providerRank(left);
  const rightRank = providerRank(right);
  if (leftRank !== rightRank) {
    return leftRank - rightRank;
  }
  return left.name.localeCompare(right.name);
}

function providerRank(provider: RuntimeProviderRecord): number {
  if (provider.hasAuth) {
    return 0;
  }
  if (provider.id === "openai" || provider.id === "openai-codex" || provider.id === "anthropic") {
    return 1;
  }
  if (provider.oauthSupported) {
    return 2;
  }
  return 3;
}

function providerRankForId(
  providers: readonly RuntimeProviderRecord[],
  providerId: string,
): number {
  const provider = providers.find((entry) => entry.id === providerId);
  return provider ? providerRank(provider) : 99;
}

function summarizeSkillDescription(value: string): string {
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!trimmed) {
    return t("composer.commands.reusableWorkflow");
  }

  const firstSentence = trimmed.match(/^[^.!?]+[.!?]?/)?.[0]?.trim() ?? trimmed;
  return firstSentence.length > 96 ? `${firstSentence.slice(0, 93).trimEnd()}...` : firstSentence;
}

function formatRuntimeCommandTitle(command: RuntimeCommandRecord): string {
  if (command.source === "skill" && command.name.startsWith("skill:")) {
    return titleCase(command.name.slice("skill:".length));
  }
  return titleCase(command.name.replace(/[:_-]+/g, " "));
}

function formatRuntimeCommandDescription(command: RuntimeCommandRecord): string {
  if (command.description?.trim()) {
    return command.description.trim();
  }
  if (command.source === "prompt") {
    return t("composer.commands.promptTemplate");
  }
  if (command.source === "skill") {
    return t("composer.commands.skillCommand");
  }
  return t("composer.commands.extensionCommand");
}

function formatRuntimeSourceLabel(command: RuntimeCommandRecord): string {
  if (command.source === "skill") {
    return t("composer.commands.sourceSkill");
  }
  if (command.source === "prompt") {
    return t("composer.commands.sourcePrompt");
  }
  return command.sourceInfo.source.replace(/^extension:/, "");
}

export function isExactSlashCommand(query: string, command: ComposerSlashCommand): boolean {
  return query.trim().toLowerCase() === command.command.toLowerCase();
}

export function parseTreeComposerCommand(
  value: string,
): { readonly type: "tree" } | { readonly type: "error"; readonly message: string } | undefined {
  const trimmed = value.trim();
  if (!trimmed.startsWith("/")) {
    return undefined;
  }

  const [command, ...rest] = trimmed.split(/\s+/);
  if (command !== "/tree") {
    return undefined;
  }

  if (rest.length > 0) {
    return {
      type: "error",
      message: t("composer.commands.treeArgError"),
    };
  }

  return { type: "tree" };
}
