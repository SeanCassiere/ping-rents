import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginView from "../views/LoginView";
import RegisterView from "./register.view";

const Stack = createNativeStackNavigator();

const LoggedOutStack = () => {
  return (
    <Stack.Navigator initialRouteName="login">
      <Stack.Screen
        name="login"
        component={LoginView}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="register"
        component={RegisterView}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default LoggedOutStack;
