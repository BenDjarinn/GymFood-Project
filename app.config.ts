import type { ConfigContext, ExpoConfig } from "expo/config";

// Extends app.json with build-time secrets read from .env. Expo loads
// app.json first and passes it in as `config`, so we only override the
// pieces that need env injection.
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...(config as ExpoConfig),
  android: {
    ...(config.android ?? {}),
    config: {
      ...((config.android as any)?.config ?? {}),
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY ?? "",
      },
    },
  },
  ios: {
    ...(config.ios ?? {}),
    config: {
      ...((config.ios as any)?.config ?? {}),
      googleMapsApiKey: process.env.GOOGLE_MAPS_IOS_API_KEY ?? "",
    },
  },
});
