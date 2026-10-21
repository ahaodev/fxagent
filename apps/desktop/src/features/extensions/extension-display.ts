import type {
  RuntimeExtensionRecord,
  RuntimeSourceScope,
} from "@pi-gui/session-driver/runtime-types";
import { t } from "../../i18n";

/** Grouping of extensions in the customize page: where one was discovered, or which pi adds it. */
export type ExtensionGroupKey = RuntimeSourceScope | "pi-addons" | "pi-gui-tools";

export function extensionSourceSummary(extension: RuntimeExtensionRecord): string {
  return `${extensionScopeLabel(extension)} · ${extension.sourceInfo.origin}`;
}

/** Extensions pi-gui itself adds to every session; switched on and off app-wide. */
export function isPiGuiBuiltinExtension(extension: RuntimeExtensionRecord): boolean {
  return (
    extension.sourceInfo.source === "builtin" &&
    extension.sourceInfo.origin === "top-level" &&
    extension.sourceInfo.scope === "temporary"
  );
}

/**
 * pi's own add-ons (MCP, code mode, tool search), named `builtin:<name>`. Their switch writes
 * pi's `extensions` setting, so terminal pi follows it too.
 */
export function isPiAddonExtension(extension: RuntimeExtensionRecord): boolean {
  return extension.sourceInfo.source === "builtin" && extension.path.startsWith("builtin:");
}

export function extensionScopeLabel(extension: RuntimeExtensionRecord): string {
  if (isPiGuiBuiltinExtension(extension) || isPiAddonExtension(extension)) {
    return extensionGroupLabel(extension);
  }
  return sourceScopeLabel(extension.sourceInfo.scope);
}

/** Group heading for where a skill or extension was discovered. */
export function sourceScopeGroupLabel(scope: RuntimeSourceScope): string {
  switch (scope) {
    case "project":
      return t("extensions.display.groupWorkspace");
    case "user":
      return t("extensions.display.groupUser");
    case "temporary":
      return t("extensions.display.groupSession");
  }
}

/** The runtime's own scope word, shown where a skill or extension came from. */
function sourceScopeLabel(scope: RuntimeSourceScope): string {
  switch (scope) {
    case "project":
      return t("extensions.display.scopeProject");
    case "user":
      return t("extensions.display.scopeUser");
    case "temporary":
      return t("extensions.display.scopeTemporary");
  }
}

export function extensionGroupKey(extension: RuntimeExtensionRecord): ExtensionGroupKey {
  if (isPiGuiBuiltinExtension(extension)) return "pi-gui-tools";
  if (isPiAddonExtension(extension)) return "pi-addons";
  return extension.sourceInfo.scope;
}

export function extensionGroupKeyLabel(key: ExtensionGroupKey): string {
  if (key === "pi-gui-tools") return t("extensions.display.piGuiTools");
  if (key === "pi-addons") return t("extensions.display.piAddons");
  return sourceScopeGroupLabel(key);
}

export function extensionGroupLabel(extension: RuntimeExtensionRecord): string {
  return extensionGroupKeyLabel(extensionGroupKey(extension));
}
