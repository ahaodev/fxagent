import { currentIntlLocale, t } from "../i18n";

export function titleCase(value: string): string {
  return value
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatRelativeTime(value: string): string {
  if (!value) {
    return "";
  }

  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    return value;
  }

  // Counts are formatted for the UI locale; the unit and its word order come from the messages.
  const count = (amount: number) => amount.toLocaleString(currentIntlLocale());
  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));
  if (diffMinutes < 1) return t("app.relativeTime.now");
  if (diffMinutes < 60) return t("app.relativeTime.minutes", { count: count(diffMinutes) });
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return t("app.relativeTime.hours", { count: count(diffHours) });
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return t("app.relativeTime.days", { count: count(diffDays) });
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffDays < 30) return t("app.relativeTime.weeks", { count: count(diffWeeks) });
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return t("app.relativeTime.months", { count: count(diffMonths) });
  const diffYears = Math.floor(diffDays / 365);
  return t("app.relativeTime.years", { count: count(diffYears) });
}
