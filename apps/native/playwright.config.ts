import { defineConfig } from "@playwright/test";
const port = 8199;
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  workers: 3,
  timeout: 65000,
  reporter: "list",
  use: {
    actionTimeout: 12000,
    baseURL: `http://127.0.0.1:${port}`,
    viewport: { width: 393, height: 852 },
    channel: "chrome",
  },
  webServer: {
    command: `bunx expo export --platform web --output-dir dist && python3 -m http.server ${port} --bind 127.0.0.1 --directory dist`,
    port,
    timeout: 180000,
  },
});
