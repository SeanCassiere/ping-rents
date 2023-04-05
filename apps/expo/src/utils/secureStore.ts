import * as SecureStore from "expo-secure-store";

export async function saveToSecureStore(key: string, value: string) {
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    return window.localStorage.setItem(key, value);
  }
  return await SecureStore.setItemAsync(key, value);
}

export async function getValueFromSecureStore(key: string) {
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    return window.localStorage.getItem(key);
  }
  return await SecureStore.getItemAsync(key);
}

export async function deleteFromSecureStore(key: string) {
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    return window.localStorage.removeItem(key);
  }
  return await SecureStore.deleteItemAsync(key);
}
