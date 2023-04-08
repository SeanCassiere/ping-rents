import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AntDesign } from "@expo/vector-icons";
import { type NativeStackScreenProps } from "@react-navigation/native-stack";

import MainHeader from "../../../components/MainHeader";
import { type GlobalRoutingType } from "../../../navigation/types";
import { styles } from "../../../utils/styles";

type Props = NativeStackScreenProps<
  GlobalRoutingType["SettingsStackNavigator"],
  "VehicleTypesListScreen"
>;

const VehicleTypesListScreen = (props: Props) => {
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
        />
        <View style={{ gap: 15, paddingTop: 40 }}>
          <Text>Cards here</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default VehicleTypesListScreen;
