import { expect, test, type ElectronApplication } from "@playwright/test";
import {
  getDesktopState,
  launchDesktop,
  makeUserDataDir,
  makeWorkspace,
} from "../helpers/electron-app";

async function menuLabels(harness: { electronApp: ElectronApplication }): Promise<string[]> {
  return harness.electronApp.evaluate(({ Menu }) =>
    (Menu.getApplicationMenu()?.items ?? []).map((item) => item.label),
  );
}

test("follows the system language until the user picks one, and keeps the pick across restarts", async () => {
  test.setTimeout(150_000);
  const userDataDir = await makeUserDataDir();
  const workspacePath = await makeWorkspace("language-workspace");
  const launch = (systemLocale: string) =>
    launchDesktop(userDataDir, {
      initialWorkspaces: [workspacePath],
      testMode: "background",
      envOverrides: { PI_APP_TEST_LOCALE: systemLocale },
    });

  // Fresh install on a Chinese system: the UI starts in Chinese with "System" selected.
  const first = await launch("zh-CN");
  try {
    const window = await first.firstWindow();
    await expect(window.locator("html")).toHaveAttribute("lang", "zh-CN");
    expect(await getDesktopState(window)).toMatchObject({
      languagePreference: "system",
      language: "zh-CN",
    });

    await window.getByRole("button", { name: "设置", exact: true }).click();
    const languageGroup = window.getByRole("group", { name: "显示语言" });
    await expect(languageGroup).toBeVisible();
    await expect(languageGroup.getByRole("button", { name: "跟随系统" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await languageGroup.getByRole("button", { name: "English" }).click();
    await expect.poll(async () => (await getDesktopState(window)).language).toBe("en");
    expect((await getDesktopState(window)).languagePreference).toBe("en");
    await expect(window.locator("html")).toHaveAttribute("lang", "en");
    if (process.platform === "darwin") {
      await expect
        .poll(async () => menuLabels(first))
        .toEqual(expect.arrayContaining(["File", "View"]));
    }
  } finally {
    await first.close();
  }

  // The explicit pick wins over the system language on the next launch.
  const second = await launch("zh-CN");
  try {
    const window = await second.firstWindow();
    await expect(window.locator("html")).toHaveAttribute("lang", "en");

    // The restored view may already be Settings (the active view is persisted too).
    if (!(await window.locator(".settings-view").isVisible())) {
      await window.getByRole("button", { name: "Settings", exact: true }).click();
    }
    const languageGroup = window.getByRole("group", { name: "Display language" });
    await expect(languageGroup).toBeVisible();
    await languageGroup.getByRole("button", { name: "System" }).click();

    await expect.poll(async () => (await getDesktopState(window)).language).toBe("zh-CN");
    expect((await getDesktopState(window)).languagePreference).toBe("system");
    await expect(window.locator("html")).toHaveAttribute("lang", "zh-CN");
    await expect(window.locator(".settings-view")).toContainText("语言");
    if (process.platform === "darwin") {
      await expect
        .poll(async () => menuLabels(second))
        .toEqual(expect.arrayContaining(["文件", "视图"]));
    }
  } finally {
    await second.close();
  }
});
