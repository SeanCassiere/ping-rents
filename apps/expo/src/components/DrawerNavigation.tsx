import React from "react";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import {
  DrawerContentScrollView,
  DrawerItemList,
  type DrawerContentComponentProps,
} from "@react-navigation/drawer";

import { useIsomorphicConfirm } from "../hooks/useIsomorphicConfirm";
import { useRefreshOnFocus } from "../hooks/useRefreshOnFocus";
import { api } from "../utils/api";

const LOGO_BG = "#F8F9FA";

const DrawerNavigation = (
  props: DrawerContentComponentProps & { onLogout: () => Promise<void> },
) => {
  const { onLogout, ...drawerProps } = props;
  const insets = useSafeAreaInsets();
  const confirm = useIsomorphicConfirm();

  const authUser = api.auth.getAuthUser.useQuery();
  useRefreshOnFocus(authUser.refetch);

  return (
    <View style={[drawerStyles.container]}>
      <DrawerContentScrollView
        {...drawerProps}
        contentContainerStyle={{ paddingTop: 0 }}
      >
        <View style={[drawerStyles.infoCard, { paddingTop: insets.top + 20 }]}>
          <View style={[drawerStyles.logoBlock]}>
            <Image
              source={require("../../assets/images/icon.png")}
              style={{ height: 50, width: 50 }}
              alt="Logo"
            />
            <View style={{ alignItems: "flex-start" }}>
              <Text style={[drawerStyles.logoText]}>PingRents</Text>
              <Text style={{ paddingTop: 5, fontSize: 16 }}>
                Hi!{" "}
                <Text style={{ fontWeight: "500", color: "#636262" }}>
                  {authUser.data?.name}
                </Text>
              </Text>
            </View>
          </View>
        </View>
        <View style={{ paddingTop: 20 }}>
          <DrawerItemList {...drawerProps} />
        </View>
      </DrawerContentScrollView>
      <View style={[drawerStyles.bottomFold]}>
        <TouchableOpacity
          onPress={() =>
            confirm("Sign out?", "Are you sure you want to sign out?", {
              onConfirm: onLogout,
            })
          }
        >
          <View style={[drawerStyles.bottomFoldBtn]}>
            <Feather name="log-out" size={24} color="black" />
            <Text>Sign out</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DrawerNavigation;

const drawerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  bottomFold: {
    borderTopWidth: 1,
    borderTopColor: "#F1F1F1",
    padding: Platform.OS === "ios" ? 30 : 20,
  },
  bottomFoldBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoCard: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    minHeight: 140,
    backgroundColor: LOGO_BG,
  },
  logoBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoText: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
