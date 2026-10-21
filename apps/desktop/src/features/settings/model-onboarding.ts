import type { RuntimeSnapshot } from "@pi-gui/session-driver/runtime-types";
import { t } from "../../i18n";
import { buildModelOptions } from "../conversation/composer-commands";

export type ModelOnboardingSettingsSection = "models" | "providers";

export interface ModelOnboardingNotice {
  readonly title: string;
  readonly description: string;
  readonly actionLabel: string;
  readonly actionSection: ModelOnboardingSettingsSection;
}

export interface ModelOnboardingState {
  readonly hasSelectableModels: boolean;
  readonly requiresModelSelection: boolean;
  readonly unselectedModelLabel: string;
  readonly emptyModelTitle: string;
  readonly emptyModelDescription: string;
  readonly notice?: ModelOnboardingNotice;
}

interface ModelSelectionInput {
  readonly provider: string | undefined;
  readonly modelId: string | undefined;
}

export function deriveModelOnboardingState(
  runtime: RuntimeSnapshot | undefined,
  currentSelection: ModelSelectionInput,
): ModelOnboardingState {
  const selectableModels = buildModelOptions(runtime);
  const selectableSet = new Set(
    selectableModels.map((model) => `${model.providerId}:${model.modelId}`),
  );
  const hasSelectableModels = selectableModels.length > 0;
  const connectedProviderCount =
    runtime?.providers.filter((provider) => provider.hasAuth).length ?? 0;
  const settingsDefault = {
    provider: runtime?.settings.defaultProvider,
    modelId: runtime?.settings.defaultModelId,
  };
  const hasDefaultModel = Boolean(settingsDefault.provider && settingsDefault.modelId);
  const defaultModelUsable = isUsableSelection(settingsDefault, selectableSet);
  const hasCurrentSelection = Boolean(currentSelection.provider && currentSelection.modelId);
  const currentSelectionUsable = isUsableSelection(currentSelection, selectableSet);

  if (!hasSelectableModels) {
    return {
      hasSelectableModels: false,
      requiresModelSelection: true,
      unselectedModelLabel: t("settings.onboarding.noModels.title"),
      emptyModelTitle: t("settings.onboarding.noModels.title"),
      emptyModelDescription:
        connectedProviderCount > 0
          ? t("settings.onboarding.noModels.descriptionWithProviders")
          : t("settings.onboarding.noModels.descriptionWithoutProviders"),
      notice:
        connectedProviderCount > 0
          ? {
              title: t("settings.onboarding.noModels.title"),
              description: t("settings.onboarding.noModels.noticeDescriptionDisabled"),
              actionLabel: t("settings.onboarding.openModelsSettings"),
              actionSection: "models",
            }
          : {
              title: t("settings.onboarding.noModels.title"),
              description: t("settings.onboarding.noModels.noticeDescriptionWithoutProviders"),
              actionLabel: t("settings.onboarding.openProvidersSettings"),
              actionSection: "providers",
            },
    };
  }

  if (hasCurrentSelection && !currentSelectionUsable) {
    return {
      hasSelectableModels: true,
      requiresModelSelection: true,
      unselectedModelLabel: t("settings.onboarding.pickModel"),
      emptyModelTitle: t("settings.onboarding.noModels.title"),
      emptyModelDescription: t("settings.onboarding.emptyModelDescription"),
      notice: {
        title: t("settings.onboarding.selectedUnavailable.title"),
        description: hasDefaultModel
          ? t("settings.onboarding.selectedUnavailable.descriptionWithDefault")
          : t("settings.onboarding.selectedUnavailable.descriptionWithoutDefault"),
        actionLabel: t("settings.onboarding.openModelsSettings"),
        actionSection: "models",
      },
    };
  }

  if (!hasDefaultModel) {
    return {
      hasSelectableModels: true,
      requiresModelSelection: !currentSelectionUsable,
      unselectedModelLabel: t("settings.onboarding.pickModel"),
      emptyModelTitle: t("settings.onboarding.noDefault.title"),
      emptyModelDescription: t("settings.onboarding.emptyModelDescription"),
      notice: currentSelectionUsable
        ? undefined
        : {
            title: t("settings.onboarding.noDefault.title"),
            description: t("settings.onboarding.noDefault.description"),
            actionLabel: t("settings.onboarding.openModelsSettings"),
            actionSection: "models",
          },
    };
  }

  if (!defaultModelUsable) {
    const defaultLabel = `${settingsDefault.provider}:${settingsDefault.modelId}`;
    return {
      hasSelectableModels: true,
      requiresModelSelection: !currentSelectionUsable,
      unselectedModelLabel: t("settings.onboarding.pickModel"),
      emptyModelTitle: t("settings.onboarding.defaultUnavailable.title"),
      emptyModelDescription: t("settings.onboarding.emptyModelDescription"),
      notice: {
        title: t("settings.onboarding.defaultUnavailable.title"),
        description: currentSelectionUsable
          ? t("settings.onboarding.defaultUnavailable.description", { model: defaultLabel })
          : t("settings.onboarding.defaultUnavailable.descriptionChooseModel", {
              model: defaultLabel,
            }),
        actionLabel: t("settings.onboarding.openModelsSettings"),
        actionSection: "models",
      },
    };
  }

  return {
    hasSelectableModels: true,
    requiresModelSelection: false,
    unselectedModelLabel: t("settings.onboarding.pickModel"),
    emptyModelTitle: t("settings.onboarding.noModels.title"),
    emptyModelDescription: t("settings.onboarding.emptyModelDescription"),
  };
}

function isUsableSelection(
  selection: ModelSelectionInput,
  selectableSet: ReadonlySet<string>,
): boolean {
  return Boolean(
    selection.provider &&
    selection.modelId &&
    selectableSet.has(`${selection.provider}:${selection.modelId}`),
  );
}
