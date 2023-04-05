import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import * as Network from "expo-network";
import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { NativeBaseProvider } from "native-base";

import { AuthProvider, useAuthContext } from "../context/auth.context";
import { TRPCProvider } from "../utils/api";
import { NAVIGATION_KEYS } from "../utils/navigation";
import LoginView from "../views/LoginView";
import RegisterView from "../views/Register";
import CustomersStack from "./Customer.stack";

function App() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const checker = async (fn: (value: boolean) => void) => {
      const result = await Network.getNetworkStateAsync();
      if (result.isInternetReachable === false) {
        fn(true);
      } else {
        fn(false);
      }
    };

    checker(setIsOffline);
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
        tabBarStyle: {
          height: 70,
          display: !isAuthed ? "none" : undefined,
          backgroundColor: "white",
          paddingTop: 10,
          paddingBottom: 5,
          paddingHorizontal: 8,
        },
      }}
    >
      {isAuthed ? (
        <>
          <Tab.Screen
            name={NAVIGATION_KEYS.CUSTOMER_TAB.view}
            component={CustomersStack}
            options={{
              title: NAVIGATION_KEYS.CUSTOMER_TAB.title,
              headerShown: false,
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="md-people" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Vehicles"
            options={{
              title: "Vehicles",
              headerShown: false,
              tabBarIcon: ({ color, size }) => (
                <FontAwesome5 name="car" size={size} color={color} />
              ),
            }}
          >
            {() => (
              <View>
                <Text>Vehicles</Text>
              </View>
            )}
          </Tab.Screen>
          <Tab.Screen
            name="Reservations"
            options={{
              title: "Reservations",
              headerShown: false,
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons
                  name="bookshelf"
                  size={size}
                  color={color}
                />
              ),
            }}
          >
            {() => (
              <View>
                <Text>Reservations</Text>
              </View>
            )}
          </Tab.Screen>
          <Tab.Screen
            name="Agreements"
            options={{
              title: "Agreements",
              headerShown: false,
              tabBarIcon: ({ color, size }) => (
                <FontAwesome5 name="file-signature" size={size} color={color} />
              ),
            }}
          >
            {() => (
              <View>
                <Text>Agreements</Text>
              </View>
            )}
          </Tab.Screen>
          <Tab.Screen
            name="Settings"
            options={{
              title: "Settings",
              headerShown: false,
              tabBarIcon: ({ color, size }) => (
                <FontAwesome5 name="cogs" size={size} color={color} />
              ),
            }}
          >
            {() => (
              <View>
                <Text>Settings</Text>
              </View>
            )}
          </Tab.Screen>
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
