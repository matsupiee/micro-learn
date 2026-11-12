import type { Book } from "./catalog";
export const storageKey = "learn.profile.v1";
export const initial = {
  step: 0,
  goal: "",
  picks: [] as Book[],
  rec: 0,
  topics: [] as string[],
  hour: 9,
  source: "",
  onboarded: false,
  trial: false,
  trialStart: 0,
  notice: false,
  bookmark: [] as string[],
  completed: [] as string[],
  days: [] as string[],
  ratings: {} as Record<string, number>,
  positions: {} as Record<string, number>,
  streakGoal: 0,
  scanned: [] as Book[],
};
export type Profile = typeof initial;
export type Update = (change: Partial<Profile>) => void;
export function toggle<T>(list: T[], v: T) {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}
export function dateKey(d = new Date()) {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}
export function streak(days: string[], now = new Date()) {
  const d = new Date(now);
  if (!days.includes(dateKey(d))) d.setDate(d.getDate() - 1);
  let count = 0;
  while (days.includes(dateKey(d))) {
    count++;
    d.setDate(d.getDate() - 1);
  }
  return count;
}
