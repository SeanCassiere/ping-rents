import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AntDesign, FontAwesome5 } from "@expo/vector-icons";
import { type NativeStackScreenProps } from "@react-navigation/native-stack";

import MainHeader from "../../../components/MainHeader";
import { VehicleListStatusIndicator } from "../../../components/VehicleListStatusIndicator";
import { useRefreshOnFocus } from "../../../hooks/useRefreshOnFocus";
import { type GlobalRoutingType } from "../../../navigation/types";
import { api } from "../../../utils/api";
import { styles } from "../../../utils/styles";

type Props = NativeStackScreenProps<
  GlobalRoutingType["VehiclesStackNavigator"],
  "VehicleViewScreen"
>;

const VehicleViewScreen = (props: Props) => {
  const vehicleId = props.route.params.vehicleId;
  const backNavigation = () => {
    props.navigation.canGoBack()
      ? props.navigation.goBack()
      : props.navigation.navigate("RootVehiclesList");
  };

  const vehicle = api.vehicle.getVehicle.useQuery({ id: vehicleId });
  useRefreshOnFocus(vehicle.refetch);

  return (
    <SafeAreaView style={[styles.safeArea]}>
      <StatusBar />
      <View style={[styles.pageContainer]}>
        <MainHeader
          title="View vehicle"
          leftButton={{
            onPress: backNavigation,
            content: <AntDesign name="left" size={24} color="black" />,
          }}
          rightButton={{
            onPress: () => {
              props.navigation.push("VehicleEditScreen", {
                vehicleId,
                currentLocationId: vehicle.data?.currentLocationId ?? "",
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
              <FontAwesome5 name="car" size={64} color="white" />
            </View>
            {vehicle.status === "success" && (
              <View style={{ gap: 10 }}>
                <VehicleListStatusIndicator
                  status={vehicle.data.status}
                  large
                />
                <View style={textStyle.labelWrapper}>
                  <Text style={textStyle.tagStyle}>License plate:</Text>
                  <Text style={textStyle.labelStyle}>
                    {vehicle.data.licensePlate}
                  </Text>
                </View>
                <View style={textStyle.labelWrapper}>
                  <Text style={textStyle.tagStyle}>Category:</Text>
                  <Text style={textStyle.labelStyle}>
                    {vehicle.data.vehicleType.name}
                  </Text>
                </View>
                <View style={textStyle.labelWrapper}>
                  <Text style={textStyle.tagStyle}>Make-Model-Year:</Text>
                  <View style={{ flexDirection: "row" }}>
                    <Text
                      style={[
                        textStyle.labelStyle,
                        { flex: 1, flexWrap: "wrap" },
                      ]}
                    >
                      {vehicle.data.displayMake} {vehicle.data.displayModel} -{" "}
                      {vehicle.data.year}
                    </Text>
                  </View>
                </View>
                <View style={textStyle.labelWrapper}>
                  <Text style={textStyle.tagStyle}>Color:</Text>
                  <Text style={textStyle.labelStyle}>{vehicle.data.color}</Text>
                </View>
                <View style={textStyle.labelWrapper}>
                  <Text style={textStyle.tagStyle}>VIN no:</Text>
                  <Text style={textStyle.labelStyle}>{vehicle.data.vin}</Text>
                </View>
              </View>
            )}
          </View>
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

export default VehicleViewScreen;
