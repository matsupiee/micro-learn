import { sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { recordColumns, userReference } from "./columns";

export const readingEdit = sqliteTable("reading_edit", {
  ...recordColumns(),
  userId: userReference(),
  editId: text("edit_id").notNull(),
}, (t) => [uniqueIndex("reading_edit_user_edit").on(t.userId, t.editId)]);
