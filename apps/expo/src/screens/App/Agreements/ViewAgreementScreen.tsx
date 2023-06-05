import React from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AntDesign } from "@expo/vector-icons";
import { type NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScrollView, Text, View } from "native-base";

import Button from "../../../components/Button";
import MainHeader from "../../../components/MainHeader";
import { RentalListStatusIndicator } from "../../../components/RentalListStatusIndicator";
import RentalRatesSummary from "../../../components/RentalRatesSummary";
import RentalTabList from "../../../components/RentalTabList";
import { useIsomorphicConfirm } from "../../../hooks/useIsomorphicConfirm";
import { useRefreshOnFocus } from "../../../hooks/useRefreshOnFocus";
import { type GlobalRoutingType } from "../../../navigation/types";
import { api, type RouterOutputs } from "../../../utils/api";
import { DateFormatter } from "../../../utils/dates";
import { styles } from "../../../utils/styles";

type Props = NativeStackScreenProps<
  GlobalRoutingType["AgreementsStackNavigator"],
  "AgreementViewScreen"
>;

type AgreementOutput = RouterOutputs["rental"]["getAgreement"];

const AgreementViewScreen = (props: Props) => {
  const backNavigation = () => {
    props.navigation.canGoBack()
      ? props.navigation.goBack()
      : props.navigation.navigate("RootAgreementsList");
  };

  const { agreementId, view } = props.route.params;

  const agreement = api.rental.getAgreement.useQuery({ id: agreementId });
  useRefreshOnFocus(agreement.refetch);

  const confirm = useIsomorphicConfirm();

  return (
    <SafeAreaView style={[styles.safeArea]}>
      <StatusBar />
      <View style={[styles.pageContainer]}>
        <MainHeader
          title={`Agreement - ${
            agreement?.data ? agreement.data.displayRefNo : "0"
          }`}
          leftButton={{
            onPress: backNavigation,
            content: <AntDesign name="left" size={24} color="black" />,
          }}
          {...(agreement.status === "success" &&
          agreement.data.status === "on_rent"
            ? {
                rightButton: {
                  onPress: () => {
                    props.navigation.push("AgreementEditScreen", {
                      agreementId,
                    });
                  },
                  content: <AntDesign name="edit" size={24} color="black" />,
                },
              }
            : {})}
        />
        <View style={{ paddingTop: 15, flex: 1 }}>
          {agreement.status === "success" && (
            <View mb={2}>
              <RentalListStatusIndicator large status={agreement.data.status} />
            </View>
          )}
          <RentalTabList
            tabs={[
              {
                key: "summary",
                displayText: "Summary",
                onPress: () =>
                  props.navigation.navigate("AgreementViewScreen", {
                    agreementId,
                    view: "summary",
                  }),
              },
              {
                key: "details",
                displayText: "Details",
                onPress: () => {
                  props.navigation.navigate("AgreementViewScreen", {
                    agreementId,
                    view: "details",
                  });
                },
              },
              {
                key: "payments",
                displayText: "Payments",
                onPress: () => {
                  props.navigation.navigate("AgreementViewScreen", {
                    agreementId,
                    view: "payments",
                  });
                },
              },
              {
                key: "notes",
                displayText: "Notes",
                onPress: () => {
                  props.navigation.navigate("AgreementViewScreen", {
                    agreementId,
                    view: "notes",
                  });
                },
              },
            ]}
            activeKey={view}
          />
          {agreement.status === "success" && (
            <>
              {view === "summary" && (
                <AgreementSummaryTab
                  agreement={agreement.data}
                  agreementId={agreementId}
                />
              )}
              {view === "details" && (
                <AgreementDetailsTab agreement={agreement.data} />
              )}
            </>
          )}
        </View>
        {agreement.status === "success" &&
          agreement.data.status === "on_rent" &&
          (view === "summary" || view === "details") && (
            <View mb={5}>
              <Button
                onPress={() => {
                  confirm("Checkin rental", "Are you sure?", {
                    onConfirm: async () => {
                      console.log("checking in rental");
                    },
                  });
                }}
              >
                Checkin
              </Button>
            </View>
          )}
      </View>
    </SafeAreaView>
  );
};

export default AgreementViewScreen;

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

const AgreementDetailsTab = ({ agreement }: { agreement: AgreementOutput }) => {
  return (
    <ScrollView>
      <View mt={5} mb={5} style={{ gap: 25 }}>
        <View style={textStyle.labelWrapper}>
          <Text style={textStyle.tagStyle}>Checkout date & time</Text>
          <Text style={textStyle.labelStyle}>
            {DateFormatter.rentalListView(agreement.checkoutDate)}
          </Text>
        </View>
        <View style={textStyle.labelWrapper}>
          <Text style={textStyle.tagStyle}>Checkin date & time</Text>
          <Text style={textStyle.labelStyle}>
            {DateFormatter.rentalListView(agreement.checkinDate)}
          </Text>
        </View>
        {agreement.status !== "on_rent" && (
          <View style={textStyle.labelWrapper}>
            <Text style={textStyle.tagStyle}>Return date & time</Text>
            <Text style={textStyle.labelStyle}>
              {DateFormatter.rentalListView(agreement.returnDate)}
            </Text>
          </View>
        )}
        <View style={textStyle.labelWrapper}>
          <Text style={textStyle.tagStyle}>Vehicle category</Text>
          <Text style={textStyle.labelStyle}>{agreement.vehicleType.name}</Text>
        </View>
        <View style={textStyle.labelWrapper}>
          <Text style={textStyle.tagStyle}>Vehicle</Text>
          <Text style={textStyle.labelStyle}>
            {agreement.vehicle.make} {agreement.vehicle.model}{" "}
            {agreement.vehicle.year}
          </Text>
        </View>
        <View style={textStyle.labelWrapper}>
          <Text style={textStyle.tagStyle}>Vehicle checkout odometer</Text>
          <Text style={textStyle.labelStyle}>
            {agreement.odometerOut.toString()}
          </Text>
        </View>
        {agreement.status !== "on_rent" && (
          <View style={textStyle.labelWrapper}>
            <Text style={textStyle.tagStyle}>Vehicle checkin odometer</Text>
            <Text style={textStyle.labelStyle}>
              {agreement.odometerIn.toString()}
            </Text>
          </View>
        )}
        <View style={textStyle.labelWrapper}>
          <Text style={textStyle.tagStyle}>Renter</Text>
          <Text style={textStyle.labelStyle}>
            {agreement.customer.firstName} {agreement.customer.lastName}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const AgreementSummaryTab = ({
  agreement,
  agreementId,
}: {
  agreement: AgreementOutput;
  agreementId: string;
}) => {
  const summary = api.rental.getAgreementSummary.useQuery({ id: agreementId });
  useRefreshOnFocus(summary.refetch);

  if (summary.status !== "success") return null;

  return (
    <RentalRatesSummary
      rate={agreement.rate}
      summary={summary.data}
      checkoutDate={agreement.checkoutDate}
      checkinDate={
        agreement.status === "on_rent"
          ? agreement.checkinDate
          : agreement.returnDate
      }
    />
  );
};
