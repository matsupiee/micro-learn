import type { ReactNode } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
  type TextStyle,
  type ImageStyle,
  type StyleProp,
} from "react-native";
import { art, type Art } from "./art";
export const bg = "#f3f3f3",
  ink = "#252421",
  cream = "#fcf2ca",
  brown = "#49311e",
  green = "#32935d",
  red = "#c52b43",
  paper = "#fffdf0";
export const styles = StyleSheet.create({
  fill: { flex: 1 },
  page: { flex: 1, paddingHorizontal: 24, paddingTop: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  spread: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  center: { alignItems: "center", justifyContent: "center" },
  card: { borderRadius: 22, backgroundColor: "#fff", padding: 18 },
  footer: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 14, gap: 12 },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
export function T({
  children,
  size = 16,
  bold,
  center,
  color = ink,
  style,
  lines,
}: {
  children: ReactNode;
  size?: number;
  bold?: boolean;
  center?: boolean;
  color?: string;
  style?: StyleProp<TextStyle>;
  lines?: number;
}) {
  return (
    <Text
      numberOfLines={lines}
      style={[
        {
          color,
          fontSize: size,
          lineHeight: Math.round(size * 1.35),
          textAlign: center ? "center" : "left",
          fontFamily: bold ? "Lexend_700Bold" : "Lexend_400Regular",
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
export function Rich({ value, size = 18 }: { value: string; size?: number }) {
  return (
    <T size={size}>
      {value.split("**").map((s, i) => (
        <Text key={i} style={{ fontFamily: i % 2 ? "Lexend_700Bold" : "Lexend_400Regular" }}>
          {s}
        </Text>
      ))}
    </T>
  );
}
export function Pic({
  name,
  w,
  h,
  style,
  cover = false,
}: {
  name: Art;
  w?: number;
  h?: number;
  style?: StyleProp<ImageStyle>;
  cover?: boolean;
}) {
  return (
    <Image
      accessible={false}
      source={art[name]}
      resizeMode={cover ? "cover" : "contain"}
      style={[{ width: w ?? "100%", height: h, alignSelf: "center" }, style]}
    />
  );
}
export function Tap({
  children,
  onPress,
  label,
  style,
  disabled = false,
}: {
  children: ReactNode;
  onPress: () => void;
  label?: string;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [style, { opacity: disabled ? 0.48 : pressed ? 0.75 : 1 }]}
    >
      {children}
    </Pressable>
  );
}
export function Button({
  title,
  onPress,
  disabled,
  color = "#303030",
  style,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  color?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Tap
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.center,
        {
          minHeight: 58,
          borderRadius: 32,
          backgroundColor: color,
          borderBottomWidth: 3,
          borderBottomColor: "#0005",
          paddingHorizontal: 10,
        },
        style,
      ]}
    >
      <T center bold color="white" size={18}>
        {title}
      </T>
    </Tap>
  );
}
export function LinkButton({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Tap onPress={onPress} style={{ padding: 8 }}>
      <T bold center size={15}>
        {title}
      </T>
    </Tap>
  );
}
export function Circle({
  title,
  label,
  onPress,
  disabled,
  size = 42,
}: {
  title: string;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  size?: number;
}) {
  return (
    <Tap
      label={label}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.center,
        {
          height: size,
          minWidth: size,
          paddingHorizontal: 8,
          borderRadius: size / 2,
          backgroundColor: paper,
          boxShadow: "0 3px 12px #0001",
        },
      ]}
    >
      <T bold size={21}>
        {title}
      </T>
    </Tap>
  );
}
export function Bar({ value }: { value: number }) {
  return (
    <View
      style={{
        height: 4,
        backgroundColor: "#0001",
        borderRadius: 4,
        overflow: "hidden",
        marginVertical: 10,
      }}
    >
      <View style={{ width: `${Math.min(1, value) * 100}%`, height: 4, backgroundColor: ink }} />
    </View>
  );
}
export function Footer({ children }: { children: ReactNode }) {
  return <View style={styles.footer}>{children}</View>;
}
export function Body({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[
        { paddingHorizontal: 24, paddingTop: 14, paddingBottom: 20, gap: 12, flexGrow: 1 },
        style,
      ]}
    >
      {children}
    </ScrollView>
  );
}
