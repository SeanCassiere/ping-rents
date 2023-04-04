import { Button, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";

import { AuthProvider, useAuthContext } from "../context/auth.context";
import { TRPCProvider } from "../utils/api";
import LoggedOutStack from "./logged-out.stack";

function App() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <BottomChildren />
        </NavigationContainer>
      </SafeAreaProvider>
    </AuthProvider>
  );
}

function BottomChildren() {
  const { accessToken, sessionId } = useAuthContext();
  return (
    <TRPCProvider {...{ accessToken, sessionId }}>
      <StatusBar style="auto" />
      <AuthSelectionView />
    </TRPCProvider>
  );
}

function AuthSelectionView() {
  const { isAuthed } = useAuthContext();
  return isAuthed ? <LoggedInView /> : <LoggedOutStack />;
}

function LoggedInView() {
  const { logout } = useAuthContext();
  return (
    <View className="pt-20">
      <Text>LoggedInView</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}

export default App;
