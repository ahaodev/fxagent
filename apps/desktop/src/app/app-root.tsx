import { I18nProvider, readLastLanguage } from "../i18n";
import App from "./App";
import { useDesktopAppState } from "./desktop-app-state";

/** Owns the app state and provides the UI language before any screen renders. */
export function AppRoot() {
  const desktop = useDesktopAppState();
  return (
    <I18nProvider language={desktop.snapshot?.language ?? readLastLanguage()}>
      <App desktop={desktop} />
    </I18nProvider>
  );
}
