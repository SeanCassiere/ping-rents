import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AntDesign } from "@expo/vector-icons";
import { type NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, View } from "native-base";

import Button from "../../../components/Button";
import MainHeader from "../../../components/MainHeader";
import { useRefreshOnFocus } from "../../../hooks/useRefreshOnFocus";
import { type GlobalRoutingType } from "../../../navigation/types";
import { api } from "../../../utils/api";
import { styles } from "../../../utils/styles";

type Props = NativeStackScreenProps<
  GlobalRoutingType["AgreementsStackNavigator"],
  "AgreementViewScreen"
>;

const AgreementViewScreen = (props: Props) => {
  const backNavigation = () => {
    props.navigation.canGoBack()
      ? props.navigation.goBack()
      : props.navigation.navigate("RootAgreementsList");
  };

  const { agreementId, view } = props.route.params;

  const agreement = api.rental.getAgreement.useQuery({ id: agreementId });
  useRefreshOnFocus(agreement.refetch);

  return (
    <SafeAreaView style={[styles.safeArea]}>
      <StatusBar />
      <View style={[styles.pageContainer]}>
        <MainHeader
          title="Agreement - 1"
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
          {/* TODO: implement scroll-view for horizontal list of tabs */}
        </View>
        <View mb={5}>
          <Button
            onPress={() => {
              console.log("checkin button pressed");
            }}
          >
            Checkin
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AgreementViewScreen;
