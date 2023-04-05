import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { NAVIGATION_KEYS } from "../utils/navigation";
import CustomerListView from "../views/CustomerListView";

const Stack = createNativeStackNavigator();

const CustomersStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={NAVIGATION_KEYS.CUSTOMER_LIST_VIEW.view}
        options={{ headerShown: false }}
      >
        {() => <CustomerListView />}
      </Stack.Screen>
      <Stack.Screen name={NAVIGATION_KEYS.CUSTOMER_DETAIL_VIEW.view}>
        {() => null}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default CustomersStack;
