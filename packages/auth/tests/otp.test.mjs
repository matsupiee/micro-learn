import { describe, it, after, before } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";
import { createAuth } from "../src/index.ts";
const dbRequire = createRequire(new URL("../../db/package.json", import.meta.url));
const { drizzle } = dbRequire("drizzle-orm/libsql"),
  { migrate } = dbRequire("drizzle-orm/libsql/migrator");
const dir = mkdtempSync(join(tmpdir(), "learn-otp-"));
const db = drizzle("file:" + join(dir, "otp.db"));
const auth = createAuth(
  {
    BETTER_AUTH_URL: "http://localhost:3000",
    BETTER_AUTH_SECRET: "test-only-strong-random-secret-64-characters-long",
    CORS_ORIGIN: "http://localhost:8081",
    OTP_EMAIL_API_KEY: "test",
    OTP_EMAIL_FROM: "test@example.org",
  },
  db,
);
describe("email sign-in", () => {
  before(() =>
    migrate(db, { migrationsFolder: new URL("../../db/src/migrations", import.meta.url).pathname }),
  );
  after(() => {
    db.$client.close();
    rmSync(dir, { recursive: true, force: true });
  });
  it("delivers a code, rejects an incorrect code, signs in once and rejects replay", async (t) => {
    const email = "reader@example.org";
    let code;
    t.mock.method(globalThis, "fetch", async (url, request) => {
      assert.equal(url, "https://api.resend.com/emails");
      const msg = JSON.parse(request.body);
      assert.deepEqual(msg.to, [email]);
      code = msg.text.match(/\b\d{6}\b/)[0];
      return new Response("{}", { status: 200 });
    });
    await auth.api.sendVerificationOTP({ body: { email, type: "sign-in" } });
    assert.match(code, /^\d{6}$/);
    const signin = (otp) => auth.api.signInEmailOTP({ body: { email, otp } });
    await assert.rejects(signin(code === "000000" ? "111111" : "000000"));
    const result = await signin(code);
    assert.equal(result.user.email, email);
    await assert.rejects(signin(code));
  });
});
