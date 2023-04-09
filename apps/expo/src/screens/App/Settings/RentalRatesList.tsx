import React, { useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AntDesign } from "@expo/vector-icons";
import { type NativeStackScreenProps } from "@react-navigation/native-stack";
import { FlashList } from "@shopify/flash-list";

import MainHeader from "../../../components/MainHeader";
import { useRefreshOnFocus } from "../../../hooks/useRefreshOnFocus";
import { type GlobalRoutingType } from "../../../navigation/types";
import { api } from "../../../utils/api";
import { styles } from "../../../utils/styles";
import { PressableSettingsOption } from "./Root";

type Props = NativeStackScreenProps<
  GlobalRoutingType["SettingsStackNavigator"],
  "RentalRatesListScreen"
>;

const RentalRatesListScreen = (props: Props) => {
  const [locationId, setLocationId] = useState("");

  const locationsQuery = api.location.getAll.useQuery(undefined, {
    onSuccess: (data) => {
      if (data.length > 0 && data[0]) {
        setLocationId(data[0].id);
      }
    },
  });
  useRefreshOnFocus(locationsQuery.refetch);

  const ratesQuery = api.rate.getAll.useQuery(
    { locationId },
    { enabled: locationId !== "" },
  );
  useRefreshOnFocus(ratesQuery.refetch);

  return (
    <SafeAreaView style={[styles.safeArea]}>
      <StatusBar />
      <View style={[styles.pageContainer, { paddingBottom: 20 }]}>
        <MainHeader
          title="Rental rates"
          leftButton={{
            onPress: () => {
              props.navigation.canGoBack()
                ? props.navigation.goBack()
                : props.navigation.navigate("RootSettingsScreen");
            },
            content: <AntDesign name="left" size={24} color="black" />,
          }}
          rightButton={{
            onPress: () => {
              props.navigation.push("RentalRateEditScreen", {
                rentalRateId: "",
                locationId,
              });
            },
            content: <AntDesign name="plus" size={24} color="black" />,
          }}
        />
        <View
          style={{ gap: 15, paddingTop: 40, width: "100%", height: "100%" }}
        >
          {ratesQuery.isInitialLoading && (
            <View style={{ maxHeight: 30, width: "100%" }}>
              <Text>Loading...</Text>
            </View>
          )}
          {ratesQuery.status === "error" && (
            <View style={{ maxHeight: 30, width: "100%" }}>
              <Text>{ratesQuery.error.message}</Text>
            </View>
          )}

          <View
            style={{
              flex: 1,
              width: "100%",
              height: "100%",
            }}
          >
            <FlashList
              data={ratesQuery.data || []}
              renderItem={({ item: rateItem, index }) => {
                return (
                  <PressableSettingsOption
                    text={`${index + 1}. ${rateItem.name}`}
                    onPress={() => {
                      props.navigation.push("RentalRateEditScreen", {
                        rentalRateId: rateItem.id,
                        locationId,
                      });
                    }}
                    bottomContent={
                      <View style={{ marginLeft: 20 }}>
                        <Text>Vehicle type: {rateItem.vehicleType.name}</Text>
                        <Text>
                          Calculation type: {rateItem.calculationType}
                        </Text>
                        <Text>Daily rate: {rateItem.dailyRate}</Text>
                      </View>
                    }
                  />
                );
              }}
              estimatedItemSize={100}
              refreshing={
                ratesQuery.isInitialLoading === false && ratesQuery.isLoading
              }
              onRefresh={ratesQuery.refetch}
              scrollEnabled
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default RentalRatesListScreen;
