import { expect, test } from "@playwright/test";
import { readAppEnv } from "../../electron/app-env";

test("desktop knobs read FXAGENT_ names and fall back to the legacy PI_APP_ names", () => {
  expect(readAppEnv("TEST_MODE", { FXAGENT_TEST_MODE: "background" })).toBe("background");
  expect(readAppEnv("TEST_MODE", { PI_APP_TEST_MODE: "foreground" })).toBe("foreground");
  expect(
    readAppEnv("TEST_MODE", { FXAGENT_TEST_MODE: "background", PI_APP_TEST_MODE: "foreground" }),
  ).toBe("background");
  expect(readAppEnv("TEST_MODE", {})).toBeUndefined();
});
