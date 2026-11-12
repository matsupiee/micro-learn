import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { recordColumns, userReference } from "./columns";

export const pushSubscription = sqliteTable("push_subscription", {
  ...recordColumns(),
  userId: userReference(),
  endpoint: text("endpoint").unique().notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  reminderTime: text("reminder_time").notNull(),
  timezone: text("timezone").notNull(),
  lastTestAt: integer("last_test_at", {mode:"timestamp_ms"}),
}, (t) => [index("push_subscription_user").on(t.userId)]);
