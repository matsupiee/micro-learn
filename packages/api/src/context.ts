import type { Session } from "@micro-learn/auth";
import type { Database } from "@micro-learn/db";

export type Context = {
  session: Session | null;
  db: Database;
};
