import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";

export default function AuthLayout() {
  return (
    <>
      <StatusBar />
      <Stack screenOptions={{ headerShown: false, animation: "none" }} />
    </>
  );
}
