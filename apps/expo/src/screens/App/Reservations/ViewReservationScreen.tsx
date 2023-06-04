import React from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AntDesign } from "@expo/vector-icons";
import { type NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScrollView, Text, View } from "native-base";

import Button from "../../../components/Button";
import MainHeader from "../../../components/MainHeader";
import RentalRatesSummary from "../../../components/RentalRatesSummary";
import RentalTabList from "../../../components/RentalTabList";
import { useRefreshOnFocus } from "../../../hooks/useRefreshOnFocus";
import { type GlobalRoutingType } from "../../../navigation/types";
import { api, type RouterOutputs } from "../../../utils/api";
import { DateFormatter } from "../../../utils/dates";
import { styles } from "../../../utils/styles";

type Props = NativeStackScreenProps<
  GlobalRoutingType["ReservationsStackNavigator"],
  "ReservationViewScreen"
>;

type ReservationOutput = RouterOutputs["rental"]["getReservation"];

const ReservationViewScreen = (props: Props) => {
  const backNavigation = () => {
    props.navigation.canGoBack()
      ? props.navigation.goBack()
      : props.navigation.navigate("RootReservationsList");
  };

  const { reservationId, view } = props.route.params;

  const reservation = api.rental.getReservation.useQuery({ id: reservationId });
  useRefreshOnFocus(reservation.refetch);

  const summary = api.rental.getReservationSummary.useQuery({
    id: reservationId,
  });
  useRefreshOnFocus(summary.refetch);

  return (
    <SafeAreaView style={[styles.safeArea]}>
      <StatusBar />
      <View style={[styles.pageContainer]}>
        <MainHeader
          title="Reservation - 1"
          leftButton={{
            onPress: backNavigation,
            content: <AntDesign name="left" size={24} color="black" />,
          }}
          rightButton={{
            onPress: () => {
              // props.navigation.push("CustomerEditScreen", {
              //   customerId: props.route.params.customerId,
              // });
            },
            content: <AntDesign name="edit" size={24} color="black" />,
          }}
        />
        <View style={{ paddingTop: 30, flex: 1 }}>
          <RentalTabList
            tabs={[
              {
                key: "summary",
                displayText: "Summary",
                onPress: () =>
                  props.navigation.navigate("ReservationViewScreen", {
                    reservationId,
                    view: "summary",
                  }),
              },
              {
                key: "details",
                displayText: "Details",
                onPress: () => {
                  props.navigation.navigate("ReservationViewScreen", {
                    reservationId,
                    view: "details",
                  });
                },
              },
              {
                key: "notes",
                displayText: "Notes",
                onPress: () => {
                  props.navigation.navigate("ReservationViewScreen", {
                    reservationId,
                    view: "notes",
                  });
                },
              },
            ]}
            activeKey={view}
          />
          {reservation.status === "success" && summary.status === "success" && (
            <>
              {view === "summary" && (
                <RentalRatesSummary
                  rate={reservation.data.rate}
                  summary={summary.data}
                />
              )}
              {view === "details" && (
                <ReservationDetailsTab reservation={reservation.data} />
              )}
            </>
          )}
        </View>
        {reservation.status === "success" &&
          reservation.data.status === "open" &&
          (view === "summary" || view === "details") && (
            <View mb={5}>
              <Button
                onPress={() => {
                  console.log("checkout button pressed");
                }}
              >
                Checkout
              </Button>
            </View>
          )}
      </View>
    </SafeAreaView>
  );
};

export default ReservationViewScreen;

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

const ReservationDetailsTab = ({
  reservation,
}: {
  reservation: ReservationOutput;
}) => {
  return (
    <ScrollView>
      <View mt={5} mb={5} style={{ gap: 25 }}>
        <View style={textStyle.labelWrapper}>
          <Text style={textStyle.tagStyle}>Checkout date & time</Text>
          <Text style={textStyle.labelStyle}>
            {DateFormatter.rentalListView(reservation.checkoutDate)}
          </Text>
        </View>
        <View style={textStyle.labelWrapper}>
          <Text style={textStyle.tagStyle}>Checkin date & time</Text>
          <Text style={textStyle.labelStyle}>
            {DateFormatter.rentalListView(reservation.checkinDate)}
          </Text>
        </View>
        <View style={textStyle.labelWrapper}>
          <Text style={textStyle.tagStyle}>Vehicle category</Text>
          <Text style={textStyle.labelStyle}>
            {reservation.vehicleType.name}
          </Text>
        </View>
        <View style={textStyle.labelWrapper}>
          <Text style={textStyle.tagStyle}>Vehicle</Text>
          <Text style={textStyle.labelStyle}>
            {reservation.vehicle.make} {reservation.vehicle.model}{" "}
            {reservation.vehicle.year}
          </Text>
        </View>
        <View style={textStyle.labelWrapper}>
          <Text style={textStyle.tagStyle}>Renter</Text>
          <Text style={textStyle.labelStyle}>
            {reservation.customer.firstName} {reservation.customer.lastName}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};
