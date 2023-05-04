import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AntDesign, Entypo, Ionicons } from "@expo/vector-icons";
import { type NativeStackScreenProps } from "@react-navigation/native-stack";

import Button from "../../../components/Button";
import MainHeader from "../../../components/MainHeader";
import { useRefreshOnFocus } from "../../../hooks/useRefreshOnFocus";
import { type GlobalRoutingType } from "../../../navigation/types";
import { api } from "../../../utils/api";
import { styles } from "../../../utils/styles";

type Props = NativeStackScreenProps<
  GlobalRoutingType["CustomersStackNavigator"],
  "CustomerViewScreen"
>;

const CustomerViewScreen = (props: Props) => {
  const backNavigation = () => {
    props.navigation.canGoBack()
      ? props.navigation.goBack()
      : props.navigation.navigate("RootCustomersList");
  };

  const customer = api.customer.getCustomer.useQuery({
    id: props.route.params.customerId,
  });
  useRefreshOnFocus(customer.refetch);

  return (
    <SafeAreaView style={[styles.safeArea]}>
      <StatusBar />
      <View style={[styles.pageContainer]}>
        <MainHeader
          title="View customer"
          leftButton={{
            onPress: backNavigation,
            content: <AntDesign name="left" size={24} color="black" />,
          }}
          rightButton={{
            onPress: () => {
              props.navigation.push("CustomerEditScreen", {
                customerId: props.route.params.customerId,
              });
            },
            content: <AntDesign name="edit" size={24} color="black" />,
          }}
        />
        <View
          style={{ paddingTop: 30, justifyContent: "space-between", flex: 1 }}
        >
          <View>
            <View
              style={{
                paddingVertical: 10,
                paddingHorizontal: 10,
                backgroundColor: "black",
                borderRadius: 100,
                width: 90,
                height: 90,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <Ionicons name="person" size={64} color="white" />
            </View>
            {customer.status === "success" && (
              <View style={{ gap: 10 }}>
                <View style={textStyle.labelWrapper}>
                  <Text style={textStyle.tagStyle}>First name:</Text>
                  <Text style={textStyle.labelStyle}>
                    {customer.data.firstName}
                  </Text>
                </View>
                <View style={textStyle.labelWrapper}>
                  <Text style={textStyle.tagStyle}>Last name:</Text>
                  <Text style={textStyle.labelStyle}>
                    {customer.data.lastName}
                  </Text>
                </View>
                <View style={textStyle.labelWrapper}>
                  <Text style={textStyle.tagStyle}>Email:</Text>
                  <Text style={textStyle.labelStyle}>
                    {customer.data.email}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
        <View
          style={{
            paddingBottom: 20,
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <Button style={{ width: "48%" }}>
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
                gap: 5,
              }}
            >
              <Text style={{ color: "white", fontWeight: "600" }}>
                Reservation
              </Text>
              <Entypo name="plus" size={24} color="white" />
            </View>
          </Button>
          <Button style={{ width: "48%" }}>
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
                gap: 5,
              }}
            >
              <Text style={{ color: "white", fontWeight: "600" }}>
                Agreement
              </Text>
              <Entypo name="plus" size={24} color="white" />
            </View>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

const fontSize = 18;

const textStyle = StyleSheet.create({
  tagStyle: {
    fontSize: fontSize,
    fontWeight: "bold",
  },
  labelStyle: {
    fontSize: fontSize,
  },
  labelWrapper: {
    gap: 5,
  },
});

export default CustomerViewScreen;
