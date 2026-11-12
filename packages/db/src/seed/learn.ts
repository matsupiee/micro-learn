import { initial, dateKey } from "../../../../apps/native/features/learn/state";
import { groups } from "../../../../apps/native/features/learn/catalog";
// Device-local story fixtures, in the same format as AsyncStorage.
const stage = process.argv[2] ?? "new";
if (!["new", "home", "finished"].includes(stage)) throw new Error("Choose new, home, or finished");
const data = {
  ...initial,
  onboarded: stage !== "new",
  topics: stage === "new" ? [] : groups["Recommended for you"],
  ...(stage === "finished"
    ? {
        completed: ["think.0"],
        bookmark: ["think.0"],
        days: [dateKey()],
        ratings: { "think.0": 5 },
      }
    : {}),
};
process.stdout.write(JSON.stringify(data) + "\n");
