import { useEffect, useRef, useState } from "react";
import {
  BackHandler,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { books, chapters, groups, topicBooks, type Book } from "./catalog";
import { BookDetail, Reader } from "./Reader";
import { Streak } from "./Streak";
import { dateKey, streak, type Profile, type Update } from "./state";
import {
  Body,
  Button,
  Circle,
  Footer,
  LinkButton,
  Pic,
  T,
  bg,
  cream,
  green,
  red,
  styles as s,
} from "./ui";
const tabs = ["Home", "Explore", "Library", "Profile", "Apps"] as const;
type Tab = (typeof tabs)[number];
const shelves: [string, Book[]][] = [
  ["Most popular this week", ["ego", "now", "irrational", "power"]],
  ["Founders & Startup Stories", ["rework", "badblood", "google"]],
  ["Health & Longevity", ["comfort", "breath", "die", "brain"]],
  ["Epic Myths & Dark Tales", ["rings", "humans", "vampires", "odyssey"]],
  ["Think & Work Smarter", ["deep", "fools", "think", "stick"]],
];
const afterReading: Record<string, Book[]> = {
  "Founders & Startup Stories": ["shoe", "rework", "badblood"],
  "Health & Longevity": ["die", "brain", "breath"],
  "Epic Myths & Dark Tales": ["vampires", "odyssey", "rings"],
  "Think & Work Smarter": ["deep", "think", "fools", "stick"],
};
const bookIds = Object.keys(books) as Book[];
export function Library({
  p,
  update,
  onSurface,
}: {
  p: Profile;
  update: Update;
  onSurface: (color: string) => void;
}) {
  const [tab, setTab] = useState<Tab>("Home"),
    [screen, setScreen] = useState(""),
    [book, setBook] = useState<Book>("think"),
    [chapter, setChapter] = useState(0),
    [q, setQ] = useState(""),
    [section, setSection] = useState(""),
    [toast, setToast] = useState(false),
    [recent, setRecent] = useState(true),
    [app, setApp] = useState(""),
    [scanMsg, setScanMsg] = useState(""),
    [permission, ask] = useCameraPermissions();
  const selected = new Set(p.completed.map((v) => v.split(".")[0] as Book)),
    home = useRef<ScrollView>(null),
    homeY = useRef(0),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () =>
      onSurface(
        screen === "reader" || screen === "book"
          ? cream
          : tab === "Apps" && !screen
            ? "#201f1e"
            : bg,
      ),
    [screen, tab, onSurface],
  );
  const choose = (b: Book) => {
      setBook(b);
      setScreen("book");
    },
    back = () => {
      if (screen === "reader") {
        setScreen("book");
      } else if (screen) {
        setScreen("");
      } else if (tab !== "Home") setTab("Home");
      else return false;
      return true;
    };
  useEffect(() => {
    const h = BackHandler.addEventListener("hardwareBackPress", back);
    return () => h.remove();
  }, [screen, tab]);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const newStreak = useRef(false);
  const read = (i: number) => {
    newStreak.current = streak(p.days) === 0 && !p.days.includes(dateKey());
    setChapter(i);
    setScreen("reader");
  };
  const browse = (name: string) => {
    setSection(name);
    setQ("");
    setScreen("shelf");
  };
  const list = (name: string, items: Book[], see = false, small = false) => (
    <View key={name} style={{ gap: 12, marginVertical: 20 }}>
      <View style={[s.spread, { paddingHorizontal: 24 }]}>
        <T bold size={20}>
          {name}
        </T>
        {see && <LinkButton title="See all" onPress={() => browse(name)} />}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
      >
        {items.map((b) => (
          <Pressable
            key={b}
            accessibilityRole="button"
            accessibilityLabel={books[b][0]}
            onPress={() => choose(b)}
            style={{ width: small ? 126 : 150, gap: 4 }}
          >
            <Pic name={b} h={small ? 155 : 225} cover style={{ borderRadius: 5 }} />
            <T bold lines={2}>
              {books[b][0]}
            </T>
            <T size={14} color="#666" lines={2}>
              {books[b][1]}
            </T>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
  const head = (v: string) => (
    <View style={[s.row, { padding: 15 }]}>
      <Circle title="‹" label="Back" onPress={back} />
      <T bold size={21}>
        {v}
      </T>
    </View>
  );
  const openScan = () => {
    setScanMsg("");
    setScreen("scan");
  };
  if (screen === "reader")
    return (
      <Reader
        key={book + chapter}
        {...{ book, chapter, p, update }}
        close={back}
        finish={() => {
          setScreen("");
          setTab("Home");
          homeY.current = 0;
          setToast(newStreak.current);
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => setToast(false), 15000);
        }}
      />
    );
  if (screen === "book") return <BookDetail {...{ book, p }} close={back} start={read} />;
  if ((screen === "streak" && !p.streakGoal) || screen === "intro")
    return <Streak {...{ p, update }} intro={screen === "intro"} close={back} />;
  if (screen === "notifications")
    return (
      <>
        {head("Notifications")}
        <Body style={{ justifyContent: "center" }}>
          <Pic name="empty" h={130} />
          <T center>All caught up.{"\n"}Clear screen ahead.</T>
        </Body>
      </>
    );
  if (screen === "scan")
    return (
      <>
        {head("Scan Book")}
        {permission?.granted ? (
          <>
            <CameraView
              style={s.fill}
              barcodeScannerSettings={{ barcodeTypes: ["ean13"] }}
              onBarcodeScanned={({ data }) => {
                const match: Record<string, Book> = {
                  "9780374533557": "think",
                  "9780735211292": "atomic",
                  "9781455586691": "deep",
                };
                const id = match[data];
                if (id) {
                  update({ scanned: [...new Set([...p.scanned, id])] });
                  choose(id);
                } else setScanMsg("This book isn’t in the catalog yet.");
              }}
            />
            <T center>{scanMsg || "Point the camera at a book’s ISBN barcode."}</T>
          </>
        ) : (
          <Body style={{ justifyContent: "center" }}>
            <T bold center size={25}>
              Allow Deepstash to access your camera
            </T>
            <T center>This lets you capture the book you’re looking for.</T>
            <Button
              title={permission?.canAskAgain === false ? "Open Settings" : "Allow camera"}
              onPress={() =>
                permission?.canAskAgain === false && Platform.OS !== "web"
                  ? void Linking.openSettings()
                  : void ask()
              }
            />
          </Body>
        )}
      </>
    );
  if (screen === "stash") {
    const ids =
      section === "Read Later" ? p.bookmark.map((v) => v.split(".")[0] as Book) : p.scanned;
    return (
      <>
        {head("")}
        <Body>
          <Pic name={section === "Read Later" ? "later" : "scanned"} h={230} />
          <T bold size={22} center>
            {section}
          </T>
          <T center>
            {ids.length} ideas　　 ◷ {ids.length * 4} mins
          </T>
          <T center size={14}>
            All the ideas you saved for checking out later
          </T>
          <View style={s.spread}>
            <T bold size={21}>
              Ideas
            </T>
            <LinkButton
              title={recent ? "Recent First⌄" : "Oldest First⌄"}
              onPress={() => setRecent(!recent)}
            />
          </View>
          {ids.length ? (
            (recent ? [...ids.keys()].reverse() : [...ids.keys()]).map((i) => (
              <LinkButton
                key={i}
                title={
                  section === "Read Later"
                    ? chapters(ids[i]!)[Number(p.bookmark[i]!.split(".")[1])]!
                    : books[ids[i]!][0]
                }
                onPress={() => {
                  setBook(ids[i]!);
                  if (section === "Read Later") {
                    read(Number(p.bookmark[i]!.split(".")[1]));
                  } else choose(ids[i]!);
                }}
              />
            ))
          ) : (
            <>
              <Pic name="emptyStash" h={140} />
              <T center>No ideas saved here yet{"\n"}Come back later, I’m still reading...</T>
            </>
          )}
        </Body>
      </>
    );
  }
  if (screen === "search" || screen === "shelf") {
    const subset = shelves.find(([name]) => name === section)?.[1] ?? topicBooks(section);
    const items =
      screen === "search"
        ? bookIds
        : (subset ??
          (section === "New & Noteworthy"
            ? (["web3", "workout"] as Book[])
            : section === "Pick a New Journey"
              ? (["outside", "sleep"] as Book[])
              : section === "Latest Releases"
                ? (["irrational", "propaganda", "humans"] as Book[])
                : bookIds));
    return (
      <>
        {head(screen === "search" ? "Search" : section)}
        <Body>
          <TextInput
            autoFocus={screen === "search"}
            placeholder="Search books or authors"
            value={q}
            onChangeText={setQ}
            style={{ padding: 14, backgroundColor: "white", borderRadius: 20, fontSize: 17 }}
          />
          {items
            .filter((b) => books[b].join(" ").toLowerCase().includes(q.toLowerCase()))
            .map((b) => (
              <Pressable accessibilityRole="button" key={b} onPress={() => choose(b)} style={s.row}>
                <Pic name={b} h={80} w={54} />
                <View style={s.fill}>
                  <T bold>{books[b][0]}</T>
                  <T size={14}>{books[b][1]}</T>
                </View>
              </Pressable>
            ))}
          {!items.some((b) => books[b].join(" ").toLowerCase().includes(q.toLowerCase())) && (
            <T center>No books found</T>
          )}
        </Body>
      </>
    );
  }
  if (screen === "stats")
    return (
      <>
        {head("Achievements")}
        <Body>
          <T bold size={24}>
            Your Stats
          </T>
          <T>{p.completed.length} ideas read</T>
          <T>{p.bookmark.length} ideas saved</T>
          <T>🔥 {streak(p.days)} day streak</T>
          <Button title="Streak Milestones" onPress={() => setScreen("streak")} />
        </Body>
      </>
    );
  const search = () => {
    setQ("");
    setScreen("search");
  };
  const nav = (t: Tab) => {
    if (t === tab && t === "Home") home.current?.scrollTo({ y: 0 });
    setTab(t);
    setApp("");
  };
  return (
    <View style={[s.fill, { backgroundColor: tab === "Apps" ? "#201f1e" : bg }]}>
      {tab === "Home" ? (
        <View style={[s.spread, { paddingHorizontal: 15, minHeight: 56 }]}>
          <Pic name="brand" w={140} h={37} />
          <View style={s.row}>
            <LinkButton
              title={"🔥 " + streak(p.days)}
              onPress={() => {
                setToast(false);
                setScreen("streak");
              }}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              onPress={() => setScreen("notifications")}
            >
              <Ionicons name="notifications-outline" size={23} />
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Scan book" onPress={openScan}>
              <Ionicons name="scan-outline" size={25} />
            </Pressable>
          </View>
        </View>
      ) : tab === "Explore" ? (
        <View style={[s.row, { padding: 12 }]}>
          <Pressable
            accessibilityRole="button"
            onPress={search}
            style={[s.card, s.fill, { padding: 9 }]}
          >
            <T color="#888">⌕　Search...</T>
          </Pressable>
          <Button title="⌗ Scan Book" style={{ minHeight: 40 }} onPress={openScan} />
        </View>
      ) : tab === "Library" ? (
        <View style={[s.spread, { padding: 16 }]}>
          <View>
            <T bold>Library</T>
            <T size={13}>{p.bookmark.length} ideas</T>
          </View>
          <View style={s.row}>
            <Circle title="⌕" label="Search" onPress={search} />
            <Circle title="◷" label="Reading history" onPress={() => setScreen("stats")} />
          </View>
        </View>
      ) : null}
      {tab === "Home" && (
        <ScrollView
          ref={home}
          contentOffset={{ x: 0, y: homeY.current }}
          onScroll={(e) => (homeY.current = e.nativeEvent.contentOffset.y)}
          scrollEventThrottle={64}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {selected.size > 0 && (
            <View style={{ margin: 24, gap: 14 }}>
              <T bold size={21}>
                Continue discovering
              </T>
              {[...selected].map((b) => (
                <Pressable
                  key={b}
                  accessibilityRole="button"
                  style={[s.row, s.card]}
                  onPress={() => choose(b)}
                >
                  <Pic name={b} w={80} h={119} />
                  <View style={s.fill}>
                    <T bold size={20}>
                      {books[b][0]}
                    </T>
                    <T>{books[b][1]}</T>
                    <View
                      style={{
                        height: 18,
                        borderRadius: 12,
                        backgroundColor: "#f1f1f1",
                        overflow: "hidden",
                        justifyContent: "center",
                      }}
                    >
                      <View
                        style={{
                          position: "absolute",
                          left: 0,
                          width: `${(100 * p.completed.filter((i) => i.startsWith(b + ".")).length) / chapters(b).length}%`,
                          height: 18,
                          backgroundColor: green,
                          borderRadius: 12,
                        }}
                      />
                      <T center bold size={13}>
                        {Math.floor(
                          (100 * p.completed.filter((i) => i.startsWith(b + ".")).length) /
                            chapters(b).length,
                        )}
                        %
                      </T>
                    </View>
                    <T size={12}>
                      Next:{" "}
                      {chapters(b).find((_, i) => !p.completed.includes(b + "." + i)) || "Review"}
                    </T>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
          {list("Based on your preferences", [
            ...new Set<Book>([
              ...(p.completed.length ? (["status", "rich"] as Book[]) : p.picks),
              "spark",
              "humans",
              "rich",
              "think",
            ]),
          ])}
          {list("Latest Releases", ["irrational", "propaganda", "humans"], true)}
          <Pressable
            accessibilityRole="button"
            onPress={() => choose("righteous")}
            style={{ backgroundColor: "#fff0cc", paddingVertical: 20 }}
          >
            <T bold size={20} style={{ marginHorizontal: 24 }}>
              Featured book
            </T>
            <Pic name="featured" h={310} />
            <View style={[s.card, { marginHorizontal: 20 }]}>
              <T bold size={20}>
                The Righteous Mind　›
              </T>
              <T>Why good people divide over politics</T>
            </View>
          </Pressable>
          <View style={{ padding: 24, gap: 14 }}>
            <T bold size={20}>
              Explore by topic
            </T>
            <ScrollView horizontal>
              {(p.topics.length ? p.topics : groups["Recommended for you"]).map((v) => (
                <LinkButton key={v} title={v + "　›"} onPress={() => browse(v)} />
              ))}
            </ScrollView>
          </View>
          {shelves.map(([n, items]) => list(n, selected.size ? (afterReading[n] ?? items) : items))}
          <View style={{ margin: 24, gap: 12 }}>
            <T center bold size={21}>
              Hungry for more?
            </T>
            <T center>We’ve found 200+ more books that match your interests.</T>
            <Button title="Explore more" onPress={() => nav("Explore")} />
          </View>
        </ScrollView>
      )}
      {tab === "Explore" && (
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          <View style={{ padding: 24, gap: 15 }}>
            <View style={s.spread}>
              <T bold size={20}>
                Explore by Topic
              </T>
              <LinkButton title="See all" onPress={() => browse("Explore by Topic")} />
            </View>
            <View style={s.wrap}>
              {[
                "Science & Nature",
                "Technology & The Future",
                "Artificial Intelligence",
                "Health",
              ].map((v, i) => (
                <Pressable
                  accessibilityRole="button"
                  key={v}
                  onPress={() => browse(v)}
                  style={[s.card, { width: "48%", height: 94 }]}
                >
                  <T bold>
                    {v} {["🧬", "🛰️", "🌐", "🌱"][i]}
                  </T>
                </Pressable>
              ))}
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Try book scan"
            onPress={openScan}
          >
            <Pic name="scanBanner" h={205} cover />
          </Pressable>
          {list("New & Noteworthy", ["web3", "workout", "propaganda"], true, true)}
          {list("Pick a New Journey", ["outside", "sleep", "humans"], true, true)}
          {list("Heavy-Hitting Books", ["split", "stoic", "deep"], true)}
        </ScrollView>
      )}
      {tab === "Library" && (
        <Body>
          <T bold size={21}>
            Stashes
          </T>
          <View style={s.row}>
            {["Read Later", "My Scanned Books"].map((v, i) => (
              <Pressable
                accessibilityRole="button"
                key={v}
                onPress={() => {
                  setSection(v);
                  setScreen("stash");
                }}
                style={{ width: "40%", gap: 8 }}
              >
                {!p.completed.length && !p.bookmark.length && !p.scanned.length ? (
                  <View style={{ height: 160, backgroundColor: "#e8e7e6", borderRadius: 17 }} />
                ) : (
                  <Pic name={i ? "scanned" : "later"} h={160} cover style={{ borderRadius: 17 }} />
                )}
                <T bold>{v}</T>
              </Pressable>
            ))}
          </View>
        </Body>
      )}
      {tab === "Profile" && (
        <Body style={{ paddingBottom: 130 }}>
          <T center>◎</T>
          <Pressable accessibilityRole="button" style={s.card} onPress={() => choose("think")}>
            <Pic name="profile" h={255} />
            <T center bold size={23}>
              {p.completed.length ? "Continue reading" : "Start your first book"}
            </T>
            <T center>Save ideas as you read</T>
          </Pressable>
          <T bold size={22}>
            Your Stats
          </T>
          <Button title="🏆　Achievements　 ›" onPress={() => setScreen("stats")} />
        </Body>
      )}
      {tab === "Apps" && (
        <Body style={{ justifyContent: "space-evenly", paddingBottom: 105 }}>
          <Pic name="appsTitle" h={118} />
          <T center color="white">
            Deepstash brought his friends. More corners of your mind to explore - on your commute,
            your couch, or your 2 A.M. spiral.
          </T>
          <View style={{ height: 340 }}>
            <Pic name="appsOrbit" h={340} />
            {["Dilemmo", "Protocol", "Deepstash", "Smartheads", "Empirio", "Paladin"].map(
              (v, i) => (
                <Pressable
                  accessibilityLabel={v}
                  accessibilityRole="button"
                  key={v}
                  style={{
                    position: "absolute",
                    left: (["23%", "70%", "5%", "38%", "68%", "29%"] as const)[i],
                    top: [38, 70, 122, 126, 210, 243][i],
                    width: 78,
                    height: 68,
                  }}
                  onPress={() => setApp(v)}
                />
              ),
            )}
          </View>
          {!!app && <LinkButton title={app + "　×"} onPress={() => setApp("")} />}
        </Body>
      )}
      {toast && tab === "Home" && (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setToast(false);
            setScreen("intro");
          }}
          style={{
            position: "absolute",
            bottom: 85,
            left: 26,
            right: 26,
            backgroundColor: "#252424",
            borderRadius: 30,
            padding: 14,
          }}
        >
          <T bold color="white" center>
            🔥　READING STREAK STARTED!　 VIEW
          </T>
          <T center color="white" size={13}>
            Daily Goal Reached
          </T>
        </Pressable>
      )}
      <View style={{ position: "absolute", bottom: 6, left: 20, right: 20, ...s.row, gap: 7 }}>
        <View
          style={[
            s.row,
            {
              flex: 1,
              justifyContent: "space-around",
              gap: 0,
              borderRadius: 33,
              backgroundColor: tab === "Apps" ? "#303030" : "#fff",
              padding: 5,
              boxShadow: "0 4px 20px #0002",
            },
          ]}
        >
          {tabs.slice(0, 4).map((v, i) => (
            <Pressable
              accessibilityRole="tab"
              accessibilityLabel={v}
              accessibilityState={{ selected: tab === v }}
              key={v}
              onPress={() => nav(v)}
              style={{
                alignItems: "center",
                paddingVertical: 5,
                paddingHorizontal: 7,
                borderRadius: 24,
                backgroundColor: v === tab ? "#f1f1ef" : "transparent",
              }}
            >
              <Ionicons
                name={
                  (
                    [
                      tab === v ? "home" : "home-outline",
                      "search-outline",
                      "library-outline",
                      "person-outline",
                    ] as const
                  )[i]
                }
                size={20}
                color={tab === "Apps" ? "white" : "#333"}
              />
              <T size={11} bold={v === tab} color={tab === "Apps" ? "white" : undefined}>
                {v}
              </T>
            </Pressable>
          ))}
        </View>
        <Pressable
          accessibilityRole="tab"
          accessibilityLabel="Apps"
          accessibilityState={{ selected: tab === "Apps" }}
          onPress={() => nav("Apps")}
          style={{
            ...s.center,
            backgroundColor: tab === "Apps" ? "#303030" : "white",
            borderRadius: 32,
            width: 60,
            height: 60,
            boxShadow: "0 4px 20px #0002",
          }}
        >
          <T>🌈</T>
          <T size={11} color={tab === "Apps" ? "white" : undefined}>
            Apps
          </T>
        </Pressable>
      </View>
      {screen === "streak" && p.streakGoal > 0 && (
        <View
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#0006",
            paddingBottom: 68,
            paddingTop: 55,
          }}
        >
          <View style={{ flex: 1, borderRadius: 25, overflow: "hidden", backgroundColor: "white" }}>
            <Streak {...{ p, update }} intro={false} close={back} />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Dismiss calendar"
            onPress={back}
            style={{ position: "absolute", height: 65, bottom: 0, width: "100%" }}
          />
        </View>
      )}
    </View>
  );
}
