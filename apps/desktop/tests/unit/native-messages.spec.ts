import { expect, test } from "@playwright/test";
import type { AppLanguage } from "../../contracts/desktop-state";
import {
  enMessages,
  nativeT,
  zhMessages,
  type NativeMessageKey,
} from "../../electron/platform/native-messages";

/**
 * Native surfaces (application menu, dialogs, notifications) cannot use the renderer's React i18n,
 * so their table is checked here: English is the source of truth and Chinese must cover every key.
 * Runs in Node — no app.
 */

const nativeKeys = Object.keys(enMessages) as NativeMessageKey[];

test("every native message key has an English and a Simplified Chinese value", () => {
  expect(nativeKeys.length).toBeGreaterThan(0);
  for (const key of nativeKeys) {
    expect(enMessages[key], `en ${key}`).not.toBe("");
    expect(zhMessages[key], `zh-CN ${key}`).toBeTruthy();
  }
  expect(Object.keys(zhMessages).sort()).toEqual([...nativeKeys].sort());
});

test("nativeT falls back to English for a language without its own table", () => {
  const unreviewedLanguage = "fr" as AppLanguage;
  expect(nativeT("en", "native.common.ok")).toBe("OK");
  expect(nativeT(unreviewedLanguage, "native.common.ok")).toBe("OK");
  expect(nativeT("zh-CN", "native.common.ok")).not.toBe(nativeT("en", "native.common.ok"));
});

test("nativeT substitutes {vars} and keeps placeholders it has no value for", () => {
  expect(nativeT("en", "native.dialog.update.availableMessage", { version: "1.2.3" })).toBe(
    "Version 1.2.3 is available.",
  );
  expect(nativeT("en", "native.dialog.update.availableMessage", {})).toBe(
    "Version {version} is available.",
  );
  expect(
    nativeT("zh-CN", "native.notification.levelBody", { level: "错误", message: "爆炸" }),
  ).toBe("错误：爆炸");
});
