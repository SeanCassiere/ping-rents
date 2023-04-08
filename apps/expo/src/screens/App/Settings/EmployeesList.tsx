import React from "react";
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
  "EmployeesListScreen"
>;

const EmployeesListScreen = (props: Props) => {
  const employeesQuery = api.company.getEmployees.useQuery();
  useRefreshOnFocus(employeesQuery.refetch);

  return (
    <SafeAreaView style={[styles.safeArea]}>
      <StatusBar />
      <View style={[styles.pageContainer, { paddingBottom: 20 }]}>
        <MainHeader
          title="Employees"
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
              props.navigation.push("EmployeeEditScreen", {
                employeeId: "",
              });
            },
            content: <AntDesign name="plus" size={24} color="black" />,
          }}
        />
        <View
          style={{ gap: 15, paddingTop: 40, width: "100%", height: "100%" }}
        >
          {employeesQuery.isInitialLoading && (
            <View style={{ maxHeight: 30, width: "100%" }}>
              <Text>Loading...</Text>
            </View>
          )}
          {employeesQuery.status === "error" && (
            <View style={{ maxHeight: 30, width: "100%" }}>
              <Text>{employeesQuery.error.message}</Text>
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
              data={employeesQuery.data || []}
              renderItem={({ item: employee, index }) => {
                return (
                  <PressableSettingsOption
                    text={`${index + 1}. ${employee.name}`}
                    onPress={() => {
                      props.navigation.push("EmployeeEditScreen", {
                        employeeId: employee.id,
                      });
                    }}
                    smallTextBelow={employee.account.email}
                  />
                );
              }}
              estimatedItemSize={60}
              refreshing={
                employeesQuery.isInitialLoading === false &&
                employeesQuery.isLoading
              }
              onRefresh={employeesQuery.refetch}
              scrollEnabled
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default EmployeesListScreen;
