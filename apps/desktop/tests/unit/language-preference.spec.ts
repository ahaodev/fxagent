import { expect, test } from "@playwright/test";
import { isLanguagePreference, resolveLanguage } from "../../contracts/desktop-state";

test("system follows Chinese locales and falls back to English for everything else", () => {
  expect(resolveLanguage("system", "zh-CN")).toBe("zh-CN");
  expect(resolveLanguage("system", "zh")).toBe("zh-CN");
  expect(resolveLanguage("system", "zh_TW")).toBe("zh-CN");
  expect(resolveLanguage("system", "en-US")).toBe("en");
  expect(resolveLanguage("system", "fr-FR")).toBe("en");
  expect(resolveLanguage("system", "zhuang")).toBe("en");
  expect(resolveLanguage("system", undefined)).toBe("en");
});

test("an explicit choice ignores the system locale", () => {
  expect(resolveLanguage("en", "zh-CN")).toBe("en");
  expect(resolveLanguage("zh-CN", "en-US")).toBe("zh-CN");
});

test("only known preferences validate", () => {
  for (const value of ["system", "en", "zh-CN"]) {
    expect(isLanguagePreference(value)).toBe(true);
  }
  for (const value of ["", "zh", "EN", undefined, null, 1]) {
    expect(isLanguagePreference(value)).toBe(false);
  }
});
