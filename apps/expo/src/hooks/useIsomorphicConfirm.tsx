import { useCallback } from "react";
import { Alert, Platform } from "react-native";

export function useIsomorphicConfirm() {
  const isWeb = Platform.OS === "web";

  const confirmFn = useCallback(
    (
      title: string,
      message: string,
      {
        onConfirm,
        onReject = () => {},
        confirmText = "Confirm",
        rejectText = "Cancel",
      }: {
        onConfirm: () => Promise<void> | void;
        onReject?: () => void;
        confirmText?: string;
        rejectText?: string;
      },
    ) => {
      if (isWeb) {
        if (window.confirm(String(`${title}\n\n${message}`).trim())) {
          if (onConfirm.constructor.name === "AsyncFunction") {
            void onConfirm();
          } else {
            onConfirm();
          }
        }
      } else {
        Alert.alert(title, message, [
          { text: rejectText, onPress: onReject, style: "cancel" },
          { text: confirmText, onPress: onConfirm, style: "destructive" },
        ]);
      }
    },
    [isWeb],
  );

  return confirmFn;
}
