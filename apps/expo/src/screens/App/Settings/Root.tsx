import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { type NativeStackScreenProps } from "@react-navigation/native-stack";

import MainHeader from "../../../components/MainHeader";
import { type GlobalRoutingType } from "../../../navigation/types";
import { styles } from "../../../utils/styles";

type Props = NativeStackScreenProps<
  GlobalRoutingType["SettingsStackNavigator"],
  "RootSettingsScreen"
>;

const RootSettingsScreen = (props: Props) => {
  return (
    <SafeAreaView style={[styles.safeArea]}>
      <StatusBar />
      <View style={[styles.pageContainer, { paddingBottom: 20 }]}>
        <MainHeader
          title="Settings"
          leftButton={{
            onPress: () => {
              (props.navigation as any)?.toggleDrawer(); // eslint-disable-line
            },
            content: <Entypo name="menu" size={24} color="black" />,
          }}
        />
        <View style={{ gap: 15, paddingTop: 40 }}>
          <PressableSettingsOption
            onPress={() => {
              props.navigation.push("VehicleTypesListScreen");
            }}
            text="Vehicle types"
          />
          <PressableSettingsOption
            onPress={() => {
              props.navigation.push("VehicleTypesListScreen");
            }}
            text="Rental rates"
          />
          <PressableSettingsOption
            onPress={() => {
              props.navigation.push("VehicleTypesListScreen");
            }}
            text="Taxes"
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default RootSettingsScreen;

const PressableSettingsOption = (props: {
  onPress: () => void;
  text: string;
}) => {
  return (
    <TouchableOpacity
      onPress={props.onPress}
      style={{
        width: "100%",
        maxHeight: 60,
        paddingHorizontal: 12,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          width: "100%",
          paddingHorizontal: 5,
          borderRadius: 5,
        }}
      >
        <View
          style={{
            borderBottomColor: "#ccc",
            borderBottomWidth: 1,
            paddingVertical: 12,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 18 }}>{props.text}</Text>
          <AntDesign name="right" size={18} color="black" />
        </View>
      </View>
    </TouchableOpacity>
  );
};
