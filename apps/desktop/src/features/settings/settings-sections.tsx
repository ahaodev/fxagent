import type { ReactNode } from "react";
import { t } from "../../i18n";
import {
  BellIcon,
  ExtensionIcon,
  KeyboardIcon,
  ModelIcon,
  PlugIcon,
  SettingsIcon,
  SkillIcon,
  SunIcon,
} from "../../ui/icons";

export interface SettingsSectionDefinition {
  readonly id: string;
  readonly title: string;
  readonly group: string;
  readonly icon: ReactNode;
  /** Words people search for that are not in the title, such as the page's row titles. */
  readonly keywords: readonly string[];
  readonly description: (workspaceName: string) => string;
  /** Pages that read or write one workspace's runtime. */
  readonly needsWorkspace: boolean;
}

/*
 * Nav order: grouped the way Codex groups its settings, one entry per page.
 * Titles and groups are getters so the nav reads them with the language of the current render;
 * the nav is not a hook component, so it gets a plain string.
 */
export const SETTINGS_SECTIONS = [
  {
    id: "general",
    get title() {
      return t("settings.nav.general.title");
    },
    get group() {
      return t("settings.nav.group.app");
    },
    icon: <SettingsIcon />,
    keywords: ["model settings scope", "per repo", "skill slash commands", "terminal", "shell"],
    description: () => t("settings.nav.general.description"),
    needsWorkspace: false,
  },
  {
    id: "appearance",
    get title() {
      return t("settings.nav.appearance.title");
    },
    get group() {
      return t("settings.nav.group.app");
    },
    icon: <SunIcon />,
    keywords: ["theme", "light", "dark", "system", "preset", "colors", "transparency"],
    description: () => t("settings.nav.appearance.description"),
    needsWorkspace: false,
  },
  {
    id: "notifications",
    get title() {
      return t("settings.nav.notifications.title");
    },
    get group() {
      return t("settings.nav.group.app");
    },
    icon: <BellIcon />,
    keywords: ["alerts", "background", "completion", "failures", "approval", "macos"],
    description: () => t("settings.nav.notifications.description"),
    needsWorkspace: false,
  },
  {
    id: "shortcuts",
    get title() {
      return t("settings.nav.shortcuts.title");
    },
    get group() {
      return t("settings.nav.group.app");
    },
    icon: <KeyboardIcon />,
    keywords: ["keys", "hotkeys", "keybindings"],
    description: () => t("settings.nav.shortcuts.description"),
    needsWorkspace: false,
  },
  {
    id: "providers",
    get title() {
      return t("settings.nav.providers.title");
    },
    get group() {
      return t("settings.nav.group.agent");
    },
    icon: <PlugIcon />,
    keywords: ["login", "logout", "oauth", "api key", "auth", "custom endpoint"],
    description: (workspaceName) =>
      t("settings.nav.providers.description", { workspace: workspaceName }),
    needsWorkspace: true,
  },
  {
    id: "models",
    get title() {
      return t("settings.nav.models.title");
    },
    get group() {
      return t("settings.nav.group.agent");
    },
    icon: <ModelIcon />,
    keywords: ["default model", "reasoning", "thinking", "enabled models"],
    description: () => t("settings.nav.models.description"),
    needsWorkspace: true,
  },
  {
    id: "mcp",
    get title() {
      return t("settings.nav.mcp.title");
    },
    get group() {
      return t("settings.nav.group.agent");
    },
    icon: <ExtensionIcon />,
    keywords: ["mcp", "mcp.json", "model context protocol", "servers", "code mode", "codemode"],
    description: () => t("settings.nav.mcp.description"),
    needsWorkspace: true,
  },
] as const satisfies readonly SettingsSectionDefinition[];

export type SettingsSection = (typeof SETTINGS_SECTIONS)[number]["id"];

/** Skills and extensions live in the settings nav but are their own app views. */
export const CUSTOMIZE_SECTION_ID = "customize";

export const SETTINGS_NAV_ITEMS = [
  ...SETTINGS_SECTIONS,
  {
    id: CUSTOMIZE_SECTION_ID,
    get title() {
      return t("settings.nav.customize.title");
    },
    get group() {
      return t("settings.nav.group.customize");
    },
    icon: <SkillIcon />,
    keywords: ["skills", "extensions", "plugins", "slash commands", "tools"],
  },
] as const;

export function settingsSectionDefinition(section: SettingsSection): SettingsSectionDefinition {
  return SETTINGS_SECTIONS.find((definition) => definition.id === section) ?? SETTINGS_SECTIONS[0];
}

export function sectionTitle(section: SettingsSection): string {
  return settingsSectionDefinition(section).title;
}
