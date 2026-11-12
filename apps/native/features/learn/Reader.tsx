import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Share, View, useWindowDimensions } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { books, chapters, highlights, passages, summaries, type Book } from "./catalog";
import { type Profile, type Update, toggle, dateKey } from "./state";
import {
  Bar,
  Body,
  Button,
  Circle,
  Footer,
  LinkButton,
  Pic,
  Rich,
  T,
  brown,
  cream,
  paper,
  styles as s,
} from "./ui";
const tracks = [
  require("../../assets/learn/narration0.m4a"),
  require("../../assets/learn/narration1.m4a"),
  require("../../assets/learn/narration2.m4a"),
  require("../../assets/learn/narration3.m4a"),
  require("../../assets/learn/narration4.m4a"),
  require("../../assets/learn/narration5.m4a"),
  require("../../assets/learn/narration6.m4a"),
  require("../../assets/learn/narration7.m4a"),
];
export function BookDetail({
  book,
  p,
  close,
  start,
}: {
  book: Book;
  p: Profile;
  close: () => void;
  start: (i: number) => void;
}) {
  const list = chapters(book),
    [selected, setSelected] = useState(() =>
      Math.max(
        0,
        list.findIndex((_, i) => !p.completed.includes(book + "." + i)),
      ),
    ),
    [more, setMore] = useState(false),
    [menu, setMenu] = useState(false);
  return (
    <View style={[s.fill, { backgroundColor: cream }]}>
      <Body style={{ paddingTop: 48, paddingBottom: 185 }}>
        <Pic name={book} h={280} />
        <T bold center size={25}>
          {book === "think" ? "Catch your mind’s costly mistakes" : books[book][0]}
        </T>
        <T center>
          {books[book][0]} by {books[book][1]}
        </T>
        <T bold center size={13}>
          {book === "think" ? "PSYCHOLOGY" : "KEY IDEAS"}
        </T>
        <View style={[s.row, { marginVertical: 22 }]}>
          {[
            ["Key Ideas", list.length + "　🗂️"],
            ["Time / idea", "3–4 min　🕰️"],
          ].map(([k, v]) => (
            <View key={k} style={[s.card, s.fill, { backgroundColor: paper }]}>
              <T size={14}>{k}</T>
              <T bold size={20}>
                {v}
              </T>
            </View>
          ))}
        </View>
        <T bold size={21}>
          Description
        </T>
        <Pressable
          accessibilityRole="button"
          onPress={() => setMore(!more)}
          style={[s.card, { backgroundColor: paper }]}
        >
          <T>
            {book === "think"
              ? "Your mind runs on two engines, and one of them is quietly fooling you."
              : books[book][0]}
          </T>
          {more && <Rich value={highlights[book]} />}
          <T bold size={14} style={{ textAlign: "right" }}>
            {more ? "View less" : "…View more ›"}
          </T>
        </Pressable>
        <T bold size={21}>
          Main Ideas
        </T>
        {list.map((v, i) => (
          <Pressable
            accessibilityRole="button"
            key={v}
            onPress={() => setSelected(i)}
            style={[
              s.card,
              s.row,
              { backgroundColor: paper, borderWidth: selected === i ? 2 : 0, borderColor: brown },
            ]}
          >
            <T size={28}>{p.completed.includes(book + "." + i) ? "✓" : "◉"}</T>
            <View>
              <T bold>{v}</T>
              <T size={13}>4 min</T>
            </View>
          </Pressable>
        ))}
      </Body>
      <View style={{ position: "absolute", top: 8, left: 22, right: 22, ...s.spread }}>
        <Circle title="‹" label="Back" onPress={close} />
        <Circle title="⋯" label="Book options" onPress={() => setMenu(!menu)} />
      </View>
      {menu && (
        <View style={{ position: "absolute", right: 20, top: 54, ...s.card }}>
          <LinkButton
            title="Share book"
            onPress={() => {
              void Share.share({ message: books[book][0] });
              setMenu(false);
            }}
          />
        </View>
      )}
      <View
        style={{
          position: "absolute",
          bottom: 5,
          left: 24,
          right: 24,
          backgroundColor: paper,
          padding: 16,
          borderRadius: 28,
          gap: 8,
          boxShadow: "0 5px 32px #49311e44",
        }}
      >
        <T size={13}>#{selected + 1}</T>
        <T bold>{list[selected]}</T>
        <Button
          color={brown}
          title={
            selected === 0
              ? "Start book"
              : p.completed.includes(book + "." + (selected - 1))
                ? "Continue book"
                : "Jump here"
          }
          onPress={() => start(selected)}
        />
      </View>
    </View>
  );
}
export function Reader({
  book,
  chapter,
  p,
  update,
  close,
  finish,
}: {
  book: Book;
  chapter: number;
  p: Profile;
  update: Update;
  close: () => void;
  finish: () => void;
}) {
  const id = book + "." + chapter,
    list = chapters(book),
    title = list[chapter]!,
    full = book === "think" && chapter === 0,
    last = full ? 7 : 2,
    summary = book === "think" ? summaries[chapter]! : highlights[book];
  const [page, setPage] = useState(Math.min(p.positions[id] ?? 0, last)),
    [rate, setRate] = useState(1),
    [options, setOptions] = useState(false),
    [mode, setMode] = useState<"read" | "congrats" | "rate" | "practice">("read"),
    [answer, setAnswer] = useState(""),
    [big, setBig] = useState(false);
  const player = useAudioPlayer(full ? tracks[page] : null),
    audio = useAudioPlayerStatus(player),
    autoplay = useRef(false),
    touch = useRef({ x: 0, y: 0 }),
    handled = useRef(false),
    width = Math.min(useWindowDimensions().width, 480);
  const scroll = useRef<ScrollView>(null),
    offsets = useRef<number[]>([]),
    didRestore = useRef(false),
    [pane, setPane] = useState(0),
    settle = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (settle.current) clearTimeout(settle.current);
    },
    [],
  );
  const selectPage = (n: number) => {
    if (n < 0 || n > last) return;
    handled.current = false;
    setPage(n);
    update({ positions: { ...p.positions, [id]: n } });
  };
  const move = (n: number) => {
    if (n >= 0 && n <= last) {
      selectPage(n);
      scroll.current?.scrollTo({ y: offsets.current[n] ?? 0, animated: true });
    }
  };
  const restore = () => {
    const y = offsets.current[page];
    if (!didRestore.current && pane && y !== undefined) {
      didRestore.current = true;
      scroll.current?.scrollTo({ y, animated: false });
    }
  };
  useEffect(() => {
    if (!full) return;
    player.setPlaybackRate(rate);
    if (autoplay.current) player.play();
  }, [page, player, rate, full]);
  useEffect(() => {
    if (!audio.didJustFinish || handled.current || !autoplay.current) return;
    handled.current = true;
    if (page < last) move(page + 1);
    else autoplay.current = false;
  }, [audio.didJustFinish]);
  const complete = () => {
    autoplay.current = false;
    player.pause();
    const today = dateKey();
    update({
      completed: [...new Set([...p.completed, id])],
      days: [...new Set([...p.days, today])],
      positions: { ...p.positions, [id]: 0 },
    });
    setMode("rate");
  };
  const play = () => {
    if (audio.playing) {
      autoplay.current = false;
      player.pause();
    } else {
      autoplay.current = true;
      if (audio.currentTime >= audio.duration && audio.duration) void player.seekTo(0);
      player.play();
    }
  };
  if (mode !== "read")
    return (
      <View style={[s.fill, { backgroundColor: cream }]}>
        <Body style={{ alignItems: "center", justifyContent: "space-around" }}>
          <T bold size={39} center>
            {mode === "practice" ? "Let’s Practice" : "Congrats!"}
          </T>
          <T center>
            {mode === "practice"
              ? "Which action puts this idea into practice?"
              : "You’re making great progress! Ready to put your learning into practice?"}
          </T>
          <Pic name="mascot" h={210} />
          {mode === "practice" &&
            ["Pause and check your first answer", "Always trust your first impression"].map(
              (v, i) => (
                <LinkButton
                  key={v}
                  title={v}
                  onPress={() => setAnswer(i === 0 ? "That’s right!" : "Try again")}
                />
              ),
            )}
          {answer && <T bold>{answer}</T>}
        </Body>
        <View style={{ position: "absolute", right: 18, top: 8 }}>
          <Circle title="×" label="Close lesson" onPress={finish} />
        </View>
        <Footer>
          <Button
            color={brown}
            title={mode === "practice" ? "Finish" : "Let’s Practice"}
            onPress={() => (mode === "practice" ? finish() : setMode("practice"))}
          />
          <LinkButton title="Skip to the next idea" onPress={finish} />
        </Footer>
        {mode === "rate" && (
          <View style={{ position: "absolute", inset: 0, backgroundColor: "#0009", ...s.center }}>
            <View style={[s.card, { width: "92%", paddingVertical: 62, gap: 20 }]}>
              <T center bold size={25}>
                How did you like{"\n"}this idea?
              </T>
              <T center>Tap a star to rate this idea.</T>
              <View style={[s.row, { justifyContent: "center" }]}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Pressable
                    key={i}
                    accessibilityRole="button"
                    accessibilityLabel={i + " stars"}
                    onPress={() => {
                      update({ ratings: { ...p.ratings, [id]: i } });
                      finish();
                    }}
                  >
                    <T size={32} color="#cba446">
                      ☆
                    </T>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        )}
      </View>
    );
  return (
    <View style={[s.fill, { backgroundColor: cream }]}>
      <View style={[s.spread, { paddingHorizontal: 24, paddingVertical: 10 }]}>
        <T bold size={20}>
          {title}
        </T>
        <View style={s.row}>
          <Circle title="文" label="Reading options" onPress={() => setOptions(!options)} />
          <Circle title={page < 2 ? "×" : "⌄"} label="Close reader" onPress={close} />
        </View>
      </View>
      {options && (
        <LinkButton
          title={big ? "Standard text" : "Larger text"}
          onPress={() => {
            setBig(!big);
            setOptions(false);
          }}
        />
      )}
      {page >= 2 && (
        <View style={[s.row, { gap: 5, paddingHorizontal: 24 }]}>
          {Array.from({ length: full ? 5 : 1 }, (_, i) => (
            <View key={i} style={{ flex: i === Math.min(page - 2, 4) ? 5 : 1 }}>
              <Bar value={i <= page - 2 ? 1 : 0} />
            </View>
          ))}
        </View>
      )}
      <ScrollView
        ref={scroll}
        onLayout={(e) => setPane(e.nativeEvent.layout.height)}
        onContentSizeChange={restore}
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        onScroll={(e) => {
          if (!didRestore.current) return;
          const y = e.nativeEvent.contentOffset.y;
          if (settle.current) clearTimeout(settle.current);
          settle.current = setTimeout(() => {
            const nearest = offsets.current.reduce(
              (best, at, i) => (Math.abs(at - y) < Math.abs(offsets.current[best]! - y) ? i : best),
              0,
            );
            if (nearest !== page) selectPage(nearest);
          }, 150);
        }}
        scrollEventThrottle={32}
        onTouchStart={(e) => (touch.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY })}
        onTouchEnd={(e) => {
          const dx = e.nativeEvent.pageX - touch.current.x;
          if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(e.nativeEvent.pageY - touch.current.y))
            move(page + (dx < 0 ? 1 : -1));
        }}
      >
        {pane > 0 &&
          Array.from({ length: last + 1 }, (_, index) => (
            <View
              key={index}
              onLayout={(e) => {
                offsets.current[index] = e.nativeEvent.layout.y;
                restore();
              }}
              style={{
                paddingHorizontal: 24,
                paddingTop: 10,
                paddingBottom: 24,
                minHeight: index === last ? pane : index < 2 ? pane : Math.max(340, pane - 48),
                justifyContent: index < 2 || index === last ? "center" : "flex-start",
                gap: 24,
              }}
            >
              {index < 2 ? (
                <>
                  <View style={[s.card, { backgroundColor: paper, marginTop: 60 }]}>
                    <T center size={19}>
                      {index === 0 ? (
                        <>
                          Getting started with{" "}
                          <T size={19} bold>
                            {books[book][0]}
                          </T>
                          .{" "}
                          <T size={19} bold>
                            {list.length}
                          </T>{" "}
                          memorable takeaways.
                        </>
                      ) : (
                        <>
                          Starting with the {chapter === 0 ? "1st" : "next"} idea:{" "}
                          <T size={19} bold>
                            {title}
                          </T>
                          . {full ? "Smart people love complexity. Brains don’t." : ""}
                        </>
                      )}
                    </T>
                  </View>
                  <Pic name="mascot" h={width * 0.48} />
                </>
              ) : index === last ? (
                <View
                  style={{
                    borderColor: "#c4a045",
                    borderWidth: 5,
                    borderRadius: 34,
                    backgroundColor: paper,
                    padding: 24,
                    boxShadow: "0 10px 20px #5b472e55",
                    gap: 24,
                  }}
                >
                  <T bold>▣　　 {title}</T>
                  <View style={{ height: 1, backgroundColor: "#dec985" }} />
                  <Rich value={summary} size={big ? 21 : 17} />
                  <View style={s.spread}>
                    <Circle
                      title="↗"
                      label="Share idea"
                      onPress={() => void Share.share({ message: summary.replaceAll("**", "") })}
                    />
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Save idea"
                      onPress={() => update({ bookmark: toggle(p.bookmark, id) })}
                    >
                      <Ionicons
                        name={p.bookmark.includes(id) ? "bookmark" : "bookmark-outline"}
                        size={24}
                        color={brown}
                      />
                    </Pressable>
                  </View>
                </View>
              ) : (
                <>
                  <Rich size={big ? 23 : 19} value={passages[index - 2]!} />
                  <Pic name={`idea${index - 2}` as "idea0"} h={(width - 48) * 0.67} />
                </>
              )}
            </View>
          ))}
      </ScrollView>
      <View
        pointerEvents="none"
        style={{ position: "absolute", bottom: 0, height: 104, width: "100%" }}
      >
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id="fade" x1="0" x2="0" y1="0" y2="1">
              <Stop offset="0" stopColor={brown} stopOpacity="0" />
              <Stop offset="1" stopColor={brown} stopOpacity=".24" />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#fade)" />
        </Svg>
      </View>
      <Footer>
        <View style={s.spread}>
          {page === last ? (
            <Button
              color={brown}
              style={{ flex: 1, marginRight: 12 }}
              title="Continue"
              onPress={complete}
            />
          ) : (
            <View style={s.row}>
              <Circle
                size={55}
                title="‹"
                label="Previous page"
                disabled={page === 0}
                onPress={() => move(page - 1)}
              />
              <Circle size={55} title="›" label="Next page" onPress={() => move(page + 1)} />
            </View>
          )}
          {full && (
            <View
              style={[
                s.row,
                { backgroundColor: paper, borderRadius: 40, paddingHorizontal: 7, gap: 2 },
              ]}
            >
              {(audio.playing || page > 0) && (
                <>
                  <LinkButton
                    title={rate + "x"}
                    onPress={() => setRate(rate >= 2 ? 1 : rate + 0.25)}
                  />
                  <Circle
                    title="↶"
                    label="Rewind five seconds"
                    onPress={() => void player.seekTo(Math.max(0, player.currentTime - 5))}
                  />
                </>
              )}
              <Circle
                size={audio.playing ? 44 : 55}
                title={audio.playing ? "Ⅱ" : "▶"}
                label={audio.playing ? "Pause" : "Play"}
                onPress={play}
              />
            </View>
          )}
        </View>
      </Footer>
    </View>
  );
}
