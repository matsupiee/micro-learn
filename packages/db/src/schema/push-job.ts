import { sqliteTable, text, integer, uniqueIndex, index, check } from "drizzle-orm/sqlite-core";
import { recordColumns } from "./columns";
import { sql } from "drizzle-orm";
import { pushSubscription } from "./push-subscription";
export const pushJob = sqliteTable("push_job", {
  ...recordColumns(),
  subscriptionId: text("subscription_id").notNull().references(() => pushSubscription.id,{onDelete:"cascade"}),
  kind: text("kind",{enum:["daily","trial"]}).notNull(),
  occurrence: text("occurrence").notNull(),
  availableAt: integer("available_at", {mode:"timestamp_ms"}).notNull(),
  expiresAt: integer("expires_at", {mode:"timestamp_ms"}).notNull(),
  attempts: integer("attempts").default(0).notNull(),
  lease: text("lease"),
  done: integer("done", {mode:"boolean"}).default(false).notNull(),
}, (t) => [uniqueIndex("push_job_occurrence").on(t.subscriptionId,t.kind,t.occurrence), index("push_job_due").on(t.done,t.availableAt),check("push_job_kind",sql`${t.kind} in ('daily','trial')`)]);
