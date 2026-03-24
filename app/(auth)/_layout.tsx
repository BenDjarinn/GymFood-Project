import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";

export default function AuthLayout() {
  return (
    <>
      <StatusBar />
      <Stack screenOptions={{ headerShown: false, animation: "none" }}>
        <Stack.Screen name="OnboardingScreen" />
        <Stack.Screen name="RegisterScreen" />
        <Stack.Screen name="LoginScreen" />
      </Stack>
    </>
  );
}
