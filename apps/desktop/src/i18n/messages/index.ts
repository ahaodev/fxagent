import * as app from "./app";
import * as common from "./common";
import * as commandPalette from "./command-palette";
import * as composer from "./composer";
import * as conversation from "./conversation";
import * as extensions from "./extensions";
import * as scheduled from "./scheduled";
import * as settings from "./settings";
import * as settingsProviders from "./settings-providers";
import * as threads from "./threads";
import * as workbench from "./workbench";

/*
 * Message tables are split by area so parallel edits never touch the same file.
 * Each area exports `enMessages` (the source of truth for its keys) and `zhMessages`, which must
 * define exactly the same keys (enforced by the type). Keys are dotted: "<area>.<thing>".
 * Placeholders use {name}, e.g. "Deleted {count} threads".
 */
export const enMessages = {
  ...app.enMessages,
  ...common.enMessages,
  ...commandPalette.enMessages,
  ...composer.enMessages,
  ...conversation.enMessages,
  ...extensions.enMessages,
  ...scheduled.enMessages,
  ...settings.enMessages,
  ...settingsProviders.enMessages,
  ...threads.enMessages,
  ...workbench.enMessages,
} as const;

export type MessageKey = keyof typeof enMessages;
export type MessageVars = Readonly<Record<string, string | number>>;

export const zhMessages: Record<MessageKey, string> = {
  ...app.zhMessages,
  ...common.zhMessages,
  ...commandPalette.zhMessages,
  ...composer.zhMessages,
  ...conversation.zhMessages,
  ...extensions.zhMessages,
  ...scheduled.zhMessages,
  ...settings.zhMessages,
  ...settingsProviders.zhMessages,
  ...threads.zhMessages,
  ...workbench.zhMessages,
};
