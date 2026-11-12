import { useFonts } from "expo-font";
import { Lexend_400Regular } from "@expo-google-fonts/lexend/400Regular";
import { Lexend_700Bold } from "@expo-google-fonts/lexend/700Bold";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
export default function Layout() {
  const [loaded, error] = useFonts({ Lexend_400Regular, Lexend_700Bold });
  if (!loaded && !error) return null;
  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
