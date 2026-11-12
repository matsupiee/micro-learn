import { useEffect, useRef } from "react";
import { Animated, PanResponder, View, useWindowDimensions } from "react-native";
import { books, type Book } from "./catalog";
import { Pic, T, green, red, styles as s } from "./ui";
export function Recommendation({
  book,
  onPick,
}: {
  book: Book | undefined;
  onPick: (add: boolean) => void;
}) {
  const travel = useRef(new Animated.Value(0)).current;
  const pick = useRef(onPick),
    locked = useRef(false);
  const { width, height } = useWindowDimensions(),
    w = Math.min(width, 480);
  useEffect(() => {
    pick.current = onPick;
  }, [onPick]);
  useEffect(() => {
    locked.current = false;
    travel.setValue(0);
  }, [book, travel]);
  const gesture = PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) =>
      !!book && Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
    onPanResponderMove: (_, g) => {
      if (!locked.current) travel.setValue(g.dx);
    },
    onPanResponderRelease: (_, g) => {
      if (Math.abs(g.dx) > 45 && !locked.current) {
        locked.current = true;
        Animated.timing(travel, {
          toValue: g.dx > 0 ? w : -w,
          duration: 160,
          useNativeDriver: false,
        }).start(({ finished }) => {
          if (finished) pick.current(g.dx > 0);
        });
      } else Animated.spring(travel, { toValue: 0, useNativeDriver: false }).start();
    },
    onPanResponderTerminate: () =>
      Animated.spring(travel, { toValue: 0, useNativeDriver: false }).start(),
  });
  return (
    <View style={{ marginHorizontal: 24, paddingTop: 20 }}>
      {book &&
        [0, 1].map((i) => (
          <View
            key={i}
            style={{
              position: "absolute",
              top: i * 9,
              left: 18 - i * 10,
              right: 18 - i * 10,
              height: 48,
              borderRadius: 16,
              backgroundColor: i ? "#dedede" : "#e7e7e7",
            }}
          />
        ))}
      <Animated.View
        {...gesture.panHandlers}
        style={[
          s.card,
          s.center,
          {
            height: Math.min(w * 0.95, height * 0.45),
            justifyContent: book ? "space-around" : "center",
            borderRadius: 15,
            borderBottomWidth: 2,
            borderColor: "#ccc",
            transform: [
              { translateX: travel },
              {
                rotate: travel.interpolate({
                  inputRange: [-w, 0, w],
                  outputRange: ["-16deg", "0deg", "16deg"],
                }),
              },
            ],
          },
        ]}
      >
        {book ? (
          <>
            <Pic name={book} h={Math.min(w * 0.56, height * 0.27)} />
            <View>
              <T center bold size={20}>
                {books[book][0]}
              </T>
              <T center size={14}>
                ✎ Written by {books[book][1]}
              </T>
            </View>
            {["SKIP", "LIKE"].map((label, i) => (
              <Animated.View
                key={label}
                style={{
                  position: "absolute",
                  top: 25,
                  alignSelf: i ? "flex-start" : "flex-end",
                  backgroundColor: "white",
                  padding: 5,
                  borderWidth: 2,
                  borderColor: i ? green : red,
                  opacity: travel.interpolate({
                    inputRange: [-65, 0, 65],
                    outputRange: i ? [0, 0, 1] : [1, 0, 0],
                    extrapolate: "clamp",
                  }),
                }}
              >
                <T bold color={i ? green : red}>
                  {label}
                </T>
              </Animated.View>
            ))}
          </>
        ) : (
          <>
            <T size={32} color={green}>
              ✓
            </T>
            <T center>We saved your picks.{"\n"}You’ll see them soon.</T>
          </>
        )}
      </Animated.View>
    </View>
  );
}
