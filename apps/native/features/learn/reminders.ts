import { Platform } from "react-native";
export async function remind(hour: number) {
  if (Platform.OS === "web") return false;
  const n = await import("expo-notifications");
  if (!(await n.requestPermissionsAsync()).granted) return false;
  await n.scheduleNotificationAsync({
    identifier: "daily-reading",
    content: { title: "Fresh ideas", body: "Take a moment to discover your next idea." },
    trigger: { type: n.SchedulableTriggerInputTypes.DAILY, hour, minute: 0 },
  });
  return true;
}
export async function trialReminder(start: number) {
  if (Platform.OS === "web") return;
  const n = await import("expo-notifications");
  if (!(await n.getPermissionsAsync()).granted) return;
  const date = new Date(start);
  date.setDate(date.getDate() + 5);
  await n.scheduleNotificationAsync({
    identifier: "trial-reminder",
    content: { title: "Trial reminder", body: "Your seven-day trial ends in two days." },
    trigger: { type: n.SchedulableTriggerInputTypes.DATE, date },
  });
}
