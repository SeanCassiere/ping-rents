import React, { useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { DrawerActions } from "@react-navigation/native";
import { type NativeStackScreenProps } from "@react-navigation/native-stack";
import { FlashList } from "@shopify/flash-list";

import MainHeader from "../../../components/MainHeader";
import { useIsPrivilegedUser } from "../../../hooks/useIsPrivilegedUser";
import { type GlobalRoutingType } from "../../../navigation/types";
import { styles } from "../../../utils/styles";

type Props = NativeStackScreenProps<
  GlobalRoutingType["SettingsStackNavigator"],
  "RootSettingsScreen"
>;
type SettingOption = {
  text: string;
  to: keyof GlobalRoutingType["SettingsStackNavigator"];
};

const RootSettingsScreen = (props: Props) => {
  const [isPrivileged] = useIsPrivilegedUser();
  const settingsOptions: SettingOption[] = useMemo(() => {
    const options: SettingOption[] = [];

    if (isPrivileged) {
      options.push({ text: "Company", to: "CompanyEditScreen" });
    }

    const defaultOptions: SettingOption[] = [
      { text: "Employees", to: "EmployeesListScreen" },
      { text: "Vehicle types", to: "VehicleTypesListScreen" },
      { text: "Rental rates", to: "RentalRatesListScreen" },
      { text: "Taxes", to: "TaxesListScreen" },
    ];

    defaultOptions.forEach((item) => options.push(item));

    return options;
  }, [isPrivileged]);

  return (
    <SafeAreaView style={[styles.safeArea]}>
      <StatusBar />
      <View style={[styles.pageContainer, { paddingBottom: 20 }]}>
        <MainHeader
          title="Configuration"
          leftButton={{
            onPress: () => {
              props.navigation.dispatch(DrawerActions.toggleDrawer());
            },
            content: <Entypo name="menu" size={24} color="black" />,
          }}
        />
        <View
          style={{ gap: 15, paddingTop: 40, width: "100%", height: "100%" }}
        >
          <FlashList
            data={settingsOptions}
            renderItem={({ item }) => {
              return (
                <PressableSettingsOption
                  text={item.text}
                  onPress={() => {
                    props.navigation.push(item.to);
                  }}
                />
              );
            }}
            estimatedItemSize={60}
            scrollEnabled
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default RootSettingsScreen;

export const PressableSettingsOption = (props: {
  onPress: () => void;
  text: string;
  bottomContent?: React.ReactNode;
}) => {
  return (
    <TouchableOpacity
      onPress={props.onPress}
      style={{
        width: "100%",
        paddingHorizontal: 12,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          width: "100%",
          paddingHorizontal: 5,
          paddingTop: 5,
          borderRadius: 5,
        }}
      >
        <View
          style={{
            borderBottomColor: "#ccc",
            borderBottomWidth: 1,
            paddingTop: 12,
            paddingBottom: 18,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 18 }}>{props.text}</Text>
            <AntDesign name="right" size={18} color="black" />
          </View>
          {props.bottomContent && <>{props.bottomContent}</>}
        </View>
      </View>
    </TouchableOpacity>
  );
};
