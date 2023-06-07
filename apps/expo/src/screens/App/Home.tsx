import React, { type ReactNode } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Entypo, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { type DrawerScreenProps } from "@react-navigation/drawer";
import { ScrollView, Text, View, useTheme } from "native-base";

import MainHeader from "../../components/MainHeader";
import { type GlobalRoutingType } from "../../navigation/types";
import { styles } from "../../utils/styles";

type Props = DrawerScreenProps<GlobalRoutingType["AppDrawer"], "Home">;

const HomeScreen = (props: Props) => {
  return (
    <SafeAreaView style={[styles.safeArea]}>
      <StatusBar />
      <View style={[styles.pageContainer]}>
        <MainHeader
          title="Home"
          leftButton={{
            onPress: () => {
              props.navigation.toggleDrawer();
            },
            content: <Entypo name="menu" size={24} color="black" />,
          }}
        />
        <Text mt={6} fontSize={16} color="gray.800">
          These are the current statistics related to your rental business.
        </Text>
        <ScrollView style={{ paddingTop: 20 }}>
          <View style={{ gap: 10, flex: 1 }}>
            <NumberFigure
              label="Open rentals"
              value={0}
              icon="arrow-up-right"
            />
            <NumberFigure
              label="Returns closed this month"
              value={0}
              icon="arrow-down-left"
            />
            <NumberFigure label="Available vehicles" value={0} icon="car" />
            <DollarFigure label="Profit" value={0} icon="piggy-bank" />
            <DollarFigure label="Payments" value={0} icon="cash-plus" />
            <DollarFigure label="Refunds" value={0} icon="cash-minus" />
            <View pb={5}></View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const CardItem = ({ children }: { children: ReactNode }) => {
  return (
    <View
      borderColor="gray.300"
      borderWidth={1.5}
      borderStyle="solid"
      borderRadius="md"
      px={4}
      py={3.5}
    >
      {children}
    </View>
  );
};

const NumberFigure = ({
  value,
  icon,
  label,
}: {
  value: number;
  icon: "arrow-down-left" | "arrow-up-right" | "car";
  label: string;
}) => {
  const theme = useTheme();
  const gray = theme.colors.gray[600];
  return (
    <CardItem>
      <View flexDirection="row">
        <View px={2} justifyContent="center" alignItems="center">
          {icon === "arrow-up-right" && (
            <Feather name={icon} size={34} color={gray} />
          )}
          {icon === "arrow-down-left" && (
            <Feather name={icon} size={34} color={gray} />
          )}
          {icon === "car" && (
            <MaterialCommunityIcons name={icon} size={34} color={gray} />
          )}
        </View>
        <View px={2}>
          <Text fontSize={26} fontWeight="semibold" color={gray}>
            {Number(value).toString()}
          </Text>
          <Text fontSize={16} color={gray}>
            {label}
          </Text>
        </View>
      </View>
    </CardItem>
  );
};

const DollarFigure = ({
  value,
  icon,
  label,
}: {
  value: number;
  icon: "cash-plus" | "cash-minus" | "piggy-bank";
  label: string;
}) => {
  const theme = useTheme();
  const gray = theme.colors.gray[600];
  return (
    <CardItem>
      <View flexDirection="row">
        <View px={2} justifyContent="center" alignItems="center">
          {icon === "cash-plus" && (
            <MaterialCommunityIcons name="cash-plus" size={34} color={gray} />
          )}
          {icon === "cash-minus" && (
            <MaterialCommunityIcons name="cash-minus" size={34} color={gray} />
          )}
          {icon === "piggy-bank" && (
            <MaterialCommunityIcons
              name="piggy-bank-outline"
              size={34}
              color={gray}
            />
          )}
        </View>
        <View px={2}>
          <Text fontSize={26} fontWeight="semibold" color={gray}>
            $ {Number(value).toFixed(2)}
          </Text>
          <Text fontSize={16} color={gray}>
            {label}
          </Text>
        </View>
      </View>
    </CardItem>
  );
};

export default HomeScreen;
