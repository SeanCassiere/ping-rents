import { useCallback } from "react";
import { View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import DrawerNavigation from "../components/DrawerNavigation";
import { useAuthContext } from "../context/auth.context";
import CustomerListScreen from "../screens/App/CustomerList";
import HomeScreen from "../screens/App/Home";
import RootSettingsScreen from "../screens/App/Settings/Root";
import VehicleTypesListScreen from "../screens/App/Settings/VehicleTypesList";
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
        animation: "slide_from_right",
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

      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
};

const AppDrawer = createDrawerNavigator<GlobalRoutingType["AppDrawer"]>();
const AppDrawerRoutes = () => {
  const { logout } = useAuthContext();

  return (
    <AppDrawer.Navigator
      drawerContent={(props) => (
        <DrawerNavigation {...props} onLogout={logout} />
      )}
      screenOptions={{
        drawerActiveBackgroundColor: "#111111",
        drawerActiveTintColor: "#fff",
        drawerLabelStyle: {
          fontSize: 16,
          marginLeft: -20,
        },
        drawerItemStyle: {
          paddingHorizontal: 5,
        },
      }}
    >
      <AppDrawer.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false,
          title: "Dashboard",
          drawerIcon: ({ size, color }) => (
            <MaterialIcons name="dashboard" size={size} color={color} />
          ),
        }}
      />

      <AppDrawer.Screen
        name="Customers"
        component={CustomerStackRoutes}
        options={{
          headerShown: false,
          title: "Customers",
          drawerIcon: ({ size, color }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />

      <AppDrawer.Screen
        name="Vehicles"
        component={CustomerStackRoutes}
        options={{
          headerShown: false,
          title: "Vehicles",
          drawerIcon: ({ size, color }) => (
            <FontAwesome5 name="car" size={size} color={color} />
          ),
        }}
      />

      <AppDrawer.Screen
        name="Reservations"
        component={CustomerStackRoutes}
        options={{
          headerShown: false,
          title: "Reservations",
          drawerIcon: ({ size, color }) => (
            <MaterialCommunityIcons
              name="bookshelf"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <AppDrawer.Screen
        name="Agreements"
        component={CustomerStackRoutes}
        options={{
          headerShown: false,
          title: "Agreements",
          drawerIcon: ({ size, color }) => (
            <FontAwesome5 name="file-signature" size={size} color={color} />
          ),
        }}
      />

      <AppDrawer.Screen
        name="Settings"
        component={SettingsStackRoutes}
        options={{
          headerShown: false,
          title: "Configuration",
          drawerIcon: ({ size, color }) => (
            <FontAwesome5 name="cog" size={size} color={color} />
          ),
        }}
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

const SettingsStack =
  createNativeStackNavigator<GlobalRoutingType["SettingsStackNavigator"]>();
const SettingsStackRoutes = () => {
  return (
    <SettingsStack.Navigator
      screenOptions={{ animation: "slide_from_right", presentation: "card" }}
    >
      <SettingsStack.Screen
        name="RootSettingsScreen"
        component={RootSettingsScreen}
        options={{ headerShown: false }}
      />
      <SettingsStack.Screen
        name="VehicleTypesListScreen"
        component={VehicleTypesListScreen}
        options={{ headerShown: false }}
      />
    </SettingsStack.Navigator>
  );
};
