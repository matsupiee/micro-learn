import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { requireOptionalNativeModule } from "expo";
import { authClient } from "@/lib/auth-client";
import { goals, groups, suggestions } from "./catalog";
import { Recommendation } from "./Recommendation";
import Svg, { Circle as Ring } from "react-native-svg";
import { remind, trialReminder } from "./reminders";
import { toggle, type Profile, type Update } from "./state";
import {
  Bar,
  Body,
  Button,
  Circle,
  Footer,
  LinkButton,
  Pic,
  T,
  green,
  red,
  styles as s,
} from "./ui";
const sources = [
  "From a friend",
  "Google Search",
  "App Store",
  "Instagram",
  "Twitter",
  "Facebook",
  "Tiktok",
  "Paladin",
  "Other",
];
const benefits = [
  "Personalized Learning",
  "Unlimited Learning Journeys",
  "Save Unlimited Ideas",
  "Read Later",
  "Remove All Ads",
  "Full Reading History",
  "Listening to Ideas",
  "Profile Badge",
];
const benefitText = [
  "Get tailored recommendations from all 50+ topics & amp up your growth.",
  "Start as many journeys as you wish, concurrently. This unlocks the full power of Deepstash.",
  "Save every idea you like & find it later, organized.",
  "Finding something cool with no time for it now? Save it for later.",
  "Get more of the content you like, and none of the pesky distractions.",
  "Looking for something you came across last week? Look no further.",
  "Just press play and put your phone in your pocket.",
  "Give your profile a shiny badge to stand out.",
];
export function Onboarding({ p, update }: { p: Profile; update: Update }) {
  const { width, height } = useWindowDimensions(),
    w = Math.min(width, 480),
    step = p.step;
  const [slide, setSlide] = useState(0),
    [sheet, setSheet] = useState(""),
    [email, setEmail] = useState(""),
    [otp, setOtp] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [seconds, setSeconds] = useState(0),
    [progress, setProgress] = useState(0);
  const sceneWidth = useRef(w - 48);
  const go = (i: number) => {
      setSheet("");
      setError("");
      update({ step: i });
    },
    next = () => go(step + 1);
  const done = () => update({ onboarded: true });
  useEffect(() => {
    if (step !== 0) return;
    const t = setInterval(() => setSlide((v) => (v + 1) % 3), 2600);
    return () => clearInterval(t);
  }, [step]);
  useEffect(() => {
    if (!seconds) return;
    const t = setTimeout(() => setSeconds(seconds - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);
  useEffect(() => {
    if (step !== 11) return;
    const t = setInterval(() => setProgress((v) => Math.min(v + 2, 100)), 160);
    return () => clearInterval(t);
  }, [step]);
  useEffect(() => {
    if (step === 11 && progress === 100) update({ step: 12 });
  }, [step, progress, update]);
  async function verify(code?: string) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const result = code
        ? await authClient.signIn.emailOtp({ email: email.trim(), otp: code })
        : await authClient.emailOtp.sendVerificationOtp({ email: email.trim(), type: "sign-in" });
      if (result.error) throw new Error(result.error.message || "Please try again.");
      if (code) {
        go(2);
      } else {
        setOtp("");
        setSheet("code");
        setSeconds(30);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  const btn = (title = "Continue", fn = next, disabled = false) => (
    <Button {...{ title, onPress: fn, disabled }} />
  );
  const header = (title: string, sub?: string) => (
    <View style={{ gap: 12, marginBottom: 6 }}>
      <T bold size={25}>
        {title}
      </T>
      {sub && <T>{sub}</T>}
    </View>
  );
  const centered = { alignItems: "center" as const, justifyContent: "center" as const };
  const choice = (name: string, selected: boolean, fn: () => void) => (
    <Pressable
      key={name}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={fn}
      style={{
        backgroundColor: "white",
        borderColor: selected ? red : "transparent",
        borderWidth: 2,
        padding: 16,
        borderRadius: 32,
      }}
    >
      <T center bold>
        {name}
      </T>
    </Pressable>
  );
  const daily = async () => {
    setBusy(true);
    const notice = await remind(p.hour).catch(() => false);
    update({
      notice,
      step: 10,
      topics: p.topics.length ? p.topics : groups["Recommended for you"],
    });
    setBusy(false);
  };
  const startTrial = () => {
    const start = Date.now();
    update({ trial: true, trialStart: start, step: 15 });
    setSheet("");
    if (p.notice) void trialReminder(start).catch(() => {});
  };
  const purchase = async () => {
    setBusy(true);
    try {
      const module =
        Platform.OS === "ios"
          ? requireOptionalNativeModule<{ purchasePreview(): Promise<string> }>("LearnTrial")
          : null;
      const result = await module?.purchasePreview();
      if (result === "purchased") {
        startTrial();
      } else if (!result || result === "unavailable") {
        setSheet("purchase");
      }
    } catch {
      setSheet("purchase");
    } finally {
      setBusy(false);
    }
  };
  const trialEnd = new Date(p.trialStart || Date.now());
  trialEnd.setDate(trialEnd.getDate() + 7);
  const end = trialEnd.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  const decide = (add: boolean) => {
    if (suggestions[p.rec])
      update({ rec: p.rec + 1, picks: add ? [...p.picks, suggestions[p.rec]!] : p.picks });
  };
  const body = (() => {
    switch (step) {
      case 0:
        return (
          <>
            <View style={{ paddingHorizontal: 24 }}>
              <View style={s.row}>
                {[0, 1, 2].map((i) => (
                  <View key={i} style={{ flex: 1 }}>
                    <Bar value={i <= slide ? 1 : 0} />
                  </View>
                ))}
              </View>
              <Pic name="brand" w={156} h={46} style={{ alignSelf: "flex-start" }} />
            </View>
            <Pressable
              accessibilityLabel="Next introduction"
              accessibilityRole="button"
              onPress={() => setSlide((slide + 1) % 3)}
              style={{ flex: 1 }}
            >
              <Pic name={`intro${slide}` as "intro0"} h={Math.min(height * 0.43, w * 0.95)} />
              <T center bold size={25}>
                {
                  [
                    "Key Ideas from Books,\nPodcasts, and more",
                    "Listen or read\non the go & grow",
                    "Rated 4.8 / 5\nLoved by millions!",
                  ][slide]
                }
              </T>
              {slide === 0 && <Pic name="mensa" w={215} h={90} />}
            </Pressable>
            <Footer>{btn("Get Started")}</Footer>
          </>
        );
      case 1:
        return (
          <>
            <Body style={{ justifyContent: "center" }}>
              <Pic name="brand" w={160} h={46} style={{ alignSelf: "flex-start" }} />
              {header(
                "Start your journey",
                "Choose your favorite option to create an account & save your progress.",
              )}
            </Body>
            <Footer>
              {btn("Continue with email", () => setSheet("email"))}
              <LinkButton title="Continue as guest" onPress={next} />
            </Footer>
          </>
        );
      case 2:
        return (
          <>
            <Body style={{ alignItems: "center", justifyContent: "space-around" }}>
              <View>
                <T center bold size={25}>
                  Welcome!
                </T>
                <T center>Let’s start with a few questions to tailor your experience.</T>
              </View>
              <Pic name="welcome" h={Math.min(height * 0.32, 280)} />
              <Pic name="awards" h={Math.min(height * 0.25, 206)} />
            </Body>
            <Footer>{btn()}</Footer>
          </>
        );
      case 3:
        return (
          <>
            <Body>
              {header("What’s your main focus here?", "Choose the goal that matters most to you.")}
              <View style={s.wrap}>
                {goals.map((g, i) => (
                  <Pressable
                    accessibilityRole="button"
                    key={g}
                    onPress={() => update({ goal: g })}
                    style={[
                      s.card,
                      centered,
                      {
                        width: "48%",
                        height: 136,
                        gap: 8,
                        backgroundColor: g === p.goal ? "#ffdddd" : "white",
                        borderWidth: 2,
                        borderColor: g === p.goal ? red : "transparent",
                      },
                    ]}
                  >
                    <Pic name={`goal${i}` as "goal0"} w={46} h={46} />
                    <T center bold>
                      {g}
                    </T>
                  </Pressable>
                ))}
              </View>
            </Body>
            <Footer>
              <LinkButton title="I’m not sure, skip" onPress={next} />
              {btn("Continue", next, !p.goal)}
            </Footer>
          </>
        );
      case 4:
        return (
          <>
            <Body>
              <T bold size={25}>
                Do you feel that{" "}
                <T bold size={25} color={red}>
                  spending too much time
                </T>{" "}
                on social media affects your life?
              </T>
              <View style={[s.fill, centered]}>
                <Pic name="social" h={w * 0.86} />
              </View>
            </Body>
            <Footer>
              <View style={[s.row, s.card, { padding: 0, gap: 0 }]}>
                {["👎", "🔥", "👍"].map((v) => (
                  <Pressable
                    accessibilityRole="button"
                    key={v}
                    onPress={next}
                    style={{ flex: 1, padding: 14 }}
                  >
                    <T center size={30}>
                      {v}
                    </T>
                  </Pressable>
                ))}
              </View>
            </Footer>
          </>
        );
      case 5:
        return (
          <>
            <Body>
              <T bold size={25}>
                Deepstash is the best{" "}
                <T bold size={25} color={green}>
                  alternative to doom scrolling.
                </T>
              </T>
              <Pic name="bars" h={w * 0.83} />
            </Body>
            <Footer>{btn()}</Footer>
          </>
        );
      case 6:
        return (
          <>
            <Body>
              {header("That’s what\npeople told us")}
              <View style={[s.card, { gap: 12 }]}>
                <T color="#eda631" size={22}>
                  ★★★★★
                </T>
                <T>
                  I decided I wanted to{" "}
                  <T bold color={green}>
                    take a break from social media
                  </T>{" "}
                  and found this app as an alternative. It’s amazing.
                </T>
                <T>It’s like Instagram for helpful advice.</T>
                <T bold>FaithlessM</T>
              </View>
            </Body>
            <Pic name="rating" h={72} />
            <Footer>{btn()}</Footer>
          </>
        );
      case 7:
      case 8: {
        const b = suggestions[p.rec];
        return (
          <>
            <Body>
              {header(
                "Ok, here are some recommendations",
                "Pick what you’d like to dive into for your first reading journey.",
              )}
              <Recommendation book={b} onPick={decide} />
            </Body>
            <Footer>
              {b ? (
                <View style={s.row}>
                  <Button
                    title="×  Skip"
                    color={red}
                    style={s.fill}
                    onPress={() => decide(false)}
                  />
                  <Button
                    title="✓  Add"
                    color={green}
                    style={s.fill}
                    onPress={() => decide(true)}
                  />
                </View>
              ) : (
                btn("Continue", () => go(9))
              )}
            </Footer>
          </>
        );
      }
      case 9: {
        const setHour = (pos: number) =>
          update({
            hour: Math.min(23, Math.max(5, Math.round(5 + (18 * pos) / sceneWidth.current))),
          });
        return (
          <View style={s.fill}>
            <Body>
              {header(
                "Fresh ideas, delivered when?",
                "Ideas curated for you, delivered when you want them. You can also change this setting later.",
              )}
              <View style={s.fill} />
              <View
                accessible
                accessibilityRole="adjustable"
                accessibilityLabel="Delivery hour"
                accessibilityValue={{ min: 5, max: 23, now: p.hour }}
                accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
                onAccessibilityAction={(e) =>
                  setHour(
                    ((p.hour - 5 + (e.nativeEvent.actionName === "increment" ? 1 : -1)) *
                      sceneWidth.current) /
                      18,
                  )
                }
                onLayout={(e) => (sceneWidth.current = e.nativeEvent.layout.width)}
                onStartShouldSetResponder={() => true}
                onMoveShouldSetResponder={() => true}
                onResponderGrant={(e) => setHour(e.nativeEvent.locationX)}
                onResponderMove={(e) =>
                  setHour(e.nativeEvent.pageX - (width - sceneWidth.current) / 2)
                }
                style={{ height: 96, justifyContent: "center" }}
              >
                <View
                  pointerEvents="none"
                  style={{ height: 7, backgroundColor: "#aec8ab", borderRadius: 5 }}
                />
                <View
                  pointerEvents="none"
                  style={{
                    position: "absolute",
                    left: `${((p.hour - 5) / 18) * 90}%`,
                    top: -15,
                    alignItems: "center",
                  }}
                >
                  <View
                    style={[
                      s.center,
                      { backgroundColor: "#333", borderRadius: 19, width: 37, height: 40 },
                    ]}
                  >
                    <T bold color="white">
                      {p.hour % 12 || 12}
                    </T>
                  </View>
                  <View
                    style={{
                      borderTopWidth: 12,
                      borderTopColor: "#333",
                      borderLeftWidth: 6,
                      borderRightWidth: 6,
                      borderLeftColor: "transparent",
                      borderRightColor: "transparent",
                    }}
                  />
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: "white",
                      boxShadow: "0 4px 8px #0002",
                    }}
                  />
                </View>
              </View>
              <T center>8 AM　　　 12 PM　　　4 PM　　　8 PM</T>
            </Body>
            <Footer>{btn("Continue", daily, busy)}</Footer>
          </View>
        );
      }
      case 10:
        return (
          <>
            <Body>
              {header(
                "What topics are you interested in?",
                "Pick at least 3 and we’ll kickstart your journey in Deepstash.",
              )}
              {Object.entries(groups).map(([g, topics]) => (
                <View key={g} style={{ marginTop: 20, gap: 10 }}>
                  <T size={14} bold>
                    {g.toUpperCase()}
                  </T>
                  <View style={s.wrap}>
                    {topics.map((v, i) => (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityState={{ selected: p.topics.includes(v) }}
                        key={v}
                        onPress={() => update({ topics: toggle(p.topics, v) })}
                        style={{
                          backgroundColor: p.topics.includes(v) ? red : "white",
                          borderRadius: 24,
                          paddingVertical: 7,
                          paddingHorizontal: 12,
                          borderWidth: 1,
                          borderColor: "#ddd",
                        }}
                      >
                        <T color={p.topics.includes(v) ? "white" : undefined}>
                          {["🌱", "📚", "🧠", "💡", "📖", "🌍"][i % 6]} {v}
                        </T>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ))}
            </Body>
            <Footer>{btn("Continue", next, p.topics.length < 3)}</Footer>
          </>
        );
      case 11:
        return (
          <Body style={{ justifyContent: "space-around", alignItems: "center" }}>
            <View style={[s.center, { height: 155, width: 155, borderRadius: 80 }]}>
              <Svg width={155} height={155} style={{ position: "absolute" }}>
                <Ring
                  cx={77.5}
                  cy={77.5}
                  r={73}
                  fill="none"
                  stroke={green}
                  strokeWidth={5}
                  strokeDasharray={459}
                  strokeDashoffset={459 * (1 - progress / 100)}
                  rotation={-90}
                  origin="77.5,77.5"
                  strokeLinecap="round"
                />
              </Svg>
              <T size={39} bold color={green}>
                {progress}
              </T>
            </View>
            <T bold center size={20}>
              We’re creating a personalized experience for you
            </T>
            <View>
              <T bold center size={36} color={green}>
                {progress < 45 ? "10,000,000+" : progress < 75 ? "200,000+" : "4.8 App Rating"}
              </T>
              <T center>
                {progress < 45
                  ? "people in the Deepstash Community"
                  : progress < 75
                    ? "key ideas from books, podcasts, and more"
                    : "⭐️⭐️⭐️⭐️⭐️ 100K+ worldwide App Store ratings"}
              </T>
              <Pic
                name={progress < 45 ? "community" : progress < 75 ? "collection" : "press"}
                w={w - 32}
                h={height * 0.25}
              />
            </View>
          </Body>
        );
      case 12:
        return (
          <>
            <Body style={{ justifyContent: "center", paddingHorizontal: 40, gap: 18 }}>
              <T bold size={34}>
                How your{"\n"}free trial works
              </T>
              {[
                "Install Deepstash",
                "Today: Try Deepstash Pro",
                "Day 5: Trial reminder",
                "Day 7: Trial ends",
              ].map((v, i) => (
                <View key={v} style={[s.row, { alignItems: "flex-start" }]}>
                  <T color={i < 2 ? "#3487ae" : "#bbb"} size={28}>
                    {["●", "◉", "♧", "☆"][i]}
                  </T>
                  <View style={s.fill}>
                    <T
                      bold
                      color={i < 2 ? "#3487ae" : undefined}
                      style={{ textDecorationLine: i === 0 ? "line-through" : "none" }}
                      size={19}
                    >
                      {v}
                    </T>
                    <T>
                      {
                        [
                          "You’ve created your profile successfully.",
                          "Start learning something new through bite-sized ideas. It takes just 5 minutes per day.",
                          "We’ll remind you about your trial via notification. Cancel anytime in 15 seconds.",
                          "Your subscription will start on " + end + ".",
                        ][i]
                      }
                    </T>
                  </View>
                </View>
              ))}
            </Body>
            <Footer>{btn("I’m ready")}</Footer>
          </>
        );
      case 13:
        return (
          <>
            <Body style={centered}>
              <T size={25} center>
                You’ll get a reminder{" "}
                <T bold size={25}>
                  2 days
                </T>{" "}
                before your trial ends.
              </T>
              <T size={136}>🔔</T>
            </Body>
            <Footer>{btn("Try for Free")}</Footer>
          </>
        );
      case 14:
        return (
          <>
            <View style={{ alignItems: "flex-start", padding: 12 }}>
              <Circle title="×" label="Close trial" onPress={() => go(17)} />
            </View>
            <Body style={centered}>
              <T center size={24}>
                <T color={green} size={24}>
                  Try 7 days for free,
                </T>{" "}
                then ¥1,083 per month{" "}
                <T bold size={24}>
                  (billed yearly at ¥13,000)
                </T>
              </T>
              <LinkButton title="View all plans" onPress={() => setSheet("plans")} />
            </Body>
            <Footer>
              <LinkButton title="See what you get" onPress={() => setSheet("benefits")} />
              <T center>Two taps to start, super easy to cancel.</T>
              {btn("Start Your 7-Day Free Trial", purchase, busy)}
              <View style={[s.row, { justifyContent: "center" }]}>
                {["Terms of Service", "Privacy Policy", "FAQ Subscription"].map((v) => (
                  <Pressable key={v} onPress={() => setSheet(v)}>
                    <T size={11}>{v}</T>
                  </Pressable>
                ))}
              </View>
            </Footer>
          </>
        );
      case 15:
        return (
          <>
            <Body>
              <T bold size={24} center>
                Welcome to{"\n"}deepstash ᴾᴿᴼ
              </T>
              <Pic name="pro" h={220} />
              <T bold center size={23}>
                Enjoy your full benefits:
              </T>
              {benefits.map((v, i) => (
                <View key={v} style={[s.row, { margin: 7, gap: 18 }]}>
                  <T color={green}>✓　✦</T>
                  <View style={s.fill}>
                    <T bold color={[green, "#cfa530", "#c68538", red, "#bf2060", "#28779c"][i % 6]}>
                      {v}
                    </T>
                    <T>{benefitText[i]}</T>
                  </View>
                </View>
              ))}
            </Body>
            <Footer>
              <T center bold>
                Your free trial ends on {end}
              </T>
              <T center size={13}>
                Cancel anytime before that from your account.
              </T>
              {btn("Continue", () => go(p.notice ? 17 : 16))}
            </Footer>
          </>
        );
      case 16:
        return (
          <>
            <Body>
              <Pic name="reminder" h={w * 0.56} cover />
              {header("Don’t miss the trial reminder.")}
              <T bold size={21}>
                Enable notifications to get reminded when your trial is about to expire.
              </T>
              <T bold size={20}>
                To turn notifications back on:
              </T>
              {["Visit Settings", "Tap Notifications", "Turn on Allow Notifications"].map(
                (v, i) => (
                  <T key={v} bold size={20}>
                    {i + 1}. {v}
                  </T>
                ),
              )}
            </Body>
            <Footer>
              {btn("Go to Settings", () => {
                if (Platform.OS !== "web") void Linking.openSettings();
                next();
              })}
              <LinkButton title="Cancel" onPress={next} />
            </Footer>
          </>
        );
      case 17:
        return (
          <>
            <Body>
              {header("How did you hear about us?", "This will help us to better understand you.")}
              {sources.map((v) => choice(v, p.source === v, () => update({ source: v })))}
            </Body>
            <Footer>{btn("Continue", next, !p.source)}</Footer>
          </>
        );
      default:
        return (
          <>
            <Pic name="brand" h={44} w={150} />
            <Body style={centered}>
              <T size={58} color={red}>
                “
              </T>
              <T bold center size={25}>
                You don’t rise to your goals. You fall to the level of your systems.
              </T>
              <T center>―{"\n"}James Clear</T>
            </Body>
            <Footer>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Tap & hold to read"
                onLongPress={done}
                onPress={done}
              >
                <T center size={45} color={red}>
                  ●
                </T>
                <T bold center>
                  Tap & hold to read
                </T>
              </Pressable>
            </Footer>
          </>
        );
    }
  })();
  return (
    <KeyboardAvoidingView style={s.fill} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      {step === 9 && (
        <Pic name="sky" style={{ position: "absolute", width: "100%", height: "100%" }} cover />
      )}
      {[3, 4, 5, 6, 9, 10].includes(step) && (
        <View style={{ marginHorizontal: 24 }}>
          <Bar value={step / 13} />
        </View>
      )}
      {body}
      {sheet !== "" && (
        <View
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#0007",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              padding: 24,
              backgroundColor: "#f4f4f4",
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              gap: 18,
            }}
          >
            <View style={s.row}>
              <Circle
                title={sheet === "code" ? "‹" : "×"}
                label="Close sheet"
                onPress={() => {
                  setSheet(sheet === "code" ? "email" : "");
                  setError("");
                }}
              />
              <T bold size={21}>
                {(
                  {
                    email: "Enter your email",
                    code: "Check your email",
                    purchase: "Pro Yearly Subscription",
                    plans: "View all plans",
                    benefits: "Enjoy your full benefits",
                  } as Record<string, string>
                )[sheet] || sheet}
              </T>
            </View>
            {sheet === "email" || sheet === "code" ? (
              <>
                {sheet === "code" && (
                  <T>
                    We just sent an email to <T bold>{email}</T>. Enter the code below.
                  </T>
                )}
                <View>
                  {sheet === "code" && (
                    <View style={s.row} pointerEvents="none">
                      {Array.from({ length: 6 }, (_, i) => (
                        <View
                          key={i}
                          style={[
                            s.center,
                            {
                              width: 42,
                              height: 55,
                              backgroundColor: "white",
                              borderRadius: 18,
                              borderWidth: i === otp.length ? 2 : 0,
                            },
                          ]}
                        >
                          <T bold>{otp[i] || "–"}</T>
                        </View>
                      ))}
                    </View>
                  )}
                  <TextInput
                    accessibilityLabel={sheet === "code" ? "Verification code" : "Email address"}
                    key={sheet}
                    autoFocus
                    autoCapitalize="none"
                    keyboardType={sheet === "email" ? "email-address" : "number-pad"}
                    textContentType={sheet === "email" ? "emailAddress" : "oneTimeCode"}
                    placeholder={sheet === "email" ? "Your email address" : "–   –   –   –   –   –"}
                    value={sheet === "email" ? email : otp}
                    onChangeText={(v) => {
                      if (sheet === "email") setEmail(v);
                      else {
                        const code = v.replace(/\D/g, "").slice(0, 6);
                        setOtp(code);
                        if (code.length === 6) void verify(code);
                      }
                    }}
                    style={
                      sheet === "code"
                        ? { position: "absolute", inset: 0, opacity: 0.01 }
                        : {
                            padding: 14,
                            borderRadius: 22,
                            backgroundColor: "white",
                            borderWidth: 1,
                            fontSize: 18,
                          }
                    }
                  />
                </View>
                {sheet === "email" ? (
                  <T size={14}>You will receive an access code to log in.</T>
                ) : (
                  <LinkButton
                    title={
                      seconds ? `Resend in 0:${String(seconds).padStart(2, "0")}` : "Resend code"
                    }
                    onPress={() => {
                      if (!seconds) void verify();
                    }}
                  />
                )}
                {error && <T color={red}>{error}</T>}
                {btn(
                  busy ? "Please wait…" : "Continue",
                  () => void verify(sheet === "code" ? otp : undefined),
                  busy || (sheet === "email" ? !/^\S+@\S+\.\S+$/.test(email) : otp.length !== 6),
                )}
              </>
            ) : sheet === "purchase" || sheet === "plans" ? (
              <>
                <T center bold>
                  7 days free · ¥13,000 / year
                </T>
                <T center>Preview purchase. No payment will be taken.</T>
                {btn("Continue", () => {
                  startTrial();
                  setSheet("");
                })}
              </>
            ) : (
              <>
                <T>
                  {sheet === "benefits"
                    ? benefits.join("\n")
                    : sheet === "Privacy Policy"
                      ? "Reading activity and preferences are stored on this device. Email sign-in sends your address to the authentication service."
                      : sheet === "FAQ Subscription"
                        ? "This preview does not create a paid subscription."
                        : "This is a local learning preview. Purchases shown here do not incur charges."}
                </T>
                {btn("Close", () => setSheet(""))}
              </>
            )}
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
