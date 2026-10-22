import type { FxagentDesktopApi } from "../contracts/ipc";

export {};

declare global {
  interface Window {
    fxagentApp?: FxagentDesktopApi;
  }
}
