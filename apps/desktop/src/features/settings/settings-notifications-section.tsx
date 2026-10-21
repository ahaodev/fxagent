import type { DesktopNotificationPermissionStatus } from "../../../contracts/ipc";
import type { NotificationPreferences } from "../../../contracts/desktop-state";
import { useI18n, type Translate } from "../../i18n";
import { SettingsSwitch } from "./settings-controls";
import { SettingsGroup, SettingsRow } from "./settings-utils";

interface SettingsNotificationsSectionProps {
  readonly notificationPreferences: NotificationPreferences;
  readonly notificationPermissionStatus: DesktopNotificationPermissionStatus;
  readonly notificationPermissionPending: boolean;
  readonly onSetNotificationPreferences: (preferences: Partial<NotificationPreferences>) => void;
  readonly onRequestNotificationPermission: () => void;
  readonly onOpenSystemNotificationSettings: () => void;
}

export function SettingsNotificationsSection({
  notificationPreferences,
  notificationPermissionStatus,
  notificationPermissionPending,
  onSetNotificationPreferences,
  onRequestNotificationPermission,
  onOpenSystemNotificationSettings,
}: SettingsNotificationsSectionProps) {
  const { t } = useI18n();
  const statusLabel = labelForPermissionStatus(t, notificationPermissionStatus);
  const statusDescription = descriptionForPermissionStatus(t, notificationPermissionStatus);
  const showAskMacOs = notificationPermissionStatus === "default";
  const showOpenSystemSettings = notificationPermissionStatus === "denied";
  const showRecoveryActions = showAskMacOs || showOpenSystemSettings;

  return (
    <>
      <SettingsGroup
        title={t("settings.notifications.systemGroup")}
        description={t("settings.notifications.systemGroupDescription")}
      >
        <SettingsRow
          title={t("settings.notifications.access.title")}
          description={statusDescription}
        >
          <span className="settings-row__value">{statusLabel}</span>
        </SettingsRow>
        {showRecoveryActions ? (
          <SettingsRow
            title={t("settings.notifications.ask.title")}
            description={
              showAskMacOs
                ? t("settings.notifications.ask.descriptionAsk")
                : t("settings.notifications.ask.descriptionDenied")
            }
          >
            <div className="settings-row__actions">
              {showAskMacOs ? (
                <button
                  className="button button--secondary"
                  disabled={notificationPermissionPending}
                  type="button"
                  onClick={onRequestNotificationPermission}
                >
                  {t("settings.notifications.ask.askMacOs")}
                </button>
              ) : null}
              {showOpenSystemSettings ? (
                <button
                  className="button button--secondary"
                  disabled={notificationPermissionPending}
                  type="button"
                  onClick={onOpenSystemNotificationSettings}
                >
                  {t("settings.notifications.ask.openSystemSettings")}
                </button>
              ) : null}
            </div>
          </SettingsRow>
        ) : null}
      </SettingsGroup>

      <SettingsGroup
        title={t("settings.notifications.inAppGroup")}
        description={t("settings.notifications.inAppGroupDescription")}
      >
        <SettingsRow
          title={t("settings.notifications.backgroundCompletion.title")}
          description={t("settings.notifications.backgroundCompletion.description")}
        >
          <SettingsSwitch
            checked={notificationPreferences.backgroundCompletion}
            label={t("settings.notifications.backgroundCompletion.title")}
            onChange={(checked) => onSetNotificationPreferences({ backgroundCompletion: checked })}
          />
        </SettingsRow>
        <SettingsRow
          title={t("settings.notifications.backgroundFailure.title")}
          description={t("settings.notifications.backgroundFailure.description")}
        >
          <SettingsSwitch
            checked={notificationPreferences.backgroundFailure}
            label={t("settings.notifications.backgroundFailure.title")}
            onChange={(checked) => onSetNotificationPreferences({ backgroundFailure: checked })}
          />
        </SettingsRow>
        <SettingsRow
          title={t("settings.notifications.attentionNeeded.title")}
          description={t("settings.notifications.attentionNeeded.description")}
        >
          <SettingsSwitch
            checked={notificationPreferences.attentionNeeded}
            label={t("settings.notifications.attentionNeeded.title")}
            onChange={(checked) => onSetNotificationPreferences({ attentionNeeded: checked })}
          />
        </SettingsRow>
      </SettingsGroup>
    </>
  );
}

function labelForPermissionStatus(
  t: Translate,
  status: DesktopNotificationPermissionStatus,
): string {
  switch (status) {
    case "granted":
      return t("settings.notifications.status.granted");
    case "denied":
      return t("settings.notifications.status.denied");
    case "default":
      return t("settings.notifications.status.default");
    case "unsupported":
      return t("settings.notifications.status.unsupported");
    default:
      return t("settings.notifications.status.checking");
  }
}

function descriptionForPermissionStatus(
  t: Translate,
  status: DesktopNotificationPermissionStatus,
): string {
  switch (status) {
    case "granted":
      return t("settings.notifications.statusDescription.granted");
    case "denied":
      return t("settings.notifications.statusDescription.denied");
    case "default":
      return t("settings.notifications.statusDescription.default");
    case "unsupported":
      return t("settings.notifications.statusDescription.unsupported");
    default:
      return t("settings.notifications.statusDescription.checking");
  }
}
