import React from "react";
import { TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AntDesign, Entypo, MaterialCommunityIcons } from "@expo/vector-icons";
import { DrawerActions } from "@react-navigation/native";
import { type NativeStackScreenProps } from "@react-navigation/native-stack";
import { FlashList } from "@shopify/flash-list";
import { Box, Text } from "native-base";

import { type RouterOutputs } from "@acme/api";

import EmptyState from "../../../components/EmptyState";
import MainHeader from "../../../components/MainHeader";
import { RentalListStatusIndicator } from "../../../components/RentalListStatusIndicator";
import { useRefreshOnFocus } from "../../../hooks/useRefreshOnFocus";
import { type GlobalRoutingType } from "../../../navigation/types";
import { api } from "../../../utils/api";
import { DateFormatter } from "../../../utils/dates";
import { styles } from "../../../utils/styles";

type Props = NativeStackScreenProps<
  GlobalRoutingType["ReservationsStackNavigator"],
  "RootReservationsList"
>;

const ReservationsListScreen = (props: Props) => {
  const reservations = api.rental.getReservations.useQuery();
  useRefreshOnFocus(reservations.refetch);

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
          title="Reservations"
          leftButton={{
            onPress: () => {
              props.navigation.dispatch(DrawerActions.toggleDrawer());
            },
            content: <Entypo name="menu" size={24} color="black" />,
          }}
          rightButton={{
            onPress: () => {
              // props.navigation.push("VehicleEditScreen", {
              //   vehicleId: "",
              //   currentLocationId: locationId,
              // });
            },
            content: <AntDesign name="plus" size={24} color="black" />,
          }}
        />
        <View style={{ flex: 1 }}>
          {reservations.status === "success" &&
            reservations.data.length === 0 && (
              <View style={{ marginTop: 30 }}>
                <EmptyState
                  renderIcon={() => (
                    <MaterialCommunityIcons
                      name="bookshelf"
                      size={24}
                      color="black"
                    />
                  )}
                  title="No reservations"
                  description="Start by creating a new reservation."
                  buttonProps={{
                    text: "Create a reservation",
                    onPress: () => {
                      // props.navigation.push("VehicleEditScreen", {
                      //   vehicleId: "",
                      //   currentLocationId: locationId,
                      // });
                    },
                  }}
                />
              </View>
            )}

          {reservations.status === "success" &&
            reservations.data.length > 0 && (
              <FlashList
                data={reservations.data || []}
                renderItem={({ item, index }) => {
                  return (
                    <ReservationListItem
                      reservation={item}
                      index={index}
                      onPress={() => {
                        props.navigation.push("ReservationViewScreen", {
                          reservationId: item.id,
                          view: "summary",
                        });
                      }}
                    />
                  );
                }}
                estimatedItemSize={200}
                onRefresh={reservations.refetch}
                refreshing={reservations.isLoading}
              />
            )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ReservationsListScreen;

type OutputReservation = RouterOutputs["rental"]["getReservations"][number];

const ReservationListItem = ({
  reservation,
  index,
  onPress,
}: {
  reservation: OutputReservation;
  index: number;
  onPress: () => void;
}) => {
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
        marginTop: index === 0 ? 20 : 10,
      }}
      onPress={onPress}
    >
      <Text style={{ width: 20 }}>{index + 1}</Text>
      <View style={{ marginLeft: 10, flex: 1 }}>
        <Box flexDirection="row">
          <Text ellipsizeMode="tail" numberOfLines={1}>
            Status:
          </Text>
          <RentalListStatusIndicator status={reservation.status} />
        </Box>
        <Text ellipsizeMode="tail" numberOfLines={1}>
          Customer: {reservation.customer.firstName}{" "}
          {reservation.customer.lastName}
        </Text>
        <Text ellipsizeMode="tail" numberOfLines={1}>
          License: {reservation.vehicle.licensePlate}
        </Text>
        <Text ellipsizeMode="tail" numberOfLines={1}>
          Vehicle Type: {reservation.vehicleType.name}
        </Text>
        <Text ellipsizeMode="tail" numberOfLines={1}>
          Vehicle: {reservation.vehicle.make} {reservation.vehicle.model}{" "}
          {reservation.vehicle.year}
        </Text>
        <Text ellipsizeMode="tail">
          Checkout: {DateFormatter.rentalListView(reservation.checkoutDate)}
        </Text>
        <Text ellipsizeMode="tail" numberOfLines={1}>
          Checkin: {DateFormatter.rentalListView(reservation.checkinDate)}
        </Text>
      </View>
      <View
        style={{
          paddingVertical: 5,
          paddingHorizontal: 6,
        }}
      >
        <AntDesign name="right" size={18} color="black" />
      </View>
    </TouchableOpacity>
  );
};
