import type { ConfigContext, ExpoConfig } from "@expo/config";

function getAppVariant(env: string | undefined) {
  switch (env) {
    case "production":
      return "production";
    case "preview":
      return "preview";
    default:
      return "development";
  }
}
const appVariant = getAppVariant(process.env.APP_ENV);

const defineConfig = (_: ConfigContext): ExpoConfig => ({
  name:
    appVariant === "production"
      ? "PingRents"
      : appVariant === "preview"
      ? "prev_PingRents"
      : "dev_PingRents",
  slug: "pingrents",
  owner: "seancassiere",
  scheme: "expo",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/images/splash.png",
    resizeMode: "contain",
    backgroundColor: "#FFFFFF",
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.pingstash.pingrents",
    config: {
      usesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#FFFFFF",
    },
    package:
      appVariant === "production"
        ? "com.pingstash.pingrents"
        : appVariant === "preview"
        ? "com.pingstash.pingrents_preview"
        : "com.pingstash.pingrents_dev",
  },
  extra: {
    APP_ENV: appVariant,
    PUBLIC_API_URL: process.env.PUBLIC_API_URL ?? null,
    eas: {
      projectId: "d4d476ca-f6fa-4c8c-b203-dc6f66eaf124",
    },
  },
  plugins: ["./expo-plugins/with-modify-gradle.js"],
});

export default defineConfig;
