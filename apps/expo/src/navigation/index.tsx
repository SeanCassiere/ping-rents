import { useCallback } from "react";
import { View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import {
  FontAwesome5,
  Ionicons,
  // MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import DrawerNavigation from "../components/DrawerNavigation";
import { useAuthContext } from "../context/auth.context";
import AgreementCheckInScreen from "../screens/App/Agreements/AgreementCheckInScreen";
import AgreementEditScreen from "../screens/App/Agreements/AgreementEditScreen";
import AgreementsListScreen from "../screens/App/Agreements/RootAgreementsList";
import AgreementViewScreen from "../screens/App/Agreements/ViewAgreementScreen";
import CustomerEditScreen from "../screens/App/Customers/CustomerEditScreen";
import CustomerViewScreen from "../screens/App/Customers/CustomerViewScreen";
import CustomerListScreen from "../screens/App/Customers/RootCustomersList";
import HomeScreen from "../screens/App/Home";
import ReservationsListScreen from "../screens/App/Reservations/RootReservationsList";
import ReservationViewScreen from "../screens/App/Reservations/ViewReservationScreen";
import CompanyEditScreen from "../screens/App/Settings/CompanyEdit";
import EmployeeEditScreen from "../screens/App/Settings/EmployeeEdit";
import EmployeesListScreen from "../screens/App/Settings/EmployeesList";
import RentalRateEditScreen from "../screens/App/Settings/RentalRateEdit";
import RentalRatesListScreen from "../screens/App/Settings/RentalRatesList";
import RootSettingsScreen from "../screens/App/Settings/Root";
import TaxEditScreen from "../screens/App/Settings/TaxEdit";
import TaxesListScreen from "../screens/App/Settings/TaxesList";
import VehicleTypesEditScreen from "../screens/App/Settings/VehicleTypeEdit";
import VehicleTypesListScreen from "../screens/App/Settings/VehicleTypesList";
import VehiclesListScreen from "../screens/App/Vehicles/RootVehiclesList";
import VehicleEditScreen from "../screens/App/Vehicles/VehicleEditScreen";
import VehicleViewScreen from "../screens/App/Vehicles/VehicleViewScreen";
import LoginAccessCodeScreen from "../screens/Auth/LoginAccessCode";
import LoginCompaniesScreen from "../screens/Auth/LoginCompanies";
import LoginEmailScreen from "../screens/Auth/LoginEmail";
import PolicyViewerScreen from "../screens/Auth/PolicyViewer";
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
        options={{ headerShown: false }}
        initialParams={{ email: "" }}
      />

      <AuthStack.Screen
        name="LoginCompanies"
        component={LoginCompaniesScreen}
        options={{ headerShown: false }}
        initialParams={{ email: "", accessCode: "", companyId: "" }}
      />

      <AuthStack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="PolicyWebView"
        component={PolicyViewerScreen}
        options={{ headerShown: false }}
      />
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
        swipeEdgeWidth: 80,
        drawerType: "back",
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
        component={VehicleStackRoutes}
        options={{
          headerShown: false,
          title: "Vehicles",
          drawerIcon: ({ size, color }) => (
            <FontAwesome5 name="car" size={size} color={color} />
          ),
        }}
      />

      {/* <AppDrawer.Screen
        name="Reservations"
        component={ReservationStackRoutes}
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
      /> */}

      <AppDrawer.Screen
        name="Agreements"
        component={AgreementStackRoutes}
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
  createNativeStackNavigator<GlobalRoutingType["CustomersStackNavigator"]>();
const CustomerStackRoutes = () => {
  return (
    <CustomerStack.Navigator
      screenOptions={{ animation: "slide_from_right", presentation: "card" }}
    >
      <CustomerStack.Screen
        name="RootCustomersList"
        component={CustomerListScreen}
        options={{ headerShown: false }}
      />
      <CustomerStack.Screen
        name="CustomerViewScreen"
        component={CustomerViewScreen}
        options={{ headerShown: false }}
      />
      <CustomerStack.Screen
        name="CustomerEditScreen"
        component={CustomerEditScreen}
        options={{ headerShown: false }}
      />
    </CustomerStack.Navigator>
  );
};

const VehicleStack =
  createNativeStackNavigator<GlobalRoutingType["VehiclesStackNavigator"]>();
const VehicleStackRoutes = () => {
  return (
    <VehicleStack.Navigator
      screenOptions={{ animation: "slide_from_right", presentation: "card" }}
    >
      <VehicleStack.Screen
        name="RootVehiclesList"
        component={VehiclesListScreen}
        options={{ headerShown: false }}
      />
      <VehicleStack.Screen
        name="VehicleViewScreen"
        component={VehicleViewScreen}
        options={{ headerShown: false }}
      />
      <VehicleStack.Screen
        name="VehicleEditScreen"
        component={VehicleEditScreen}
        options={{ headerShown: false }}
      />
    </VehicleStack.Navigator>
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
        name="CompanyEditScreen"
        component={CompanyEditScreen}
        options={{ headerShown: false }}
      />
      <SettingsStack.Screen
        name="VehicleTypesListScreen"
        component={VehicleTypesListScreen}
        options={{ headerShown: false }}
      />
      <SettingsStack.Screen
        name="VehicleTypeEditScreen"
        component={VehicleTypesEditScreen}
        options={{ headerShown: false }}
      />
      <SettingsStack.Screen
        name="TaxesListScreen"
        component={TaxesListScreen}
        options={{ headerShown: false }}
      />
      <SettingsStack.Screen
        name="TaxEditScreen"
        component={TaxEditScreen}
        options={{ headerShown: false }}
      />
      <SettingsStack.Screen
        name="EmployeesListScreen"
        component={EmployeesListScreen}
        options={{ headerShown: false }}
      />
      <SettingsStack.Screen
        name="EmployeeEditScreen"
        component={EmployeeEditScreen}
        options={{ headerShown: false }}
      />
      <SettingsStack.Screen
        name="RentalRatesListScreen"
        component={RentalRatesListScreen}
        options={{ headerShown: false }}
      />
      <SettingsStack.Screen
        name="RentalRateEditScreen"
        component={RentalRateEditScreen}
        options={{ headerShown: false }}
      />
    </SettingsStack.Navigator>
  );
};

const AgreementStack =
  createNativeStackNavigator<GlobalRoutingType["AgreementsStackNavigator"]>();
const AgreementStackRoutes = () => {
  return (
    <AgreementStack.Navigator
      screenOptions={{ animation: "slide_from_right", presentation: "card" }}
    >
      <AgreementStack.Screen
        name="RootAgreementsList"
        component={AgreementsListScreen}
        options={{ headerShown: false }}
      />
      <AgreementStack.Screen
        name="AgreementViewScreen"
        component={AgreementViewScreen}
        options={{ headerShown: false }}
      />
      <AgreementStack.Screen
        name="AgreementEditScreen"
        component={AgreementEditScreen}
        options={{ headerShown: false }}
      />
      <AgreementStack.Screen
        name="AgreementCheckInScreen"
        component={AgreementCheckInScreen}
        options={{ headerShown: false }}
      />
    </AgreementStack.Navigator>
  );
};

const ReservationStack =
  createNativeStackNavigator<GlobalRoutingType["ReservationsStackNavigator"]>();
const ReservationStackRoutes = () => {
  return (
    <ReservationStack.Navigator
      screenOptions={{ animation: "slide_from_right", presentation: "card" }}
    >
      <ReservationStack.Screen
        name="RootReservationsList"
        component={ReservationsListScreen}
        options={{ headerShown: false }}
      />
      <ReservationStack.Screen
        name="ReservationViewScreen"
        component={ReservationViewScreen}
        options={{ headerShown: false }}
      />
    </ReservationStack.Navigator>
  );
};
