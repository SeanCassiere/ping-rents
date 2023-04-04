import { Button, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";

import { AuthProvider, useAuthContext } from "../context/auth.context";
import { TRPCProvider, api } from "../utils/api";
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
  const {
    state: { accessToken, sessionId },
  } = useAuthContext();
  return (
    <TRPCProvider
      {...{ accessToken, sessionId }}
      key={`${accessToken}-${sessionId}`}
    >
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
  const { logout, isAuthed, state } = useAuthContext();
  const session = api.auth.getAuthUser.useQuery(undefined, {});
  return (
    <View className="pt-20">
      <Text>LoggedInView</Text>
      <Button title="Logout" onPress={logout} />
      <View className="mx-2">
        <Text>{JSON.stringify(session.data, null, 2)}</Text>
      </View>
      <View>
        <Button title="refresh" onPress={() => session.refetch()} />
      </View>
      <View className="mx-2">
        <Text>
          {JSON.stringify(
            { mode: state.mode, sessionId: state.sessionId, isAuthed },
            null,
            2,
          )}
        </Text>
        <Text>{JSON.stringify(state.accessToken, null, 2)}</Text>
      </View>
    </View>
  );
}

export default App;
