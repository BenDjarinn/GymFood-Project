import { useCallback, useState, useEffect } from "react";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useSSO } from "@clerk/expo";
import { useRouter } from "expo-router";
import { Platform } from "react-native";
import { type Href } from "expo-router";

// Ensure web browser auth session completes properly
WebBrowser.maybeCompleteAuthSession();

/**
 * Shared hook for Google OAuth sign-in/sign-up via Clerk's `useSSO()`.
 *
 * Uses browser-based OAuth flow (standard approach for Expo dev builds).
 * Works for both LoginScreen and RegisterScreen — Clerk automatically
 * handles sign-in vs sign-up transfer behind the scenes.
 *
 * @returns {{ handleGoogleSignIn: () => Promise<void>, isLoading: boolean }}
 */
export function useGoogleOAuth() {
  const { startSSOFlow } = useSSO();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Warm up browser on Android to reduce OAuth load time
  useEffect(() => {
    if (Platform.OS !== "android") return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);

  const handleGoogleSignIn = useCallback(async () => {
    setIsLoading(true);

    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl: AuthSession.makeRedirectUri({
          scheme: "gymfood",
          path: "/(auth)/LoginScreen",
        }),
      });

      if (createdSessionId && setActive) {
        await setActive({
          session: createdSessionId,
          navigate: async ({ session }) => {
            // Handle session tasks if any
            if (session?.currentTask) {
              console.log(session.currentTask);
              return;
            }
            // Navigate to home
            router.replace("/(tabs)/home" as Href);
          },
        });
      } else {
        // Session not created — might need additional info
        console.log("OAuth completed but no session created.");
      }
    } catch (err: any) {
      // User cancelled or error occurred
      if (err?.message?.includes("cancelled")) {
        // User cancelled — do nothing
        return;
      }
      console.error("Google OAuth error:", JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
  }, [startSSOFlow, router]);

  return { handleGoogleSignIn, isLoading };
}
