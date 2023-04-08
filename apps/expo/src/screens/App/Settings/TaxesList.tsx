import React, { useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AntDesign } from "@expo/vector-icons";
import { type NativeStackScreenProps } from "@react-navigation/native-stack";
import { FlashList } from "@shopify/flash-list";

import MainHeader from "../../../components/MainHeader";
import { useRefreshOnFocus } from "../../../hooks/useRefreshOnFocus";
import { type GlobalRoutingType } from "../../../navigation/types";
import { api } from "../../../utils/api";
import { styles } from "../../../utils/styles";
import { PressableSettingsOption } from "./Root";

type Props = NativeStackScreenProps<
  GlobalRoutingType["SettingsStackNavigator"],
  "TaxesListScreen"
>;

const TaxesListScreen = (props: Props) => {
  const [locationId, setLocationId] = useState("");

  const locationsQuery = api.location.getAll.useQuery(undefined, {
    onSuccess: (data) => {
      if (data.length > 0 && data[0]) {
        setLocationId(data[0].id);
      }
    },
  });
  useRefreshOnFocus(locationsQuery.refetch);

  const taxesQuery = api.tax.getAll.useQuery(
    { locationId },
    { enabled: locationId !== "" },
  );
  useRefreshOnFocus(taxesQuery.refetch);

  return (
    <SafeAreaView style={[styles.safeArea]}>
      <StatusBar />
      <View style={[styles.pageContainer, { paddingBottom: 20 }]}>
        <MainHeader
          title="Taxes"
          leftButton={{
            onPress: () => {
              props.navigation.canGoBack()
                ? props.navigation.goBack()
                : props.navigation.navigate("RootSettingsScreen");
            },
            content: <AntDesign name="left" size={24} color="black" />,
          }}
          rightButton={{
            onPress: () => {
              props.navigation.push("TaxEditScreen", {
                taxId: "",
                locationId,
              });
            },
            content: <AntDesign name="plus" size={24} color="black" />,
          }}
        />
        <View
          style={{ gap: 15, paddingTop: 40, width: "100%", height: "100%" }}
        >
          {taxesQuery.isInitialLoading && (
            <View style={{ maxHeight: 30, width: "100%" }}>
              <Text>Loading...</Text>
            </View>
          )}
          {taxesQuery.status === "error" && (
            <View style={{ maxHeight: 30, width: "100%" }}>
              <Text>{taxesQuery.error.message}</Text>
            </View>
          )}

          <View
            style={{
              flex: 1,
              width: "100%",
              height: "100%",
            }}
          >
            <FlashList
              data={taxesQuery.data || []}
              renderItem={({ item: tax, index }) => {
                let text = `${index + 1}. ${tax.name}`;

                if (tax.calculationType === "percentage") {
                  text += ` - (${Number(tax.value).toFixed(2)}%)`;
                }

                return (
                  <PressableSettingsOption
                    text={text}
                    onPress={() => {
                      props.navigation.push("TaxEditScreen", {
                        taxId: tax.id,
                        locationId,
                      });
                    }}
                  />
                );
              }}
              estimatedItemSize={60}
              refreshing={
                taxesQuery.isInitialLoading === false && taxesQuery.isLoading
              }
              onRefresh={taxesQuery.refetch}
              scrollEnabled
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default TaxesListScreen;
