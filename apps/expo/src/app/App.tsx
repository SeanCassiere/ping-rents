import "react-native-gesture-handler";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import * as Network from "expo-network";
import { NavigationContainer } from "@react-navigation/native";
import { NativeBaseProvider } from "native-base";

import { AuthProvider, useAuthContext } from "../context/auth.context";
import AppRouting from "../navigation";
import { TRPCProvider } from "../utils/api";

function App() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    async function checkNetwork() {
      try {
        const result = await Network.getNetworkStateAsync();
        if (result.isInternetReachable === false) {
          setIsOffline(true);
        } else {
          setIsOffline(false);
        }
      } catch (error) {
        setIsOffline(true);
      }
    }

    checkNetwork();
  }, []);

  if (isOffline) {
    return <OfflineScreen />;
  }

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <NativeBaseProvider>
          <NavigationContainer>
            <TrpcChildrenProvider />
          </NavigationContainer>
        </NativeBaseProvider>
      </SafeAreaProvider>
    </AuthProvider>
  );
}

function TrpcChildrenProvider() {
  const {
    state: { accessToken, sessionId },
    isAuthed,
  } = useAuthContext();

  return (
    <TRPCProvider
      {...{ accessToken, sessionId }}
      key={`${accessToken}-${sessionId}`}
    >
      <AppRouting isLoggedIn={isAuthed} />
    </TRPCProvider>
  );
}

function OfflineScreen() {
  return (
    <SafeAreaView>
      <View style={{ paddingTop: 20 }}>
        <Text>You are offline!</Text>
      </View>
    </SafeAreaView>
  );
}

export default App;
