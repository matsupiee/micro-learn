import { useRef, useState } from "react";
import { ScrollView, View, useWindowDimensions } from "react-native";
import { dateKey, streak, type Profile, type Update } from "./state";
import { Bar, Body, Button, Circle, Footer, LinkButton, Pic, T, styles as s } from "./ui";
export function Streak({
  p,
  update,
  intro,
  close,
}: {
  p: Profile;
  update: Update;
  intro: boolean;
  close: () => void;
}) {
  const [step, setStep] = useState(intro ? -1 : p.streakGoal ? 3 : 0),
    [card, setCard] = useState(0),
    [goal, setGoal] = useState(p.streakGoal),
    [offset, setOffset] = useState(0),
    [milestone, setMilestone] = useState(0),
    ref = useRef<ScrollView>(null),
    w = Math.min(480, useWindowDimensions().width) - 36;
  const day = new Date(),
    date = new Date(day.getFullYear(), day.getMonth() + offset, 1),
    count = streak(p.days);
  if (step === -1)
    return (
      <>
        <View style={{ marginHorizontal: 24 }}>
          <Bar value={1 / 3} />
        </View>
        <Body
          style={{ justifyContent: "space-around", alignItems: "center", paddingHorizontal: 0 }}
        >
          <Pic name="streak" h={180} />
          <T center bold size={39}>
            Streak Started!
          </T>
          <T center>Read daily to grow a healthy habit. Keep{"\n"}your streak to track it.</T>
          <View>
            <ScrollView
              ref={ref}
              horizontal
              snapToInterval={w}
              decelerationRate="fast"
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => setCard(Math.round(e.nativeEvent.contentOffset.x / w))}
              contentContainerStyle={{ paddingHorizontal: 18 }}
            >
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <View key={i} style={{ width: w, paddingHorizontal: 5 }}>
                  <Pic name={`streak${i}` as "streak0"} h={w * 0.62} />
                </View>
              ))}
            </ScrollView>
            <View style={[s.row, { justifyContent: "center", gap: 2 }]}>
              {Array.from({ length: 6 }, (_, i) => (
                <LinkButton
                  key={i}
                  title={i === card ? "●" : "·"}
                  onPress={() => {
                    setCard(i);
                    ref.current?.scrollTo({ x: w * i });
                  }}
                />
              ))}
            </View>
          </View>
        </Body>
        <Footer>
          <Button title="Continue" onPress={close} />
        </Footer>
      </>
    );
  if (step < 3)
    return (
      <>
        <View style={[s.row, { paddingHorizontal: 16 }]}>
          <Circle title="×" label="Close" onPress={close} />
          <View style={s.fill}>
            <Bar value={(step + 1) / 3} />
          </View>
          <T>{step + 1} of 3</T>
        </View>
        <Body>
          <T bold size={26}>
            {
              [
                "The benefits of keeping a streak",
                "Dedication pays off",
                "What goal should we help towards?",
              ][step]
            }
          </T>
          {step === 0 ? (
            ["Consistency & Healthy Habit Formation", "Increased Motivation & Drive"].map(
              (v, i) => (
                <View key={v} style={s.card}>
                  <T bold>{v}</T>
                  <T>
                    {i
                      ? "The streak serves as a motivating force by fueling a sense of accomplishment."
                      : "Streaks foster consistent reading habits, empowering you to make steady progress towards your goals."}
                  </T>
                </View>
              ),
            )
          ) : step === 1 ? (
            <>
              <T>Reach streak milestones & get rewards for your progress.</T>
              {[1, 7, 14, 30].map((v) => (
                <View style={{ paddingVertical: 20 }} key={v}>
                  <T bold>🔥　{v === 1 ? "Streak Start" : v + "-Day Streak"}</T>
                </View>
              ))}
            </>
          ) : (
            <>
              <T>We will send you personalized nudges based on the goal you pick.</T>
              {[7, 14, 30].map((v, i) => (
                <Button
                  key={v}
                  color={goal === v ? "#398a61" : "#666"}
                  title={
                    v +
                    " days　" +
                    ["One week at a time", "Long-term vision", "Month-long motivation"][i]
                  }
                  onPress={() => setGoal(v)}
                />
              ))}
            </>
          )}
        </Body>
        <Footer>
          <Button
            disabled={step === 2 && !goal}
            title="Continue"
            onPress={() => {
              if (step === 2) update({ streakGoal: goal });
              setStep(step + 1);
            }}
          />
        </Footer>
      </>
    );
  const monthDays = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const longest = p.days.reduce(
    (max, k) => Math.max(max, streak(p.days, new Date(k + "T12:00:00"))),
    0,
  );
  return (
    <Body style={{ backgroundColor: "white", gap: 22 }}>
      <View style={s.spread}>
        <Circle title="×" label="Close milestones" onPress={close} />
        <T bold size={20}>
          Streak Milestones
        </T>
        <Circle
          title="›"
          label="Next milestone"
          onPress={() => setMilestone((milestone + 1) % 4)}
        />
      </View>
      <T center>🔥　 ·　 ·　 ·　 ·　 ·　 🏅　{[7, 14, 30, 60][milestone]}</T>
      <Bar value={count / [7, 14, 30, 60][milestone]!} />
      <T center bold>
        🏅 {longest}　　　 🔥 {count}　　　 💠 {p.trial ? 3 : 0}
      </T>
      <T center size={14}>
        max streak　　　 streak　　　 freezes
      </T>
      <View style={s.spread}>
        <Circle title="‹" label="Previous month" onPress={() => setOffset(offset - 1)} />
        <T bold size={20}>
          {date.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </T>
        <Circle title="›" label="Next month" onPress={() => setOffset(offset + 1)} />
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {[
          "Sun",
          "Mon",
          "Tue",
          "Wed",
          "Thu",
          "Fri",
          "Sat",
          ...Array(date.getDay()).fill(""),
          ...Array.from({ length: monthDays }, (_, i) => i + 1),
        ].map((v, i) => (
          <View
            key={i}
            style={{
              width: "14.28%",
              paddingVertical: 10,
              backgroundColor:
                typeof v === "number" &&
                p.days.includes(dateKey(new Date(date.getFullYear(), date.getMonth(), v)))
                  ? "#ffdc91"
                  : "transparent",
              borderRadius: 18,
            }}
          >
            <T center size={14}>
              {v}
            </T>
          </View>
        ))}
      </View>
    </Body>
  );
}
