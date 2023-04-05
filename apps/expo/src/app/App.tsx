import { Button, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { NativeBaseProvider } from "native-base";

import { AuthProvider, useAuthContext } from "../context/auth.context";
import { TRPCProvider, api } from "../utils/api";
import { NAVIGATION_KEYS } from "../utils/navigation";
import LoginView from "../views/LoginView";
import RegisterView from "../views/Register";

function App() {
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
  } = useAuthContext();
  return (
    <TRPCProvider
      {...{ accessToken, sessionId }}
      key={`${accessToken}-${sessionId}`}
    >
      <AuthSelectionView />
    </TRPCProvider>
  );
}

const Tab = createBottomTabNavigator();

function AuthSelectionView() {
  const { isAuthed } = useAuthContext();
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarHideOnKeyboard: true,
        tabBarItemStyle: { paddingBottom: 10 },
        tabBarStyle: { height: 55, display: !isAuthed ? "none" : undefined },
      }}
    >
      {isAuthed ? (
        <>
          <Tab.Screen name="Customers" component={LoggedInView} />
        </>
      ) : (
        <>
          <Tab.Screen
            name={NAVIGATION_KEYS.LOGIN_TAB.view}
            component={LoginView}
            options={{
              title: NAVIGATION_KEYS.LOGIN_TAB.title,
              tabBarStyle: { display: "none" },
              headerShown: false,
            }}
          />
          <Tab.Screen
            name={NAVIGATION_KEYS.REGISTER_TAB.view}
            component={RegisterView}
            options={{
              title: NAVIGATION_KEYS.REGISTER_TAB.title,
              tabBarStyle: { display: "none" },
              headerShown: false,
            }}
          />
        </>
      )}
    </Tab.Navigator>
  );
}

function LoggedInView() {
  const { logout, isAuthed, state } = useAuthContext();
  const session = api.auth.getAuthUser.useQuery(undefined, {});
  return (
    <View style={{ paddingTop: 20 }}>
      <Text>LoggedInView</Text>
      <Button title="Logout" onPress={logout} />
      <View style={{ marginHorizontal: 4 }}>
        <Text>{JSON.stringify(session.data, null, 2)}</Text>
      </View>
      <View>
        <Button title="refresh" onPress={() => session.refetch()} />
      </View>
      <View style={{ marginHorizontal: 4 }}>
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
