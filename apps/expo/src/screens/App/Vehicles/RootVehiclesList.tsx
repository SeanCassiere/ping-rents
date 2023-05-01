import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AntDesign, Entypo, FontAwesome5 } from "@expo/vector-icons";
import { DrawerActions } from "@react-navigation/native";
import { type NativeStackScreenProps } from "@react-navigation/native-stack";
import { FlashList } from "@shopify/flash-list";

import { type RouterOutputs } from "@acme/api";

import EmptyState from "../../../components/EmptyState";
import MainHeader from "../../../components/MainHeader";
import { useRefreshOnFocus } from "../../../hooks/useRefreshOnFocus";
import { type GlobalRoutingType } from "../../../navigation/types";
import { api } from "../../../utils/api";
import { styles } from "../../../utils/styles";

type Props = NativeStackScreenProps<
  GlobalRoutingType["VehiclesStackNavigator"],
  "RootVehiclesList"
>;

const VehiclesListScreen = (props: Props) => {
  const navigation = props.navigation;

  const vehiclesQuery = api.vehicle.getAll.useQuery({});
  useRefreshOnFocus(vehiclesQuery.refetch);

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
          title="Vehicles"
          leftButton={{
            onPress: () => {
              props.navigation.dispatch(DrawerActions.toggleDrawer());
            },
            content: <Entypo name="menu" size={24} color="black" />,
          }}
          rightButton={{
            onPress: () => {
              navigation.push("VehicleEditScreen", { vehicleId: "" });
            },
            content: <AntDesign name="plus" size={24} color="black" />,
          }}
        />
        <View style={{ flex: 1 }}>
          {vehiclesQuery.status === "success" &&
            vehiclesQuery.data.length === 0 && (
              <View style={{ marginTop: 30 }}>
                <EmptyState
                  renderIcon={() => (
                    <FontAwesome5 name="car" size={38} color="black" />
                  )}
                  title="No vehicles"
                  description="Add a vehicle to get started"
                  buttonProps={{
                    text: "Add vehicle",
                    onPress: () => {
                      navigation.push("VehicleEditScreen", { vehicleId: "" });
                    },
                  }}
                />
              </View>
            )}

          {vehiclesQuery.status === "success" &&
            vehiclesQuery.data.length > 0 && (
              <FlashList
                data={vehiclesQuery.data || []}
                renderItem={({ item, index }) => {
                  return (
                    <VehicleListItem
                      vehicle={item}
                      position={index + 1}
                      onPress={() => {
                        navigation.push("VehicleViewScreen", {
                          vehicleId: item.id,
                        });
                      }}
                    />
                  );
                }}
                estimatedItemSize={200}
                onRefresh={vehiclesQuery.refetch}
                refreshing={vehiclesQuery.isLoading}
              />
            )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default VehiclesListScreen;

const VehicleListItem = (props: {
  vehicle: RouterOutputs["vehicle"]["getAll"][number];
  position: number;
  onPress: () => void;
}) => {
  const { vehicle, position, onPress } = props;
  return (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingVertical: 15,
        borderRadius: 5,
        borderColor: "black",
        borderStyle: "solid",
        borderWidth: 2,
        marginTop: position === 0 || position === 1 ? 20 : 10,
      }}
      onPress={onPress}
    >
      <Text style={{ width: 20 }}>{position}</Text>
      <View
        style={{
          paddingVertical: 5,
          paddingHorizontal: 6,
          backgroundColor: "black",
          borderRadius: 100,
        }}
      >
        <FontAwesome5 name="car" size={18} color="white" />
      </View>
      <View style={{ marginLeft: 10 }}>
        <Text>License: {vehicle.licensePlate}</Text>
        <Text>
          Vehicle: {vehicle.make} {vehicle.model}
        </Text>
        <Text>Year: {vehicle.year}</Text>
        <Text>Type: {vehicle.vehicleType.name}</Text>
      </View>
    </TouchableOpacity>
  );
};
