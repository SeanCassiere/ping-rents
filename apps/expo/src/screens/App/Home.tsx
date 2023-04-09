import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Entypo } from "@expo/vector-icons";
import { type DrawerScreenProps } from "@react-navigation/drawer";
import { Button } from "native-base";

import MainHeader from "../../components/MainHeader";
import { type GlobalRoutingType } from "../../navigation/types";
import { styles } from "../../utils/styles";

type Props = DrawerScreenProps<GlobalRoutingType["AppDrawer"], "Home">;

const HomeScreen = (props: Props) => {
  return (
    <SafeAreaView style={[styles.safeArea]}>
      <StatusBar />
      <View style={[styles.pageContainer, { paddingBottom: 20 }]}>
        <MainHeader
          title="Home"
          leftButton={{
            onPress: () => {
              props.navigation.toggleDrawer();
            },
            content: <Entypo name="menu" size={24} color="black" />,
          }}
        />
        <View style={{ gap: 10, paddingTop: 40 }}>
          <Button
            variant="link"
            onPress={() => {
              props.navigation.navigate("Customers");
            }}
          >
            Customers
          </Button>
          <Button
            variant="link"
            onPress={() => {
              props.navigation.navigate("Vehicles");
            }}
          >
            Vehicles
          </Button>
          <Button
            variant="link"
            onPress={() => {
              props.navigation.navigate("Reservations");
            }}
          >
            Reservations
          </Button>
          <Button
            variant="link"
            onPress={() => {
              props.navigation.navigate("Agreements");
            }}
          >
            Agreements
          </Button>
          <Button
            variant="link"
            onPress={() => {
              props.navigation.navigate("Customers");
            }}
          >
            Settings
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
