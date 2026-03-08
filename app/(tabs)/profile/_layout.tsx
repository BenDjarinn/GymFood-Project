import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function ConsultationLayout() {
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
    </Stack>
    </>
    
  );
}
