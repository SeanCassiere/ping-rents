import React, { useEffect, useState, type ReactNode } from "react";
import { Pressable, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Entypo, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { type DrawerScreenProps } from "@react-navigation/drawer";
import { ScrollView, Text, View, useTheme, useToast } from "native-base";

import MainHeader from "../../components/MainHeader";
import { useAuthContext } from "../../context/auth.context";
import { useRefreshOnFocus } from "../../hooks/useRefreshOnFocus";
import { useRefreshByUser } from "../../hooks/useRefreshOnUser";
import { type GlobalRoutingType } from "../../navigation/types";
import { api } from "../../utils/api";
import { styles } from "../../utils/styles";

type Props = DrawerScreenProps<GlobalRoutingType["AppDrawer"], "Home">;

const HomeScreen = (props: Props) => {
  const [showWidgets, setShowWidgets] = useState(false);
  const auth = useAuthContext();

  useEffect(() => {
    if (auth.state.mode === "logged-in") {
      setShowWidgets(true);
    } else {
      setShowWidgets(false);
    }
  }, [auth.state.mode]);

  const onPressAgreement = () => {
    props.navigation.navigate("Agreements");
  };

  const onPressVehicle = () => {
    props.navigation.navigate("Vehicles");
  };

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
        {showWidgets ? (
          <Widgets
            onPressAgreement={onPressAgreement}
            onPressVehicle={onPressVehicle}
          />
        ) : null}
      </View>
    </SafeAreaView>
  );
};

const Widgets = ({
  onPressAgreement,
  onPressVehicle,
}: {
  onPressVehicle: () => void;
  onPressAgreement: () => void;
}) => {
  const toast = useToast();
  const auth = useAuthContext();
  const isLoggedIn = auth.state.mode === "logged-in";

  const onPressString = (value: string) => {
    toast.show({
      title: value,
      variant: "top-accent",
    });
  };

  const openAgreements = api.stats.getOnRentAgreementsCount.useQuery(
    undefined,
    {
      enabled: isLoggedIn,
    },
  );
  useRefreshOnFocus(openAgreements.refetch);
  const { refetchByUser: openAgreementsRefresh } = useRefreshByUser(
    openAgreements.refetch,
  );

  const closedAgreements = api.stats.getMonthlyClosedAgreementsCount.useQuery(
    undefined,
    {
      enabled: isLoggedIn,
    },
  );
  useRefreshOnFocus(closedAgreements.refetch);
  const { refetchByUser: closedAgreementsRefresh } = useRefreshByUser(
    closedAgreements.refetch,
  );

  const vehicleStatusCounts = api.stats.getVehicleStatusCounts.useQuery(
    undefined,
    {
      enabled: isLoggedIn,
    },
  );
  useRefreshOnFocus(vehicleStatusCounts.refetch);
  const { refetchByUser: vehicleStatusCountsRefresh } = useRefreshByUser(
    vehicleStatusCounts.refetch,
  );

  const monthlyPayments = api.stats.getMonthlyEarnings.useQuery(undefined, {
    enabled: isLoggedIn,
  });
  useRefreshOnFocus(monthlyPayments.refetch);
  const { refetchByUser: monthlyPaymentsRefresh } = useRefreshByUser(
    monthlyPayments.refetch,
  );

  const onRefresh = () => {
    openAgreementsRefresh();
    vehicleStatusCountsRefresh();
    closedAgreementsRefresh();
    monthlyPaymentsRefresh();
  };

  return (
    <ScrollView
      style={{ paddingTop: 20, marginHorizontal: -15, paddingHorizontal: 15 }}
      refreshControl={
        <RefreshControl
          refreshing={
            openAgreements.isLoading ||
            closedAgreements.isLoading ||
            vehicleStatusCounts.isLoading ||
            monthlyPayments.isLoading
          }
          onRefresh={onRefresh}
        />
      }
    >
      <View style={{ gap: 10, flex: 1 }}>
        <NumberFigure
          label="Open rentals"
          value={
            openAgreements.status === "success" ? openAgreements.data.count : 0
          }
          icon="arrow-up-right"
          isLoading={openAgreements.isLoading}
          onPress={onPressAgreement}
        />
        <NumberFigure
          label="Rentals closed this month"
          value={
            closedAgreements.status === "success"
              ? closedAgreements.data.count
              : 0
          }
          icon="arrow-down-left"
          isLoading={closedAgreements.isLoading}
          onPress={onPressAgreement}
        />
        <NumberFigure
          label="Available vehicles"
          value={
            vehicleStatusCounts.status === "success"
              ? vehicleStatusCounts.data.available
              : 0
          }
          icon="car"
          isLoading={vehicleStatusCounts.isLoading}
          onPress={onPressVehicle}
        />
        <DollarFigure
          label="Profits this month"
          value={
            monthlyPayments.status === "success"
              ? monthlyPayments.data.profit
              : 0
          }
          icon="piggy-bank"
          isLoading={monthlyPayments.isLoading}
          onPress={onPressString}
        />
        <DollarFigure
          label="Payments this month"
          value={
            monthlyPayments.status === "success"
              ? monthlyPayments.data.payments
              : 0
          }
          icon="cash-plus"
          isLoading={monthlyPayments.isLoading}
          onPress={onPressString}
        />
        <DollarFigure
          label="Refunds this month"
          value={
            monthlyPayments.status === "success"
              ? monthlyPayments.data.refunds
              : 0
          }
          icon="cash-minus"
          isLoading={monthlyPayments.isLoading}
          onPress={onPressString}
        />
        <View pb={5}></View>
      </View>
    </ScrollView>
  );
};

type CbFunction = (value: string) => void;

const CardItem = ({
  children,
  onPress = undefined,
  value,
}: {
  children: ReactNode;
  value: string;
  onPress?: CbFunction;
}) => {
  return (
    <Pressable
      onPress={() => {
        onPress?.(value);
      }}
    >
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
    </Pressable>
  );
};

const NumberFigure = ({
  value,
  icon,
  label,
  isLoading = true,
  onPress,
}: {
  value: number;
  icon: "arrow-down-left" | "arrow-up-right" | "car";
  label: string;
  isLoading: boolean;
  onPress?: CbFunction;
}) => {
  const theme = useTheme();
  const gray = theme.colors.gray[600];
  return (
    <CardItem onPress={onPress} value={`${value}`}>
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
            {!isLoading ? Number(value).toString() : "..."}
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
  isLoading = true,
  onPress,
}: {
  value: number;
  icon: "cash-plus" | "cash-minus" | "piggy-bank";
  label: string;
  isLoading: boolean;
  onPress?: CbFunction;
}) => {
  const theme = useTheme();
  const gray = theme.colors.gray[600];
  return (
    <CardItem value={`$${Number(value).toFixed(2)}`} onPress={onPress}>
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
            {!isLoading ? `$ ${Number(value).toFixed(2)}` : "..."}
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
