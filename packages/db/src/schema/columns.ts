import { createId } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm";
import { integer, text } from "drizzle-orm/sqlite-core";
import { user } from "./auth";

export function recordColumns() {
  const now = sql`(cast(unixepoch('subsecond') * 1000 as integer))`;
  return {
    id: text("id").$defaultFn(() => createId()).primaryKey(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).default(now).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).default(now).$onUpdate(() => new Date()).notNull(),
  };
}

export const userReference = () => text("user_id").notNull().references(() => user.id, { onDelete: "cascade" });
