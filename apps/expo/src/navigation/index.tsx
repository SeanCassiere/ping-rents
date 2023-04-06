import { useCallback } from "react";
import { View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useAuthContext } from "../context/auth.context";
import CustomerListScreen from "../screens/App/CustomerList";
import HomeScreen from "../screens/App/Home";
import LoginAccessCodeScreen from "../screens/Auth/LoginAccessCode";
import LoginCompaniesScreen from "../screens/Auth/LoginCompanies";
import LoginEmailScreen from "../screens/Auth/LoginEmail";
import RegisterScreen from "../screens/Auth/Register";
import { type GlobalRoutingType } from "./types";

SplashScreen.preventAutoHideAsync();

const RootStack =
  createNativeStackNavigator<GlobalRoutingType["RootStackNavigator"]>();

export default function RootRoutes({ isLoggedIn }: { isLoggedIn: boolean }) {
  const { isInitialLoad } = useAuthContext();

  const onLayoutRootView = useCallback(async () => {
    if (!isInitialLoad) {
      await SplashScreen.hideAsync();
    }
  }, [isInitialLoad]);

  if (isInitialLoad) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <RootStack.Navigator>
        {isLoggedIn ? (
          <RootStack.Screen
            name="AppDrawer"
            component={AppDrawerRoutes}
            options={{ headerShown: false }}
          />
        ) : (
          <RootStack.Screen
            name="AuthStack"
            component={AuthStackRoutes}
            options={{ headerShown: false }}
          />
        )}
      </RootStack.Navigator>
    </View>
  );
}

const AuthStack =
  createNativeStackNavigator<GlobalRoutingType["AuthStackNavigator"]>();
export const AuthStackRoutes = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "white" },
        headerShadowVisible: false,
      }}
    >
      <AuthStack.Screen
        name="LoginEmail"
        component={LoginEmailScreen}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="LoginAccessCode"
        component={LoginAccessCodeScreen}
        options={{ title: "" }}
        initialParams={{ email: "" }}
      />
      <AuthStack.Screen
        name="LoginCompanies"
        component={LoginCompaniesScreen}
        options={{ title: "" }}
        initialParams={{ email: "", accessCode: "", companyId: "" }}
      />
      <AuthStack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: "" }}
      />
    </AuthStack.Navigator>
  );
};

const AppDrawer = createDrawerNavigator<GlobalRoutingType["AppDrawer"]>();
const AppDrawerRoutes = () => {
  return (
    <AppDrawer.Navigator>
      <AppDrawer.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false, title: "Dashboard" }}
      />

      <AppDrawer.Screen
        name="Customers"
        component={CustomerStackRoutes}
        options={{ headerShown: false }}
      />
    </AppDrawer.Navigator>
  );
};

const CustomerStack =
  createNativeStackNavigator<GlobalRoutingType["CustomerStackNavigator"]>();
const CustomerStackRoutes = () => {
  return (
    <CustomerStack.Navigator>
      <CustomerStack.Screen
        name="CustomerList"
        component={CustomerListScreen}
        options={{ headerShown: false }}
      />
    </CustomerStack.Navigator>
  );
};
