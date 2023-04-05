import React from "react";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Entypo } from "@expo/vector-icons";
import { type NativeStackScreenProps } from "@react-navigation/native-stack";
import { FlashList } from "@shopify/flash-list";
import { Button, Text, View } from "native-base";

import { useAuthContext } from "../../context/auth.context";
import { useRefreshOnFocus } from "../../hooks/useRefreshOnFocus";
import { type GlobalRoutingType } from "../../navigation/types";
import { api } from "../../utils/api";
import { styles } from "../../utils/styles";

type Props = NativeStackScreenProps<
  GlobalRoutingType["CustomerStackNavigator"],
  "CustomerList"
>;

const CustomerListScreen = (props: Props) => {
  const { navigation } = props;
  const insets = useSafeAreaInsets();
  const { logout } = useAuthContext();

  const customersQuery = api.customers.getAll.useQuery();
  useRefreshOnFocus(customersQuery.refetch);

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
            },
          ]}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Button
              variant="ghost"
              rounded="full"
              size="xs"
              onPress={() => {
                (props.navigation as any)?.toggleDrawer(); // eslint-disable-line
              }}
              padding={0}
            >
              <Entypo name="menu" size={24} color="black" />
            </Button>
            <Text style={[styles.pageTitle]}>Customers</Text>
          </View>
          <Button variant="ghost" padding={0}>
            <Entypo name="circle-with-plus" size={24} color="black" />
          </Button>
        </View>
        <View style={{ flex: 1 }}>
          <Text>Customers:</Text>
          <FlashList
            data={customersQuery.data || []}
            renderItem={({ item }) => {
              return (
                <View>
                  <Text>{JSON.stringify(item, null, 2)}</Text>
                </View>
              );
            }}
            estimatedItemSize={200}
          />
        </View>
        <View style={{ flexShrink: 0 }}>
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

export default CustomerListScreen;
