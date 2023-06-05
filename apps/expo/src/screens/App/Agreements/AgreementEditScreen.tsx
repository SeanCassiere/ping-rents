import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AntDesign } from "@expo/vector-icons";
import { type NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, View } from "native-base";

import MainHeader from "../../../components/MainHeader";
import RentalEditForm from "../../../components/RentalEditForm";
import { type GlobalRoutingType } from "../../../navigation/types";
import { api } from "../../../utils/api";
import { styles } from "../../../utils/styles";

type Props = NativeStackScreenProps<
  GlobalRoutingType["AgreementsStackNavigator"],
  "AgreementEditScreen"
>;

const AgreementEditScreen = (props: Props) => {
  const { agreementId, reservationId = null, locationId } = props.route.params;
  const isEdit = Boolean(agreementId);

  const agreement = api.rental.getAgreement.useQuery(
    { id: agreementId ?? "" },
    { enabled: isEdit },
  );

  return (
    <SafeAreaView style={[styles.safeArea]}>
      <StatusBar />
      <View style={[styles.pageContainer]}>
        <MainHeader
          title={`${isEdit ? "Edit" : "New"} Agreement`}
          leftButton={{
            onPress: () => {
              isEdit ? props.navigation.goBack() : props.navigation.pop();
            },
            content: <AntDesign name="left" size={24} color="black" />,
          }}
        />
        <View style={{ paddingTop: 30, flex: 1 }}>
          <RentalEditForm
            referenceType="agreement"
            referenceId={agreementId ?? null}
            isEdit={isEdit}
            preCreatedReservationId={reservationId ?? undefined}
            initialData={agreement.data}
            onCreateSuccess={() => {
              if (isEdit) {
                props.navigation.goBack();
              } else {
                props.navigation.navigate("RootAgreementsList");
              }
            }}
            locationId={locationId}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AgreementEditScreen;
