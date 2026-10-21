import { useEffect, useState } from "react";
import type { RuntimeSnapshot } from "@pi-gui/session-driver/runtime-types";
import type { AppLanguage, ModelSettingsScopeMode } from "../../../contracts/desktop-state";
import { useI18n, languageNames } from "../../i18n";
import { SettingsSegmented, SettingsSwitch } from "./settings-controls";
import { SettingsGroup, SettingsRow } from "./settings-utils";

interface SettingsGeneralSectionProps {
  readonly runtime?: RuntimeSnapshot;
  readonly language: AppLanguage;
  readonly onSetLanguage: (language: AppLanguage) => void;
  readonly modelSettingsScopeMode: ModelSettingsScopeMode;
  readonly integratedTerminalShell: string;
  readonly onSetModelSettingsScopeMode: (mode: ModelSettingsScopeMode) => void;
  readonly onSetIntegratedTerminalShell: (shellPath: string) => void;
  readonly onToggleSkillCommands: (enabled: boolean) => void;
}

export function SettingsGeneralSection({
  runtime,
  language,
  onSetLanguage,
  modelSettingsScopeMode,
  integratedTerminalShell,
  onSetModelSettingsScopeMode,
  onSetIntegratedTerminalShell,
  onToggleSkillCommands,
}: SettingsGeneralSectionProps) {
  const { t } = useI18n();
  const [terminalShellDraft, setTerminalShellDraft] = useState(integratedTerminalShell);

  useEffect(() => {
    setTerminalShellDraft(integratedTerminalShell);
  }, [integratedTerminalShell]);

  const commitTerminalShellDraft = () => {
    if (terminalShellDraft !== integratedTerminalShell) {
      onSetIntegratedTerminalShell(terminalShellDraft);
    }
  };

  return (
    <>
      <SettingsGroup title={t("settings.general.interfaceGroup")}>
        <SettingsRow
          title={t("settings.general.language.title")}
          description={t("settings.general.language.description")}
        >
          <SettingsSegmented
            label={t("settings.general.language.label")}
            options={[
              { value: "en", label: languageNames.en },
              { value: "zh-CN", label: languageNames["zh-CN"] },
            ]}
            value={language}
            onChange={onSetLanguage}
          />
        </SettingsRow>
      </SettingsGroup>

      <SettingsGroup title="Agent">
        <SettingsRow
          title="Model settings scope"
          description="Apply the default model and enabled models everywhere, or set them per repo."
        >
          <SettingsSegmented
            label="Model settings scope"
            options={[
              { value: "app-global", label: "App global" },
              { value: "per-repo", label: "Per repo" },
            ]}
            value={modelSettingsScopeMode}
            onChange={onSetModelSettingsScopeMode}
          />
        </SettingsRow>
        <SettingsRow
          title="Skill slash commands"
          description="Offer each skill as a slash command in the composer."
        >
          <SettingsSwitch
            checked={runtime?.settings.enableSkillCommands ?? true}
            label="Enable skill slash commands"
            onChange={onToggleSkillCommands}
          />
        </SettingsRow>
      </SettingsGroup>

      <SettingsGroup title="Terminal">
        <SettingsRow
          title="Shell"
          description="The shell the integrated terminal starts. Leave blank to use your login shell."
        >
          <input
            aria-label="Shell of integrated terminal"
            className="settings-text-input"
            placeholder="/bin/zsh"
            spellCheck={false}
            type="text"
            value={terminalShellDraft}
            onBlur={commitTerminalShellDraft}
            onChange={(event) => setTerminalShellDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.currentTarget.blur();
              }
            }}
          />
        </SettingsRow>
      </SettingsGroup>
    </>
  );
}
