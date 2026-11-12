import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Library } from "@/features/learn/Library";
import { Onboarding } from "@/features/learn/Onboarding";
import { initial, storageKey, type Profile } from "@/features/learn/state";
import { Pic, T, bg, styles } from "@/features/learn/ui";
export default function Learn() {
  const [profile, setProfile] = useState<Profile | null>(null),
    [storageError, setStorageError] = useState(false),
    writes = useRef(Promise.resolve());
  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(storageKey)
      .then((value) => {
        if (mounted) setProfile({ ...initial, ...(value ? JSON.parse(value) : {}) });
      })
      .catch(() => {
        if (mounted) {
          setStorageError(true);
          setProfile(initial);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);
  useEffect(() => {
    if (!profile) return;
    writes.current = writes.current
      .then(() => AsyncStorage.setItem(storageKey, JSON.stringify(profile)))
      .catch(() => setStorageError(true));
  }, [profile]);
  const [surface, setSurface] = useState(bg);
  const update = useCallback(
    (change: Partial<Profile>) => setProfile((p) => ({ ...initial, ...p, ...change })),
    [],
  );
  return (
    <View style={{ flex: 1, alignItems: "center", backgroundColor: bg }}>
      <SafeAreaView
        style={{
          width: "100%",
          maxWidth: 480,
          flex: 1,
          backgroundColor: profile?.step === 9 && !profile.onboarded ? "#ccf5ff" : surface,
          paddingTop: Platform.OS === "web" ? 54 : 0,
          paddingBottom: Platform.OS === "web" ? 22 : 0,
        }}
      >
        <StatusBar style={surface === "#201f1e" ? "light" : "dark"} />
        {storageError && <T center>Device storage is unavailable. Progress may not be saved.</T>}
        {!profile ? (
          <View style={[styles.fill, styles.center]}>
            <Pic name="flame" h={110} w={95} />
          </View>
        ) : profile.onboarded ? (
          <Library p={profile} update={update} onSurface={setSurface} />
        ) : (
          <Onboarding p={profile} update={update} />
        )}
      </SafeAreaView>
    </View>
  );
}
