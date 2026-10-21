import type { StartupDiagnostic } from "../../contracts/desktop-state";
import { useI18n } from "../i18n";

/** Lists the saved workspaces the main process could not refresh at startup. */
export function StartupDiagnostics({
  diagnostics,
}: {
  readonly diagnostics: readonly StartupDiagnostic[];
}) {
  const { t } = useI18n();
  const details = diagnostics
    .map((diagnostic) => {
      const workspaceName = diagnostic.workspacePath?.split(/[\\/]/).filter(Boolean).at(-1);
      return workspaceName
        ? t("app.startupDiagnostics.workspaceUnavailable", { name: workspaceName })
        : diagnostic.message;
    })
    .join(" ");

  return (
    <div className="startup-diagnostics" role="status" data-testid="startup-diagnostics">
      <strong>{t("app.startupDiagnostics.title")}</strong>
      <span>{details}</span>
    </div>
  );
}
