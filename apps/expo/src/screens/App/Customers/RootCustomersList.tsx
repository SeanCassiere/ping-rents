import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AntDesign, Entypo, Ionicons } from "@expo/vector-icons";
import { DrawerActions } from "@react-navigation/native";
import { type NativeStackScreenProps } from "@react-navigation/native-stack";
import { FlashList } from "@shopify/flash-list";
import { useTheme } from "native-base";

import EmptyState from "../../../components/EmptyState";
import MainHeader from "../../../components/MainHeader";
import { useRefreshOnFocus } from "../../../hooks/useRefreshOnFocus";
import { type GlobalRoutingType } from "../../../navigation/types";
import { api, type RouterOutputs } from "../../../utils/api";
import { styles } from "../../../utils/styles";

type Props = NativeStackScreenProps<
  GlobalRoutingType["CustomersStackNavigator"],
  "RootCustomersList"
>;

const CustomerListScreen = (props: Props) => {
  const { navigation } = props;

  const customersQuery = api.customer.getAll.useQuery();
  useRefreshOnFocus(customersQuery.refetch);

  return (
    <SafeAreaView style={[styles.safeArea]}>
      <StatusBar />
      <View
        style={[
          styles.pageContainer,
          {
            paddingBottom: 20,
            gap: 10,
          },
        ]}
      >
        <MainHeader
          title="Customers"
          leftButton={{
            onPress: () => {
              props.navigation.dispatch(DrawerActions.toggleDrawer());
            },
            content: <Entypo name="menu" size={24} color="black" />,
          }}
          rightButton={{
            onPress: () => {
              navigation.push("CustomerEditScreen", { customerId: "" });
            },
            content: <AntDesign name="plus" size={24} color="black" />,
          }}
        />
        <View style={{ flex: 1 }}>
          {customersQuery.status === "success" &&
            customersQuery.data.length === 0 && (
              <View style={{ marginTop: 30 }}>
                <EmptyState
                  renderIcon={() => (
                    <Ionicons name="people" size={38} color="black" />
                  )}
                  title="No customers"
                  description="Add a customer to get started"
                  buttonProps={{
                    text: "Add customer",
                    onPress: () => {
                      navigation.push("CustomerEditScreen", { customerId: "" });
                    },
                  }}
                />
              </View>
            )}

          {customersQuery.status === "success" &&
            customersQuery.data.length !== 0 && (
              <FlashList
                data={customersQuery.data || []}
                renderItem={({ item, index }) => {
                  return (
                    <CustomerListItem
                      customer={item}
                      position={index + 1}
                      onPress={() => {
                        navigation.push("CustomerViewScreen", {
                          customerId: item.id,
                        });
                      }}
                    />
                  );
                }}
                estimatedItemSize={200}
                onRefresh={customersQuery.refetch}
                refreshing={customersQuery.isLoading}
              />
            )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CustomerListScreen;

const CustomerListItem = (props: {
  customer: RouterOutputs["customer"]["getAll"][number];
  position: number;
  onPress: () => void;
}) => {
  const { customer, position } = props;
  const theme = useTheme();
  const gray300 = theme.colors.gray[300];
  const grayDark = theme.colors.gray[600];
  return (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingVertical: 15,
        borderRadius: 5,
        borderColor: gray300,
        borderStyle: "solid",
        borderWidth: 1.5,
        marginTop: position === 0 || position === 1 ? 20 : 10,
      }}
      onPress={props.onPress}
    >
      <Text style={{ width: 20 }}>{position}</Text>
      <View
        style={{
          paddingVertical: 5,
          paddingHorizontal: 6,
          backgroundColor: grayDark,
          borderRadius: 100,
        }}
      >
        <Ionicons name="person" size={18} color="white" />
      </View>
      <View style={{ marginLeft: 10 }}>
        <Text>{customer.fullName}</Text>
      </View>
    </TouchableOpacity>
  );
};
