import { useEffect, useState } from "react";
import type { RuntimeSnapshot } from "@fxagent/session-driver/runtime-types";
import type { LanguagePreference, ModelSettingsScopeMode } from "../../../contracts/desktop-state";
import { useI18n, languageNames } from "../../i18n";
import { SettingsSegmented, SettingsSwitch } from "./settings-controls";
import { SettingsGroup, SettingsRow } from "./settings-utils";

interface SettingsGeneralSectionProps {
  readonly runtime?: RuntimeSnapshot;
  readonly languagePreference: LanguagePreference;
  readonly onSetLanguage: (languagePreference: LanguagePreference) => void;
  readonly modelSettingsScopeMode: ModelSettingsScopeMode;
  readonly integratedTerminalShell: string;
  readonly onSetModelSettingsScopeMode: (mode: ModelSettingsScopeMode) => void;
  readonly onSetIntegratedTerminalShell: (shellPath: string) => void;
  readonly onToggleSkillCommands: (enabled: boolean) => void;
}

export function SettingsGeneralSection({
  runtime,
  languagePreference,
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
              { value: "system", label: t("settings.general.language.system") },
              { value: "en", label: languageNames.en },
              { value: "zh-CN", label: languageNames["zh-CN"] },
            ]}
            value={languagePreference}
            onChange={onSetLanguage}
          />
        </SettingsRow>
      </SettingsGroup>

      <SettingsGroup title={t("settings.general.agentGroup")}>
        <SettingsRow
          title={t("settings.general.modelScope.title")}
          description={t("settings.general.modelScope.description")}
        >
          <SettingsSegmented
            label={t("settings.general.modelScope.title")}
            options={[
              { value: "app-global", label: t("settings.general.modelScope.appGlobal") },
              { value: "per-repo", label: t("settings.general.modelScope.perRepo") },
            ]}
            value={modelSettingsScopeMode}
            onChange={onSetModelSettingsScopeMode}
          />
        </SettingsRow>
        <SettingsRow
          title={t("settings.general.skillCommands.title")}
          description={t("settings.general.skillCommands.description")}
        >
          <SettingsSwitch
            checked={runtime?.settings.enableSkillCommands ?? true}
            label={t("settings.general.skillCommands.label")}
            onChange={onToggleSkillCommands}
          />
        </SettingsRow>
      </SettingsGroup>

      <SettingsGroup title={t("settings.general.terminalGroup")}>
        <SettingsRow
          title={t("settings.general.shell.title")}
          description={t("settings.general.shell.description")}
        >
          <input
            aria-label={t("settings.general.shell.label")}
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
