import * as SecureStore from "expo-secure-store";

export async function saveToSecureStore(key: string, value: string) {
  return await SecureStore.setItemAsync(key, value);
}

export async function getValueFromSecureStore(key: string) {
  return await SecureStore.getItemAsync(key);
}

export async function deleteFromSecureStore(key: string) {
  return await SecureStore.deleteItemAsync(key);
}
