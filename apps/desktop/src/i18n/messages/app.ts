export const enMessages = {
  "app.topbar.openFolder": "Open a folder to begin",
  "app.topbar.newThread": "New thread",
  "app.topbar.toggleSidePanel": "Toggle side panel",
  "app.topbar.hideSidePanel": "Hide side panel",
  "app.topbar.showSidePanel": "Show side panel",

  "app.shell.threadActions": "Thread actions",
  "app.shell.schemaSkewNotice":
    "This session was written by a newer version of pi — some content may not display. Update fxagent (or open it with the pi CLI) to see everything.",
  "app.shell.dismiss": "Dismiss",
  "app.shell.dismissNotice": "Dismiss notice",
  "app.shell.fileCheckoutUnavailable": "This file checkout is unavailable.",

  "app.emptyCanvas.eyebrow": "Workspace",
  "app.emptyCanvas.openFolderTitle": "Open a folder to start",
  "app.emptyCanvas.addProjectFolderBody": "Add a project folder before creating a new thread.",
  "app.emptyCanvas.addProjectFoldersBody":
    "Add project folders, group sessions under them, and jump between threads from the sidebar.",
  "app.emptyCanvas.createThreadBody":
    "Create a thread for this folder, then jump between sessions from the sidebar.",
  "app.emptyCanvas.newThread": "New thread",

  "app.startupDiagnostics.title": "Some saved workspaces could not be refreshed.",
  "app.startupDiagnostics.workspaceUnavailable": "{name} is unavailable.",

  "app.startup.loadingTitle": "Loading sessions",
  "app.startup.loadingBody":
    "The desktop shell is restoring folder and thread state from the main process.",
  "app.startup.restoreFailedTitle": "Couldn't restore sessions",
  "app.startup.restoreFailedBody":
    "The desktop shell couldn't read folder and thread state. Retry, or relaunch the app.",
  "app.startup.bridgeFailedBody": "The desktop shell isn't connected. Quit fxagent and reopen it.",
  "app.startup.crashedTitle": "Something went wrong",
  "app.startup.crashedBody":
    "The desktop window hit an unexpected error. Retry to remount, or relaunch the app.",
  "app.startup.retry": "Retry",
  "app.startup.retrying": "Retrying…",
  "app.startup.relaunch": "Relaunch fxagent",

  "app.secondarySurface.back": "Back to app",
  "app.secondarySurface.sectionsLabel": "{title} sections",
  "app.secondarySurface.searchLabel": "Search {title}",
  "app.secondarySurface.searchPlaceholder": "Search",
  "app.secondarySurface.noMatches": "No matches for “{query}”",

  "app.secondarySurfaces.settingsTitle": "Settings",
  "app.secondarySurfaces.workspaceLabel": "Workspace",
  "app.secondarySurfaces.selectWorkspaceFirst": "Select a workspace first.",

  "app.diff.unmodifiedLine": "{count} unmodified line",
  "app.diff.unmodifiedLines": "{count} unmodified lines",

  "app.relativeTime.now": "now",
  "app.relativeTime.minutes": "{count}m",
  "app.relativeTime.hours": "{count}h",
  "app.relativeTime.days": "{count}d",
  "app.relativeTime.weeks": "{count}w",
  "app.relativeTime.months": "{count}mo",
  "app.relativeTime.years": "{count}y",
} as const;

export const zhMessages: Record<keyof typeof enMessages, string> = {
  "app.topbar.openFolder": "打开文件夹以开始",
  "app.topbar.newThread": "新线程",
  "app.topbar.toggleSidePanel": "切换侧边栏",
  "app.topbar.hideSidePanel": "隐藏侧边栏",
  "app.topbar.showSidePanel": "显示侧边栏",

  "app.shell.threadActions": "线程操作",
  "app.shell.schemaSkewNotice":
    "这个会话由更新版本的 pi 写入，部分内容可能无法显示。请更新 fxagent（或使用 pi CLI 打开）以查看全部内容。",
  "app.shell.dismiss": "忽略",
  "app.shell.dismissNotice": "忽略提示",
  "app.shell.fileCheckoutUnavailable": "这个文件检出不可用。",

  "app.emptyCanvas.eyebrow": "工作区",
  "app.emptyCanvas.openFolderTitle": "打开文件夹以开始",
  "app.emptyCanvas.addProjectFolderBody": "创建新线程前，请先添加项目文件夹。",
  "app.emptyCanvas.addProjectFoldersBody":
    "添加项目文件夹，将会话归入其中，然后从侧边栏在线程之间切换。",
  "app.emptyCanvas.createThreadBody": "为这个文件夹创建线程，然后从侧边栏在会话之间切换。",
  "app.emptyCanvas.newThread": "新线程",

  "app.startupDiagnostics.title": "部分已保存的工作区无法刷新。",
  "app.startupDiagnostics.workspaceUnavailable": "{name} 不可用。",

  "app.startup.loadingTitle": "正在加载会话",
  "app.startup.loadingBody": "桌面外壳正在从主进程恢复文件夹和线程状态。",
  "app.startup.restoreFailedTitle": "无法恢复会话",
  "app.startup.restoreFailedBody": "桌面外壳无法读取文件夹和线程状态。请重试，或重新启动应用。",
  "app.startup.bridgeFailedBody": "桌面外壳未连接。请退出 fxagent 后重新打开。",
  "app.startup.crashedTitle": "出了点问题",
  "app.startup.crashedBody": "桌面窗口遇到意外错误。重试以重新挂载，或重新启动应用。",
  "app.startup.retry": "重试",
  "app.startup.retrying": "正在重试…",
  "app.startup.relaunch": "重新启动 fxagent",

  "app.secondarySurface.back": "返回应用",
  "app.secondarySurface.sectionsLabel": "{title}分区",
  "app.secondarySurface.searchLabel": "搜索{title}",
  "app.secondarySurface.searchPlaceholder": "搜索",
  "app.secondarySurface.noMatches": "没有匹配“{query}”的结果",

  "app.secondarySurfaces.settingsTitle": "设置",
  "app.secondarySurfaces.workspaceLabel": "工作区",
  "app.secondarySurfaces.selectWorkspaceFirst": "请先选择工作区。",

  "app.diff.unmodifiedLine": "{count} 行未修改",
  "app.diff.unmodifiedLines": "{count} 行未修改",

  "app.relativeTime.now": "刚刚",
  "app.relativeTime.minutes": "{count}分钟前",
  "app.relativeTime.hours": "{count}小时前",
  "app.relativeTime.days": "{count}天前",
  "app.relativeTime.weeks": "{count}周前",
  "app.relativeTime.months": "{count}个月前",
  "app.relativeTime.years": "{count}年前",
};
