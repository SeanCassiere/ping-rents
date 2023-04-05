import React from "react";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Entypo } from "@expo/vector-icons";
import { Button, Text, View } from "native-base";

import { useAuthContext } from "../context/auth.context";
import { api } from "../utils/api";
import { styles } from "../utils/styles";

const CustomerListView = () => {
  const insets = useSafeAreaInsets();
  const { logout } = useAuthContext();

  const customersQuery = api.customers.getAll.useQuery();

  return (
    <SafeAreaView style={[styles.safeArea]}>
      <StatusBar />
      <View
        style={[
          styles.pageContainer,
          {
            paddingTop: insets.top,
            paddingBottom: 20,
            gap: 10,
          },
        ]}
      >
        <View
          style={[
            styles.pageTitleContainer,
            {
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            },
          ]}
        >
          <Text style={[styles.pageTitle]}>Customers</Text>
          <View>
            <Button variant="ghost">
              <Entypo name="circle-with-plus" size={24} color="black" />
            </Button>
          </View>
        </View>
        <View>
          <Text>Customers:</Text>
          <Text>{JSON.stringify(customersQuery.data || [], null, 1)}</Text>
        </View>
        <View>
          <Button
            onPress={() => {
              logout();
            }}
          >
            Logout
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CustomerListView;
