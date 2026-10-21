import type { SessionExtensionNoticeRecord } from "../../../contracts/desktop-state";
import { useI18n, type MessageKey } from "../../i18n";

// A level's prefix is the word terminal pi prints before a warning or error notify; info has none.
const LEVEL_PREFIX_KEY: Record<SessionExtensionNoticeRecord["level"], MessageKey | undefined> = {
  info: undefined,
  warning: "extensions.notices.warning",
  error: "extensions.notices.error",
};

/** Draws `ctx.ui.notify` toasts above the composer. Main adds and expires them. */
export function ExtensionNotices({
  notices,
}: {
  readonly notices?: readonly SessionExtensionNoticeRecord[];
}) {
  const { t } = useI18n();
  // The live region stays mounted so screen readers announce notices as they arrive.
  return (
    <div className="extension-notices" data-testid="extension-notices" role="status">
      {notices?.map((notice) => {
        const prefixKey = LEVEL_PREFIX_KEY[notice.level];
        return (
          <div
            className="extension-notice"
            data-level={notice.level}
            data-testid="extension-notice"
            key={notice.id}
          >
            {prefixKey ? <span className="extension-notice__level">{t(prefixKey)}</span> : null}
            <span className="extension-notice__message">{notice.message}</span>
          </div>
        );
      })}
    </div>
  );
}
