import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { expo } from "@better-auth/expo";
import type { Database } from "@micro-learn/db";
import * as schema from "@micro-learn/db/schema/auth";
import { emailOTP } from "better-auth/plugins";
import { betterAuth } from "better-auth";

export type AuthConfig = {
  BETTER_AUTH_URL: string;
  BETTER_AUTH_SECRET: string;
  CORS_ORIGIN: string;
  OTP_EMAIL_API_KEY?: string;
  OTP_EMAIL_FROM?: string;
};

export function createAuth(
  env: AuthConfig,
  database: Database,
  desktopOrigins: readonly string[] = [],
) {
  return betterAuth({
    database: drizzleAdapter(database, {
      provider: "sqlite",
      schema,
    }),
    trustedOrigins: [
      env.CORS_ORIGIN,
      ...desktopOrigins,
      "micro-learn://",
      "exp://",
      "http://localhost:8081",
    ],
    emailAndPassword: { enabled: true },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    advanced: {
      defaultCookieAttributes: {
        sameSite: "none",
        secure: true,
        httpOnly: true,
      },
    },
    plugins: [
      expo(),
      emailOTP({
        storeOTP: "hashed",
        async sendVerificationOTP({ email, otp }) {
          if (!env.OTP_EMAIL_API_KEY || !env.OTP_EMAIL_FROM)
            throw new Error("Email delivery is not configured");
          const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: "Bearer " + env.OTP_EMAIL_API_KEY,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: env.OTP_EMAIL_FROM,
              to: [email],
              subject: "Your Micro Learn sign-in code",
              text: "Your sign-in code is " + otp + ". It expires in 5 minutes.",
            }),
          });
          if (!response.ok) throw new Error("Could not deliver sign-in code");
        },
      }),
    ],
  });
}

export type Session = ReturnType<typeof createAuth>["$Infer"]["Session"];
