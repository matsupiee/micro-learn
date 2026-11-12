/// <reference types="node" />
import { expect, test, type Page } from "@playwright/test";
import { execFileSync } from "node:child_process";
const button = (page: Page, name: string) => page.getByRole("button", { name, exact: true });
const tap = (page: Page, name: string) => button(page, name).click();
async function seed(page: Page, stage: string) {
  const data = execFileSync("bun", ["../../packages/db/src/seed/learn.ts", stage], {
    encoding: "utf8",
  });
  await page.addInitScript((value) => {
    if (!localStorage.getItem("learn.profile.v1")) localStorage.setItem("learn.profile.v1", value);
  }, data);
  await page.goto("/");
}
test("onboarding and discovery", async ({ page }) => {
  await page.goto("/");
  await tap(page, "Get Started");
  await tap(page, "Continue as guest");
  await tap(page, "Continue");
  await tap(page, "Replace social media");
  await tap(page, "Continue");
  await tap(page, "👍");
  await tap(page, "Continue");
  await tap(page, "Continue");
  await tap(page, "✓ Add");
  for (let i = 1; i < 8; i++) await tap(page, "× Skip");
  await tap(page, "Continue");
  await tap(page, "Continue");
  await expect(page.getByText("What topics are you interested in?")).toBeVisible();
  await tap(page, "Continue");
  await tap(page, "I’m ready");
  await tap(page, "Try for Free");
  await tap(page, "Start Your 7-Day Free Trial");
  await tap(page, "Continue");
  await tap(page, "Continue");
  await tap(page, "Cancel");
  await tap(page, "Google Search");
  await tap(page, "Continue");
  await tap(page, "Tap & hold to read");
  for (const name of ["Explore", "Library", "Profile", "Apps", "Home"])
    await page.getByRole("tab", { name, exact: true }).click();
  await tap(page, "Notifications");
  await expect(page.getByText(/All caught up/)).toBeVisible();
  await tap(page, "Back");
  await button(page, "Thinking, Fast and Slow").first().click();
  await expect(page.getByText("Catch your mind’s costly mistakes")).toBeVisible();
});
test("read, listen, save, rate, and open the streak calendar", async ({ page }) => {
  await seed(page, "home");
  await button(page, "Thinking, Fast and Slow").first().click();
  await tap(page, "Start book");
  await tap(page, "Play");
  await tap(page, "Pause");
  for (let i = 0; i < 7; i++) await tap(page, "Next page");
  await tap(page, "Save idea");
  await tap(page, "Continue");
  await tap(page, "5 stars");
  await page.getByRole("button", { name: /READING STREAK STARTED/ }).click();
  await tap(page, "Continue");
  await page.getByRole("button", { name: /🔥 1/ }).click();
  await tap(page, "Continue");
  await tap(page, "Continue");
  await page.getByRole("button", { name: /7 days/ }).click();
  await tap(page, "Continue");
  await expect(page.getByText("Streak Milestones", { exact: true })).toBeVisible();
  await tap(page, "Close milestones");
  await page.reload();
  await page.getByRole("tab", { name: "Library", exact: true }).click();
  await tap(page, "Read Later");
  await tap(page, "Meet Your Two Minds");
  await expect(button(page, "Next page")).toBeVisible();
});
test("search, empty stashes and camera permission entry", async ({ page }) => {
  await seed(page, "home");
  await page.getByRole("tab", { name: "Explore", exact: true }).click();
  await page.getByRole("button", { name: /Search\.\.\./ }).click();
  await page.getByPlaceholder("Search books or authors").fill("Kahneman");
  await expect(page.getByText("Thinking, Fast and Slow")).toBeVisible();
  await tap(page, "Back");
  await page.getByRole("tab", { name: "Library", exact: true }).click();
  await tap(page, "My Scanned Books");
  await expect(page.getByText(/No ideas saved here yet/)).toBeVisible();
  await tap(page, "Back");
  await page.getByRole("tab", { name: "Home", exact: true }).click();
  await tap(page, "Scan book");
  await expect(page.getByText(/Allow Deepstash to access/)).toBeVisible();
});
test("email form validates the address and consumes a six-digit sign-in code", async ({ page }) => {
  await page.route("**/api/auth/email-otp/send-verification-otp", (route) =>
    route.fulfill({ json: { success: true } }),
  );
  await page.route("**/api/auth/sign-in/email-otp", (route) =>
    route.fulfill({
      json: { token: "test-session", user: { id: "test-reader", email: "reader@example.org" } },
    }),
  );
  await page.goto("/");
  await tap(page, "Get Started");
  await tap(page, "Continue with email");
  await expect(button(page, "Continue")).toBeDisabled();
  await page.getByRole("textbox", { name: "Email address" }).fill("reader@example.org");
  await tap(page, "Continue");
  await page.getByRole("textbox", { name: "Verification code" }).fill("123456");
  await expect(page.getByText("Welcome!", { exact: true })).toBeVisible();
});
test("a second completion today preserves one streak day", async ({ page }) => {
  await seed(page, "finished");
  await page.getByRole("button", { name: /Thinking, Fast and Slow Daniel Kahneman/ }).click();
  await tap(page, "Continue book");
  await tap(page, "Next page");
  await tap(page, "Next page");
  await tap(page, "Continue");
  await tap(page, "4 stars");
  await expect(page.getByRole("button", { name: /READING STREAK STARTED/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /🔥 1/ })).toBeVisible();
});
