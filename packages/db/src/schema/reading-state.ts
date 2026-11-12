import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { recordColumns, userReference } from "./columns";

export interface ReadingState {
  interests?: string[];
  picks?: string[];
  saved?: string[];
  completed?: string[];
  days?: string[];
  progress?: Record<string, number>;
  positions?: Record<string, number>;
  goal?: string;
  time?: string;
  onboarded?: boolean;
  onboardingStep?: number;
  recIndex?: number;
}
export const readingState = sqliteTable("reading_state", {
  ...recordColumns(),
  userId: userReference().unique(),
  revision: integer("revision").default(0).notNull(),
  state: text("state", { mode: "json" }).$type<ReadingState>().default({}).notNull(),
});
