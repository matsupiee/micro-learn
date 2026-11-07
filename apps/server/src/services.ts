import { createAuth as createConfiguredAuth } from "@micro-learn/auth";
import { type Database, createDb } from "@micro-learn/db";

import { ENV } from "./env.server";

export function getDb(): Database {
  return createDb(ENV);
}
export async function createAuth(database?: Database) {
  return createConfiguredAuth(ENV, database ?? (await getDb()));
}
