import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
    ...(Platform.OS === "web"
      ? {
          marginHorizontal: "auto",
          marginVertical: "auto",
          width: 393,
          height: 851,
          maxHeight: 851,
        }
      : {}),
  },
  pageTitle: {
    fontSize: 36,
    fontWeight: "bold",
    lineHeight: 50,
  },
  pageTitleContainer: {
    paddingTop: Platform.OS === "web" ? 18 : 0,
  },
  pageContainer: {
    paddingHorizontal: 18,
    height: "100%",
    width: "100%",
  },
  textCenter: { textAlign: "center" },
  textUnderline: { textDecorationLine: "underline" },
  errorText: { color: "red", fontSize: 14, marginVertical: 5 },
});
