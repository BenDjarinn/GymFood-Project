import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function ForumLayout() {
  return (
    <>
    <StatusBar style="auto" />
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="CreatePostScreen"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
    </>
    
  );
}
