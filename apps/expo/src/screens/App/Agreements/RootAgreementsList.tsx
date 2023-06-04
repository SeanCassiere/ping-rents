import React from "react";
import { TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AntDesign, Entypo, FontAwesome5 } from "@expo/vector-icons";
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
  GlobalRoutingType["AgreementsStackNavigator"],
  "RootAgreementsList"
>;

const AgreementsListScreen = (props: Props) => {
  const agreements = api.rental.getAgreements.useQuery();
  useRefreshOnFocus(agreements.refetch);

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
          title="Agreements"
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
          {agreements.status === "success" && agreements.data.length === 0 && (
            <View style={{ marginTop: 30 }}>
              <EmptyState
                renderIcon={() => (
                  <FontAwesome5 name="file-signature" size={38} color="black" />
                )}
                title="No agreement"
                description="Start by creating a new rental agreement."
                buttonProps={{
                  text: "Create an agreement",
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

          {agreements.status === "success" && agreements.data.length > 0 && (
            <FlashList
              data={agreements.data || []}
              renderItem={({ item, index }) => {
                return (
                  <AgreementListItem
                    agreement={item}
                    index={index}
                    onPress={(agreement) => {
                      // props.navigation.push("VehicleViewScreen", {
                      //   vehicleId: item.id,
                      // });
                    }}
                  />
                );
              }}
              estimatedItemSize={200}
              onRefresh={agreements.refetch}
              refreshing={agreements.isLoading}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AgreementsListScreen;

type OutputAgreement = RouterOutputs["rental"]["getAgreements"][number];

const AgreementListItem = ({
  agreement,
  index,
  onPress,
}: {
  agreement: OutputAgreement;
  index: number;
  onPress: (agreement: OutputAgreement) => void;
}) => {
  const handlePress = () => {
    onPress(agreement);
  };
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
      onPress={handlePress}
    >
      <Text style={{ width: 20 }}>{index + 1}</Text>
      <View style={{ marginLeft: 10, flex: 1 }}>
        <Box flexDirection="row">
          <Text ellipsizeMode="tail" numberOfLines={1}>
            Status:
          </Text>
          <RentalListStatusIndicator status={agreement.status} />
        </Box>
        <Text ellipsizeMode="tail" numberOfLines={1}>
          Customer: {agreement.customer.firstName} {agreement.customer.lastName}
        </Text>
        <Text ellipsizeMode="tail" numberOfLines={1}>
          License: {agreement.vehicle.licensePlate}
        </Text>
        <Text ellipsizeMode="tail" numberOfLines={1}>
          Vehicle: {agreement.vehicle.make} {agreement.vehicle.model}{" "}
          {agreement.vehicle.year}
        </Text>
        <Text ellipsizeMode="tail">
          Checkout: {DateFormatter.rentalListView(agreement.checkoutDate)}
        </Text>
        {agreement.status === "open" ? (
          <Text ellipsizeMode="tail" numberOfLines={1}>
            Checkin: {DateFormatter.rentalListView(agreement.checkinDate)}
          </Text>
        ) : (
          <Text ellipsizeMode="tail" numberOfLines={1}>
            Return: {DateFormatter.rentalListView(agreement.returnDate)}
          </Text>
        )}
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
