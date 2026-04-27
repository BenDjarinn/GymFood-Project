import React from "react";
import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";
import { StatusBar } from "react-native";

export default function AuthLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;

  if (isSignedIn) {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <>
      <StatusBar />
      <Stack screenOptions={{ headerShown: false, animation: "none" }}>
        <Stack.Screen name="OnboardingScreen" />
        <Stack.Screen name="RegisterScreen" />
        <Stack.Screen name="LoginScreen" />
        <Stack.Screen name="ForgotPasswordScreen" />
      </Stack>
    </>
  );
}
