import React, { useState } from "react";
import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import AnimatedSplashScreen from "@shared/components/AnimatedSplashScreen";

export default function IndexRedirect() {
  const { isSignedIn, isLoaded } = useAuth();
  const [splashDone, setSplashDone] = useState(false);

  // While splash is still playing, show animated splash screen
  if (!splashDone) {
    return (
      <View style={styles.splashWrapper}>
        {/* Activity indicator underneath for slow Clerk loads */}
        {!isLoaded && (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#1EAAE6" />
          </View>
        )}
        <AnimatedSplashScreen onAnimationEnd={() => setSplashDone(true)} />
      </View>
    );
  }

  // Splash finished — Clerk may still be loading
  if (!isLoaded) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1EAAE6" />
      </View>
    );
  }

  if (isSignedIn) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/(auth)/OnboardingScreen" />;
}

const styles = StyleSheet.create({
  splashWrapper: {
    flex: 1,
    backgroundColor: "#0A1628",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A1628",
  },
});
