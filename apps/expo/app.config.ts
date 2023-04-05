import type { ExpoConfig } from "@expo/config";

const defineConfig = (): ExpoConfig => ({
  name: "PingRents",
  slug: "pingrents",
  scheme: "expo",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/ping-rents-logo.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/ping-rents-logo.png",
    resizeMode: "contain",
    backgroundColor: "#e2e8f0",
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "your.bundle.identifier",
    config: {
      usesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/ping-rents-logo.png",
      backgroundColor: "#e2e8f0",
    },
  },
  extra: {
    PUBLIC_API_URL: process.env.PUBLIC_API_URL ?? null,
    eas: {
      projectId: "your-project-id",
    },
  },
  plugins: ["./expo-plugins/with-modify-gradle.js"],
});

export default defineConfig;
