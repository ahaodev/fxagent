export const enMessages = {
  "settings.general.interfaceGroup": "Interface",
  "settings.general.language.title": "Language",
  "settings.general.language.description":
    "The language used for the app interface and native menus.",
  "settings.general.language.label": "Display language",
} as const;

export const zhMessages: Record<keyof typeof enMessages, string> = {
  "settings.general.interfaceGroup": "界面",
  "settings.general.language.title": "语言",
  "settings.general.language.description": "应用界面和原生菜单使用的语言。",
  "settings.general.language.label": "显示语言",
};
