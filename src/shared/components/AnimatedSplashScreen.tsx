import React, { useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  StatusBar,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  withSpring,
  Easing,
  runOnJS,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const LOGO_SIZE = 140;

interface AnimatedSplashScreenProps {
  onAnimationEnd: () => void;
}

export default function AnimatedSplashScreen({
  onAnimationEnd,
}: AnimatedSplashScreenProps) {
  // ── Shared values ──────────────────────────────────────────────
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const logoRotate = useSharedValue(-15);

  const ring1Scale = useSharedValue(0.8);
  const ring1Opacity = useSharedValue(0);
  const ring2Scale = useSharedValue(0.8);
  const ring2Opacity = useSharedValue(0);
  const ring3Scale = useSharedValue(0.8);
  const ring3Opacity = useSharedValue(0);

  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);

  const subtitleOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(15);

  const fadeOut = useSharedValue(1);

  // ── Animation sequence ─────────────────────────────────────────
  const finishAnimation = useCallback(() => {
    onAnimationEnd();
  }, [onAnimationEnd]);

  useEffect(() => {
    // 1) Logo entrance — scale up with spring + rotation snap + fade in
    logoOpacity.value = withTiming(1, { duration: 600 });
    logoScale.value = withSpring(1, {
      damping: 12,
      stiffness: 100,
      mass: 1,
    });
    logoRotate.value = withSpring(0, {
      damping: 14,
      stiffness: 90,
    });

    // 2) Pulsing rings — staggered ripple outward
    const ringConfig = { duration: 1800, easing: Easing.out(Easing.ease) };
    ring1Scale.value = withDelay(
      400,
      withRepeat(withTiming(2.2, ringConfig), 2, false)
    );
    ring1Opacity.value = withDelay(
      400,
      withRepeat(
        withSequence(
          withTiming(0.5, { duration: 300 }),
          withTiming(0, { duration: 1500 })
        ),
        2,
        false
      )
    );

    ring2Scale.value = withDelay(
      700,
      withRepeat(withTiming(2.2, ringConfig), 2, false)
    );
    ring2Opacity.value = withDelay(
      700,
      withRepeat(
        withSequence(
          withTiming(0.4, { duration: 300 }),
          withTiming(0, { duration: 1500 })
        ),
        2,
        false
      )
    );

    ring3Scale.value = withDelay(
      1000,
      withRepeat(withTiming(2.2, ringConfig), 2, false)
    );
    ring3Opacity.value = withDelay(
      1000,
      withRepeat(
        withSequence(
          withTiming(0.3, { duration: 300 }),
          withTiming(0, { duration: 1500 })
        ),
        2,
        false
      )
    );

    // 3) Title slide up + fade in
    titleOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));
    titleTranslateY.value = withDelay(
      800,
      withSpring(0, { damping: 14, stiffness: 90 })
    );

    // 4) Subtitle slide up + fade in
    subtitleOpacity.value = withDelay(1200, withTiming(1, { duration: 600 }));
    subtitleTranslateY.value = withDelay(
      1200,
      withSpring(0, { damping: 14, stiffness: 90 })
    );

    // 5) Hold, then fade everything out and fire callback
    fadeOut.value = withDelay(
      3200,
      withTiming(0, { duration: 600, easing: Easing.inOut(Easing.ease) }, () => {
        runOnJS(finishAnimation)();
      })
    );
  }, []);

  // ── Animated styles ────────────────────────────────────────────
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotate.value}deg` },
    ],
  }));

  const ring1Style = useAnimatedStyle(() => ({
    opacity: ring1Opacity.value,
    transform: [{ scale: ring1Scale.value }],
  }));

  const ring2Style = useAnimatedStyle(() => ({
    opacity: ring2Opacity.value,
    transform: [{ scale: ring2Scale.value }],
  }));

  const ring3Style = useAnimatedStyle(() => ({
    opacity: ring3Opacity.value,
    transform: [{ scale: ring3Scale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleTranslateY.value }],
  }));

  const containerFade = useAnimatedStyle(() => ({
    opacity: fadeOut.value,
  }));

  // ── Render ─────────────────────────────────────────────────────
  return (
    <Animated.View style={[styles.container, containerFade]}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1628" />

      {/* Subtle gradient accent – top-left glow */}
      <View style={styles.glowTopLeft} />
      {/* Subtle gradient accent – bottom-right glow */}
      <View style={styles.glowBottomRight} />

      {/* Logo group */}
      <View style={styles.logoWrapper}>
        {/* Ripple rings */}
        <Animated.View style={[styles.ring, ring1Style]} />
        <Animated.View style={[styles.ring, ring2Style]} />
        <Animated.View style={[styles.ring, ring3Style]} />

        {/* Logo */}
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <Image
            source={require("@/assets/gymfood-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      {/* App name */}
      <Animated.View style={[styles.textContainer, titleStyle]}>
        <Text style={styles.titleGym}>Gym</Text>
        <Text style={styles.titleFood}>Food</Text>
      </Animated.View>

      {/* Tagline */}
      <Animated.Text style={[styles.subtitle, subtitleStyle]}>
        Fuel Your Fitness
      </Animated.Text>
    </Animated.View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0A1628",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  /* Ambient glow spots */
  glowTopLeft: {
    position: "absolute",
    top: -SCREEN_HEIGHT * 0.15,
    left: -SCREEN_WIDTH * 0.25,
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    borderRadius: SCREEN_WIDTH * 0.4,
    backgroundColor: "rgba(30, 144, 215, 0.08)",
  },
  glowBottomRight: {
    position: "absolute",
    bottom: -SCREEN_HEIGHT * 0.12,
    right: -SCREEN_WIDTH * 0.2,
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.7,
    borderRadius: SCREEN_WIDTH * 0.35,
    backgroundColor: "rgba(245, 190, 70, 0.06)",
  },

  /* Logo wrapper — centres rings + logo */
  logoWrapper: {
    width: LOGO_SIZE * 2.5,
    height: LOGO_SIZE * 2.5,
    justifyContent: "center",
    alignItems: "center",
  },
  ring: {
    position: "absolute",
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    borderWidth: 2,
    borderColor: "rgba(30, 170, 230, 0.35)",
  },
  logoContainer: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },

  /* Text */
  textContainer: {
    flexDirection: "row",
    marginTop: -10,
  },
  titleGym: {
    fontSize: 38,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 2,
  },
  titleFood: {
    fontSize: 38,
    fontWeight: "800",
    color: "#1EAAE6",
    letterSpacing: 2,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.5)",
    letterSpacing: 4,
    textTransform: "uppercase",
  },
});
