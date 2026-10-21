import type { ComponentType, ReactNode } from "react";
import { BUILTIN_TOOL_KINDS, type BuiltinToolKind } from "../../../contracts/workbench";
import { t, type MessageKey } from "../../i18n";
import { DiffIcon, FileIcon, TerminalIcon } from "../../ui/icons";

interface BuiltinToolDefinition {
  /** Message keys, read where the tool is drawn so a language switch applies at once. */
  readonly labelKey: MessageKey;
  /** Shown in the tool chooser. */
  readonly descriptionKey: MessageKey;
  readonly Icon: ComponentType;
  /** Key that toggles the tool with the platform modifier, when it has one. */
  readonly shortcutKey?: string;
}

/** Presentation for every built-in tool; a missing kind fails the build. */
export const BUILTIN_TOOLS = {
  files: {
    labelKey: "workbench.builtinTool.files.label",
    descriptionKey: "workbench.builtinTool.files.description",
    Icon: FileIcon,
  },
  changes: {
    labelKey: "workbench.builtinTool.changes.label",
    descriptionKey: "workbench.builtinTool.changes.description",
    Icon: DiffIcon,
    shortcutKey: "R",
  },
  terminal: {
    labelKey: "workbench.builtinTool.terminal.label",
    descriptionKey: "workbench.builtinTool.terminal.description",
    Icon: TerminalIcon,
    shortcutKey: "J",
  },
} as const satisfies Record<BuiltinToolKind, BuiltinToolDefinition>;

/** Chooser order follows the contract's kind list. */
export const BUILTIN_TOOL_ENTRIES: readonly (BuiltinToolDefinition & {
  readonly kind: BuiltinToolKind;
})[] = BUILTIN_TOOL_KINDS.map((kind) => ({ kind, ...BUILTIN_TOOLS[kind] }));

/** Tool name in the language on screen; call it while drawing, not at module load. */
export function builtinToolLabel(kind: BuiltinToolKind): string {
  return t(BUILTIN_TOOLS[kind].labelKey);
}

/** One-line tool purpose in the language on screen; call it while drawing. */
export function builtinToolDescription(kind: BuiltinToolKind): string {
  return t(BUILTIN_TOOLS[kind].descriptionKey);
}

/** The composition root supplies one panel per built-in tool; rendered only while selected. */
type BuiltinToolPanels = Record<BuiltinToolKind, () => ReactNode>;

/** Requires a panel for every built-in kind, so a new tool cannot silently render nothing. */
export function renderBuiltinToolPanel(
  kind: BuiltinToolKind,
  panels: BuiltinToolPanels,
): ReactNode {
  return panels[kind]();
}
