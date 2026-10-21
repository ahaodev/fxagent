import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import type { AppLanguage } from "../../contracts/desktop-state";
import { intlLocale, readLastLanguage, rememberLanguage } from "./language";
import { enMessages, zhMessages, type MessageKey, type MessageVars } from "./messages";

export type { MessageKey, MessageVars } from "./messages";
export { DEFAULT_LANGUAGE, intlLocale, languageNames, readLastLanguage } from "./language";

export type Translate = (key: MessageKey, vars?: MessageVars) => string;

export function translate(language: AppLanguage, key: MessageKey, vars?: MessageVars): string {
  const table = language === "zh-CN" ? zhMessages : enMessages;
  const template: string = table[key] ?? enMessages[key];
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

// Language of the most recently rendered provider. Lets code outside React (helpers that run
// during render) call `t` directly. Components should use `useI18n()` so they re-render on change.
let activeLanguage: AppLanguage = readLastLanguage();

/** Intl locale of the language currently shown. Prefer `useI18n().intlLocale` inside components. */
export function currentIntlLocale(): string {
  return intlLocale(activeLanguage);
}

/** Translate with the language currently shown. Prefer `useI18n().t` inside components. */
export function t(key: MessageKey, vars?: MessageVars): string {
  return translate(activeLanguage, key, vars);
}

interface I18nValue {
  readonly language: AppLanguage;
  readonly intlLocale: string;
  readonly t: Translate;
}

const I18nContext = createContext<I18nValue>({
  language: "en",
  intlLocale: intlLocale("en"),
  t: (key, vars) => translate("en", key, vars),
});

export function I18nProvider({
  language,
  children,
}: {
  readonly language: AppLanguage;
  readonly children: ReactNode;
}) {
  activeLanguage = language;

  useEffect(() => {
    rememberLanguage(language);
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<I18nValue>(
    () => ({
      language,
      intlLocale: intlLocale(language),
      t: (key, vars) => translate(language, key, vars),
    }),
    [language],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  return useContext(I18nContext);
}
