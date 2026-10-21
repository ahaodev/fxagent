export const enMessages = {
  "common.cancel": "Cancel",
  "common.save": "Save",
  "common.delete": "Delete",
  "common.close": "Close",
  "common.loading": "Loading…",
} as const;

export const zhMessages: Record<keyof typeof enMessages, string> = {
  "common.cancel": "取消",
  "common.save": "保存",
  "common.delete": "删除",
  "common.close": "关闭",
  "common.loading": "加载中…",
};
