import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AntDesign } from "@expo/vector-icons";
import { type NativeStackScreenProps } from "@react-navigation/native-stack";
import { View } from "native-base";

import MainHeader from "../../../components/MainHeader";
import RentalCheckInForm from "../../../components/RentalCheckInForm";
import { type GlobalRoutingType } from "../../../navigation/types";
import { api } from "../../../utils/api";
import { styles } from "../../../utils/styles";

type Props = NativeStackScreenProps<
  GlobalRoutingType["AgreementsStackNavigator"],
  "AgreementCheckInScreen"
>;

const AgreementCheckInScreen = (props: Props) => {
  const { agreementId: id } = props.route.params;
  const apiUtils = api.useContext();

  const agreement = api.rental.getAgreement.useQuery({ id });

  const summary = api.rental.getAgreementSummary.useQuery({ id: id });
  const amountPaid = summary.data?.amountPaid ?? 0;

  return (
    <SafeAreaView style={[styles.safeArea]}>
      <StatusBar />
      <View style={[styles.pageContainer]}>
        <MainHeader
          title={`Check-in - ${agreement.data?.displayRefNo}`}
          leftButton={{
            onPress: () => {
              props.navigation.goBack();
            },
            content: <AntDesign name="left" size={24} color="black" />,
          }}
        />
        <View style={{ paddingTop: 30, flex: 1 }}>
          {agreement.status === "success" && (
            <RentalCheckInForm
              initialData={agreement.data}
              amountPaidSoFar={amountPaid}
              onCheckinSuccess={({ agreementId, vehicleId, customerId }) => {
                apiUtils.rental.getAgreements.invalidate();

                apiUtils.rental.getAgreement.invalidate({ id: agreementId });
                apiUtils.rental.getAgreementSummary.invalidate({
                  id: agreementId,
                });

                apiUtils.customer.getCustomer.invalidate({ id: customerId });

                apiUtils.vehicle.getVehicle.invalidate({ id: vehicleId });

                props.navigation.pop();
              }}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AgreementCheckInScreen;
