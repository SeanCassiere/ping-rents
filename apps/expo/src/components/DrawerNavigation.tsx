import React from "react";
import {
  Alert,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Updates from "expo-updates";
import { Entypo, Feather } from "@expo/vector-icons";
import {
  DrawerContentScrollView,
  DrawerItemList,
  type DrawerContentComponentProps,
} from "@react-navigation/drawer";
import { Actionsheet, Text, View, useDisclose, useToast } from "native-base";

import { useAuthContext } from "../context/auth.context";
import { useIsomorphicConfirm } from "../hooks/useIsomorphicConfirm";
import { useRefreshOnFocus } from "../hooks/useRefreshOnFocus";
import { api } from "../utils/api";
import { ellipsizeString } from "../utils/ellipsizeString";

const LOGO_BG = "#F8F9FA";

const DrawerNavigation = (
  props: DrawerContentComponentProps & { onLogout: () => Promise<void> },
) => {
  const { onLogout, ...drawerProps } = props;

  const insets = useSafeAreaInsets();
  const confirm = useIsomorphicConfirm();
  const { login } = useAuthContext();
  const toast = useToast();

  const {
    isOpen: isTenantModalOpen,
    onOpen: onTenantModalOpen,
    onClose: onTenantModalClose,
  } = useDisclose();

  const authUser = api.auth.getAuthUser.useQuery();
  useRefreshOnFocus(authUser.refetch);

  const companyQuery = api.company.getCompany.useQuery();
  useRefreshOnFocus(companyQuery.refetch);
  const currentTenantId = companyQuery.data?.id || "";

  const tenants = api.auth.getTenantsForUser.useQuery();
  useRefreshOnFocus(tenants.refetch);

  const switchAccountMutation = api.auth.switchTenantForSession.useMutation({
    onError: (err) => {
      const msg = err.message;
      toast.show({
        title: "Error!",
        variant: "top-accent",
        description: msg,
      });
    },
    onSuccess: (data) => {
      login(data);
    },
    onSettled: () => {
      onTenantModalClose();
    },
  });

  const handlePresentTenantModal = () => {
    onTenantModalOpen();
  };
  const handleDismissTenantPress = () => {
    if (switchAccountMutation.isLoading) return;
    onTenantModalClose();
  };

  const checkForUpdates = async () => {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        Updates.reloadAsync();
      } else {
        Alert.alert("No new updates", "You are already on the latest version", [
          { onPress: () => {}, text: "OK" },
        ]);
      }
    } catch (error) {
      Alert.alert(
        "Update checking failed",
        error instanceof Error ? error.message : "Unknown error",
        [{ onPress: () => {}, text: "OK" }],
      );
    }
  };

  return (
    <View style={[drawerStyles.container]}>
      <DrawerContentScrollView
        {...drawerProps}
        contentContainerStyle={{ paddingTop: 0 }}
      >
        <View style={[drawerStyles.infoCard, { paddingTop: insets.top + 45 }]}>
          <View style={[drawerStyles.logoBlock]}>
            <Image
              source={require("../../assets/images/icon.png")}
              style={{ height: 50, width: 50 }}
              alt="Logo"
            />
            <View style={{ alignItems: "flex-start" }}>
              <Text
                style={[drawerStyles.logoText]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {ellipsizeString(`${companyQuery.data?.name}`)}
              </Text>
              <Text
                style={{ paddingTop: 5, fontSize: 16 }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                Hi!{" "}
                <Text style={{ fontWeight: "500", color: "#636262" }}>
                  {ellipsizeString(`${authUser.data?.name}`, 15)}
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
        {(tenants?.data || []).length > 1 && (
          <TouchableOpacity onPress={handlePresentTenantModal}>
            <View style={[drawerStyles.bottomFoldBtn, { marginBottom: 25 }]}>
              <Entypo name="select-arrows" size={24} color="black" />
              <Text>Switch company</Text>
            </View>
          </TouchableOpacity>
        )}
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
        <Pressable onPress={checkForUpdates}>
          <Text
            style={{
              marginTop: 20,
              fontSize: 13,
              textAlign: "left",
              color: "#898989",
            }}
          >
            PingRents v1
          </Text>
        </Pressable>
      </View>
      <Actionsheet
        isOpen={isTenantModalOpen}
        onClose={handleDismissTenantPress}
      >
        <Actionsheet.Content>
          {(tenants?.data || []).map((tenant, idx) => (
            <Actionsheet.Item
              key={`select_tenant_${tenant.id}`}
              onPress={() => {
                switchAccountMutation.mutate({ companyId: tenant.id });
              }}
              isDisabled={
                tenant.id === currentTenantId || switchAccountMutation.isLoading
              }
            >
              <Text>
                {idx + 1}. {tenant.name}
              </Text>
            </Actionsheet.Item>
          ))}
        </Actionsheet.Content>
      </Actionsheet>
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
    minHeight: 165,
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
