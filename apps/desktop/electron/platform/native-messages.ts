import type { AppLanguage } from "../../contracts/desktop-state";

/*
 * Text of native surfaces owned by the main process: the application menu, native dialogs and
 * notification titles/bodies. The renderer's React i18n cannot be used here, so this table mirrors
 * its shape (`enMessages` is the source of truth, `zhMessages` must cover exactly the same keys).
 * Callers pass the persisted language in and translate when a surface is shown, never at import.
 */
export const enMessages = {
  "native.common.ok": "OK",
  "native.common.cancel": "Cancel",
  "native.common.close": "Close",

  "native.menu.app.checkForUpdates": "Check for Updates…",
  "native.menu.file.title": "File",
  "native.menu.file.newThread": "New Thread",
  "native.menu.file.newWindow": "New Window",
  "native.menu.file.openFolder": "Open Folder…",
  "native.menu.view.title": "View",
  "native.menu.view.reload": "Reload",
  "native.menu.view.forceReload": "Force Reload",

  "native.dialog.mcpSignIn.message": "Open this MCP sign-in link yourself",
  "native.dialog.mcpSignIn.detail": "{reason} Check the link before you open it:\n\n{url}",
  "native.dialog.mcpSignIn.reasonHttpsOnly":
    "fxagent opens only https links, or http links on this computer.",
  "native.dialog.mcpSignIn.reasonBrowserFailed": "fxagent could not open your browser.",
  "native.dialog.mcpSignIn.copyLink": "Copy link",
  "native.dialog.openWorkspace.title": "Open workspace folder",
  "native.dialog.attachFiles.title": "Attach files",
  "native.dialog.update.availableMessage": "Version {version} is available.",
  "native.dialog.update.availableDetail": "You have {version}.",
  "native.dialog.update.download": "Download",
  "native.dialog.update.later": "Later",
  "native.dialog.update.upToDate": "You're up to date on version {version}.",
  "native.dialog.update.checkFailed": "Could not check for updates right now.",

  "native.notification.runCompleted": "Agent finished responding",
  "native.notification.untitledSession": "pi session",
  "native.notification.needsInput": "Needs your input",
  "native.notification.levelError": "Error",
  "native.notification.levelWarning": "Warning",
  "native.notification.levelBody": "{level}: {message}",
  "native.notification.updateAvailableTitle": "fxagent Release Available",
  "native.notification.updateAvailableBody":
    "Version {latestVersion} is available (you have {currentVersion}). Click to view the release.",

  "native.updateCheck.timedOut": "The update check timed out.",
  "native.updateCheck.unreachable": "The update check could not reach GitHub.",
  "native.updateCheck.noRelease": "No stable fxagent release has been published yet.",
  "native.updateCheck.httpStatus": "GitHub Releases returned {status}.",
  "native.updateCheck.unreadable": "GitHub Releases returned an unreadable response.",
  "native.updateCheck.noVersions": "GitHub Releases did not return any published versions.",

  "native.probe.invalidBaseUrl": "Base URL must start with http:// or https://",
  "native.probe.httpStatus": "{status} {statusText} from {target}",
  "native.probe.missingData": 'Response from {target} is missing a "data" array',
  "native.probe.timeout": "Timed out after 5s contacting {target}",
} as const;

export type NativeMessageKey = keyof typeof enMessages;
export type NativeMessageVars = Readonly<Record<string, string | number>>;

export const zhMessages: Record<NativeMessageKey, string> = {
  "native.common.ok": "确定",
  "native.common.cancel": "取消",
  "native.common.close": "关闭",

  "native.menu.app.checkForUpdates": "检查更新…",
  "native.menu.file.title": "文件",
  "native.menu.file.newThread": "新建线程",
  "native.menu.file.newWindow": "新建窗口",
  "native.menu.file.openFolder": "打开文件夹…",
  "native.menu.view.title": "视图",
  "native.menu.view.reload": "重新加载",
  "native.menu.view.forceReload": "强制重新加载",

  "native.dialog.mcpSignIn.message": "请自行打开这个 MCP 登录链接",
  "native.dialog.mcpSignIn.detail": "{reason} 打开前请检查该链接：\n\n{url}",
  "native.dialog.mcpSignIn.reasonHttpsOnly": "fxagent 只会打开 https 链接，或本机上的 http 链接。",
  "native.dialog.mcpSignIn.reasonBrowserFailed": "fxagent 无法打开你的浏览器。",
  "native.dialog.mcpSignIn.copyLink": "复制链接",
  "native.dialog.openWorkspace.title": "打开工作区文件夹",
  "native.dialog.attachFiles.title": "附加文件",
  "native.dialog.update.availableMessage": "版本 {version} 已可用。",
  "native.dialog.update.availableDetail": "你当前的版本是 {version}。",
  "native.dialog.update.download": "下载",
  "native.dialog.update.later": "稍后",
  "native.dialog.update.upToDate": "已是最新版本 {version}。",
  "native.dialog.update.checkFailed": "暂时无法检查更新。",

  "native.notification.runCompleted": "Agent 已完成回复",
  "native.notification.untitledSession": "pi 会话",
  "native.notification.needsInput": "需要你的输入",
  "native.notification.levelError": "错误",
  "native.notification.levelWarning": "警告",
  "native.notification.levelBody": "{level}：{message}",
  "native.notification.updateAvailableTitle": "fxagent 有新版本可用",
  "native.notification.updateAvailableBody":
    "版本 {latestVersion} 已可用（你当前是 {currentVersion}）。点击查看发布说明。",

  "native.updateCheck.timedOut": "检查更新超时。",
  "native.updateCheck.unreachable": "检查更新时无法连接 GitHub。",
  "native.updateCheck.noRelease": "fxagent 尚未发布稳定版本。",
  "native.updateCheck.httpStatus": "GitHub Releases 返回了 {status}。",
  "native.updateCheck.unreadable": "GitHub Releases 返回了无法读取的响应。",
  "native.updateCheck.noVersions": "GitHub Releases 没有返回任何已发布的版本。",

  "native.probe.invalidBaseUrl": "Base URL 必须以 http:// 或 https:// 开头",
  "native.probe.httpStatus": "{target} 返回了 {status} {statusText}",
  "native.probe.missingData": '{target} 的响应缺少 "data" 数组',
  "native.probe.timeout": "连接 {target} 超时（5 秒）",
};

/** Native text for `language`, falling back to English for anything the table does not cover. */
export function nativeT(
  language: AppLanguage,
  key: NativeMessageKey,
  vars?: NativeMessageVars,
): string {
  const table = language === "zh-CN" ? zhMessages : enMessages;
  const template: string = table[key] ?? enMessages[key];
  if (!vars) {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}
