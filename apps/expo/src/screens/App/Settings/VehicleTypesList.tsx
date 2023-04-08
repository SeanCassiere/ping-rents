import React from "react";
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
  "VehicleTypesListScreen"
>;

const VehicleTypesListScreen = (props: Props) => {
  const vehicleTypes = api.vehicleType.getAll.useQuery();
  useRefreshOnFocus(vehicleTypes.refetch);

  return (
    <SafeAreaView style={[styles.safeArea]}>
      <StatusBar />
      <View style={[styles.pageContainer, { paddingBottom: 20 }]}>
        <MainHeader
          title="Vehicle types"
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
              props.navigation.push("VehicleTypeEditScreen", {
                vehicleTypeId: "",
              });
            },
            content: <AntDesign name="plus" size={24} color="black" />,
          }}
        />
        <View
          style={{ gap: 15, paddingTop: 40, width: "100%", height: "100%" }}
        >
          {vehicleTypes.isInitialLoading && (
            <View style={{ maxHeight: 30, width: "100%" }}>
              <Text>Loading...</Text>
            </View>
          )}
          {vehicleTypes.status === "error" && (
            <View style={{ maxHeight: 30, width: "100%" }}>
              <Text>{vehicleTypes.error.message}</Text>
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
              data={vehicleTypes.data || []}
              renderItem={({ item: vehicleType, index }) => {
                return (
                  <PressableSettingsOption
                    text={`${index + 1}. ${vehicleType.name}`}
                    onPress={() => {
                      props.navigation.push("VehicleTypeEditScreen", {
                        vehicleTypeId: vehicleType.id,
                      });
                    }}
                  />
                );
              }}
              estimatedItemSize={60}
              refreshing={
                vehicleTypes.isInitialLoading === false &&
                vehicleTypes.isLoading
              }
              onRefresh={vehicleTypes.refetch}
              scrollEnabled
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default VehicleTypesListScreen;
