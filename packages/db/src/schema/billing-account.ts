import { sqliteTable, text, integer, uniqueIndex, check } from "drizzle-orm/sqlite-core";
import { recordColumns, userReference } from "./columns";
import { billingProviders } from "./billing-provider";
import { sql } from "drizzle-orm";
export const billingAccount = sqliteTable("billing_account", {
  ...recordColumns(),
  userId: userReference(),
  provider: text("provider", { enum: billingProviders }).notNull(),
  customer: text("customer"),
  subscription: text("subscription"),
  status: text("status").default("free").notNull(),
  trialUsed: integer("trial_used", {mode:"boolean"}).default(false).notNull(),
  trialEnd: integer("trial_end", {mode:"timestamp_ms"}),
  periodEnd: integer("period_end", {mode:"timestamp_ms"}),
  cancelAtEnd: integer("cancel_at_end", {mode:"boolean"}).default(false).notNull(),
  pendingKey: text("pending_key"),
  pendingTrial: integer("pending_trial", {mode:"boolean"}),
  pendingStart: integer("pending_start", {mode:"timestamp_ms"}),
  pendingId: text("pending_id"),
}, (t) => [uniqueIndex("billing_account_user_provider").on(t.userId,t.provider), uniqueIndex("billing_account_provider_customer").on(t.provider,t.customer),check("billing_account_provider", sql`${t.provider} in ('stripe-test', 'stripe-live', 'demo')`)]);
