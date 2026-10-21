import type { ReactNode } from "react";
import { useI18n } from "../i18n";

function EmptyCanvasSection({
  title,
  body,
  action,
}: {
  readonly title: string;
  readonly body: string;
  readonly action?: ReactNode;
}) {
  const { t } = useI18n();
  return (
    <section className="canvas canvas--empty">
      <div className="empty-panel">
        <div className="session-header__eyebrow">{t("app.emptyCanvas.eyebrow")}</div>
        <h1>{title}</h1>
        <p>{body}</p>
        {action ? <div className="empty-panel__actions">{action}</div> : null}
      </div>
    </section>
  );
}

/** New thread screen while no project folder is open yet. */
export function NoProjectFolderCanvas() {
  const { t } = useI18n();
  return (
    <EmptyCanvasSection
      title={t("app.emptyCanvas.openFolderTitle")}
      body={t("app.emptyCanvas.addProjectFolderBody")}
    />
  );
}

/** Nothing is open yet, so the app shows how folders and threads fit together. */
export function NoWorkspaceCanvas() {
  const { t } = useI18n();
  return (
    <EmptyCanvasSection
      title={t("app.emptyCanvas.openFolderTitle")}
      body={t("app.emptyCanvas.addProjectFoldersBody")}
    />
  );
}

/** A workspace is open but it has no thread on screen. */
export function WorkspaceThreadsCanvas({
  workspaceName,
  onNewThread,
}: {
  readonly workspaceName: string;
  readonly onNewThread: () => void;
}) {
  const { t } = useI18n();
  return (
    <EmptyCanvasSection
      title={workspaceName}
      body={t("app.emptyCanvas.createThreadBody")}
      action={
        <button className="button button--primary" type="button" onClick={onNewThread}>
          {t("app.emptyCanvas.newThread")}
        </button>
      }
    />
  );
}
