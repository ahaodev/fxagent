import { isAppLanguage, resolveLanguage, type AppLanguage } from "../../contracts/desktop-state";

export const DEFAULT_LANGUAGE: AppLanguage = "en";

/** Language names are shown in their own script so they stay readable in any UI language. */
export const languageNames: Record<AppLanguage, string> = {
  en: "English",
  "zh-CN": "简体中文",
};

const STORAGE_KEY = "pi-gui:language";

/**
 * The language saved by the last session. Read at startup so the first paint is already in the
 * right language instead of flashing English until the main process answers.
 */
export function readLastLanguage(): AppLanguage {
  try {
    const stored = globalThis.localStorage?.getItem(STORAGE_KEY);
    return isAppLanguage(stored) ? stored : systemLanguage();
  } catch {
    return systemLanguage();
  }
}

/** The language the browser reports. Node (unit tests) also has a `navigator`, so require a window. */
function systemLanguage(): AppLanguage {
  const locale = typeof window === "undefined" ? undefined : window.navigator?.language;
  return resolveLanguage("system", locale);
}

export function rememberLanguage(language: AppLanguage): void {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, language);
  } catch {
    // Storage can be unavailable (privacy modes); the main process still persists the choice.
  }
}

/** BCP 47 tag for Intl formatting (dates, numbers, relative times). */
export function intlLocale(language: AppLanguage): string {
  return language === "zh-CN" ? "zh-CN" : "en-US";
}
