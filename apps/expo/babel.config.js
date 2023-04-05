module.exports = function (api) {
  api.cache(true);

  // Make Expo Router run from `src/app` instead of `app`.
  // Path is relative to `/node_modules/expo-router`
  process.env.EXPO_ROUTER_APP_ROOT = "../../apps/expo/src/app";

  return {
    plugins: [
      "@babel/plugin-proposal-export-namespace-from",
      ["react-native-reanimated/plugin", { relativeSourceLocation: true }],
    ],
    presets: ["babel-preset-expo"],
  };
};
