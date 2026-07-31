import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { Colors } from "@shared/constants/Colors";
import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { hydrateOrderHistory } from "@modules/cart/store/useOrderHistoryStore";
import { hydrateConsultationHistory } from "@modules/consultation/store/useConsultationHistoryStore";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    "Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Add it to your .env file."
  );
}

// Hydrates Supabase-backed stores only after Clerk has a session, so the
// requests carry the user's JWT and pass RLS.
function HydrateOnAuth() {
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      hydrateOrderHistory();
      hydrateConsultationHistory();
    }
  }, [isLoaded, isSignedIn]);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"] ?? Colors.light;

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <HydrateOnAuth />
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.navBackground },
          headerTintColor: theme.title,
          headerShown: false,
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ title: "Home" }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(checkout)" options={{ headerShown: false }} />
        <Stack.Screen name="(review)" options={{ headerShown: false }} />
      </Stack>
    </ClerkProvider>
  );
}
