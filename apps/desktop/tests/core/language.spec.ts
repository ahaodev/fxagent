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

test("switches the UI language from Settings > General and keeps it across restarts", async () => {
  test.setTimeout(120_000);
  const userDataDir = await makeUserDataDir();
  const workspacePath = await makeWorkspace("language-workspace");

  const first = await launchDesktop(userDataDir, {
    initialWorkspaces: [workspacePath],
    testMode: "background",
  });
  try {
    const window = await first.firstWindow();
    await expect(window.locator("html")).toHaveAttribute("lang", "en");

    await window.getByRole("button", { name: "Settings", exact: true }).click();
    await expect(window.locator(".settings-view")).toBeVisible();
    const languageGroup = window.getByRole("group", { name: "Display language" });
    await expect(languageGroup).toBeVisible();
    await expect(languageGroup.getByRole("button", { name: "English" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await languageGroup.getByRole("button", { name: "简体中文" }).click();

    await expect.poll(async () => (await getDesktopState(window)).language).toBe("zh-CN");
    await expect(window.locator("html")).toHaveAttribute("lang", "zh-CN");
    await expect(window.locator(".settings-view")).toContainText("语言");
    await expect(window.locator(".settings-view")).toContainText("界面");
    // The custom application menu is macOS-only (Windows hides the menu bar), so only check it there.
    if (process.platform === "darwin") {
      await expect
        .poll(async () => menuLabels(first))
        .toEqual(expect.arrayContaining(["文件", "视图"]));
    }
    await expect(window.getByRole("group", { name: "显示语言" })).toBeVisible();
  } finally {
    await first.close();
  }

  // The choice is persisted by the main process, so a fresh launch starts in Chinese.
  const second = await launchDesktop(userDataDir, {
    initialWorkspaces: [workspacePath],
    testMode: "background",
  });
  try {
    const window = await second.firstWindow();
    await expect(window.locator("html")).toHaveAttribute("lang", "zh-CN");
    expect((await getDesktopState(window)).language).toBe("zh-CN");

    // The restored view may already be Settings (the active view is persisted too).
    if (!(await window.locator(".settings-view").isVisible())) {
      await window.getByRole("button", { name: "设置", exact: true }).click();
    }
    const languageGroup = window.getByRole("group", { name: "显示语言" });
    await expect(languageGroup).toBeVisible();
    await languageGroup.getByRole("button", { name: "English" }).click();

    await expect.poll(async () => (await getDesktopState(window)).language).toBe("en");
    await expect(window.locator("html")).toHaveAttribute("lang", "en");
    await expect(window.locator(".settings-view")).toContainText("Interface");
    if (process.platform === "darwin") {
      await expect
        .poll(async () => menuLabels(second))
        .toEqual(expect.arrayContaining(["File", "View"]));
    }
  } finally {
    await second.close();
  }
});
