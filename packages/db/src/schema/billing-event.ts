import { sqliteTable, text, uniqueIndex, check } from "drizzle-orm/sqlite-core";
import { recordColumns } from "./columns";
import { billingProviders } from "./billing-provider";
import { sql } from "drizzle-orm";
export const billingEvent = sqliteTable("billing_event", {
  ...recordColumns(),
  provider: text("provider", { enum: billingProviders }).notNull(),
  eventId: text("event_id").notNull(),
}, (t) => [uniqueIndex("billing_event_provider_event").on(t.provider,t.eventId),check("billing_event_provider", sql`${t.provider} in ('stripe-test', 'stripe-live', 'demo')`)]);
