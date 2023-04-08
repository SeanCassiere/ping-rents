import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { type NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, useToast } from "native-base";

import "@acme/validator/src/auth";
import { AntDesign } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";

import MainHeader from "../../components/MainHeader";
import { useAuthContext } from "../../context/auth.context";
import { useCustomNavigation } from "../../hooks/useNavigation";
import { type GlobalRoutingType } from "../../navigation/types";
import { api } from "../../utils/api";
import { NAVIGATION_KEYS } from "../../utils/navigation";
import { styles } from "../../utils/styles";

const messages = {
  startAgain: "I need to start again",
};

type Props = NativeStackScreenProps<
  GlobalRoutingType["AuthStackNavigator"],
  "LoginCompanies"
>;

const LoginCompaniesScreen = (props: Props) => {
  const { login: loginFn } = useAuthContext();

  const navigation = useCustomNavigation();
  const toast = useToast();

  const [selectedCompanyId, setSelectedCompanyId] = useState(
    props.route.params.companyId,
  );

  const finalLoginMutation = api.auth.loginWithAccessCodeAndCompany.useMutation(
    {
      onSuccess: async (data) => {
        await loginFn({
          accessToken: data.accessToken,
          sessionId: data.sessionId,
        });
      },
      onError: (error) => {
        toast.show({
          title: "Error",
          variant: "top-accent",
          description: error.message,
        });
      },
    },
  );

  const companies = api.auth.getCompaniesWithAccessCode.useQuery(
    {
      email: props.route.params.email,
      accessCode: props.route.params.accessCode,
    },
    {
      enabled: props.route.params.companyId === "",
      onSuccess: (data) => {
        if (data.length === 0) {
          toast.show({
            title: "Error",
            variant: "top-accent",
            description: "This account is not linked to a company.",
          });
          navigation.navigate(NAVIGATION_KEYS.LOGIN_EMAIL_VIEW.view);
        } else if (data.length === 1 && data[0]) {
          // auto mutate
          // setSelectedCompanyId(data)
        } else {
          if (data[0]) {
            setSelectedCompanyId(data[0].id);
          }
        }
      },
      onError: (error) => {
        toast.show({
          title: "Error",
          variant: "top-accent",
          description: error.message,
        });
      },
    },
  );

  return (
    <SafeAreaView style={[styles.safeArea]}>
      <StatusBar />
      <View
        style={[
          styles.pageContainer,
          {
            paddingBottom: 20,
            gap: 10,
            justifyContent: "space-between",
          },
        ]}
      >
        <View>
          <MainHeader
            title={
              props.route.params.companyId === ""
                ? "Select a company"
                : "Success!"
            }
            leftButton={{
              onPress: () =>
                props.navigation.canGoBack()
                  ? props.navigation.goBack()
                  : props.navigation.navigate("LoginEmail"),
              content: <AntDesign name="left" size={24} color="black" />,
            }}
          />
          {/* <MainHeader
            title={
              props.route.params.companyId === ""
                ? "Select a company"
                : "Success!"
            }
          /> */}
          {props.route.params.companyId !== "" && (
            <Text style={[styles.errorText, { color: "black" }]}>
              Press confirm to login.
            </Text>
          )}
        </View>
        <View style={{ gap: 30, justifyContent: "space-between" }}>
          <View style={{ gap: 15, flexGrow: 1 }}>
            {props.route.params.companyId === "" ? (
              <View style={{ minHeight: 350 }}>
                <FlashList
                  data={companies.data || []}
                  extraData={{ selectedId: selectedCompanyId }}
                  renderItem={({ item, extraData, index }) => (
                    <View
                      style={{
                        width: "100%",
                        minHeight: 50,
                        marginVertical: 5,
                        backgroundColor:
                          item.id === extraData.selectedId
                            ? "#000000"
                            : "transparent",
                        borderRadius: 5,
                        borderStyle: "solid",
                        borderColor: "black",
                        borderWidth: 1.5,
                      }}
                    >
                      <Pressable
                        style={{
                          flexDirection: "row",
                          width: "100%",
                          height: "100%",
                          paddingHorizontal: 20,
                          paddingVertical: 25,
                          alignItems: "center",
                          gap: 10,
                        }}
                        onPress={() => {
                          setSelectedCompanyId(item.id);
                        }}
                        disabled={finalLoginMutation.isLoading}
                      >
                        <View
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: 100,
                            backgroundColor:
                              item.id === extraData.selectedId
                                ? "#fff"
                                : "transparent",
                            borderWidth: 1.5,
                            borderStyle: "solid",
                            borderColor: "black",
                          }}
                        ></View>
                        <Text
                          style={{
                            width: "100%",
                            color:
                              item.id === extraData.selectedId
                                ? "#ffffff"
                                : "black",
                          }}
                        >
                          {index + 1}. {item.name}
                        </Text>
                      </Pressable>
                    </View>
                  )}
                  estimatedItemSize={50}
                  scrollEnabled
                />
              </View>
            ) : null}
            <View>
              {props.route.params.companyId !== "" ? (
                <Button
                  onPress={() => {
                    finalLoginMutation.mutate({
                      accountEmail: props.route.params.email,
                      accessCode: props.route.params.accessCode,
                      companyId: props.route.params.companyId,
                    });
                  }}
                  disabled={finalLoginMutation.isLoading}
                  isDisabled={finalLoginMutation.isLoading}
                  isLoading={finalLoginMutation.isLoading}
                >
                  Confirm
                </Button>
              ) : (
                <Button
                  onPress={() => {
                    finalLoginMutation.mutate({
                      accountEmail: props.route.params.email,
                      accessCode: props.route.params.accessCode,
                      companyId: selectedCompanyId,
                    });
                  }}
                >
                  Confirm
                </Button>
              )}
            </View>
          </View>
          <View
            style={{
              alignItems: "center",
              justifyContent: "flex-end",
              paddingBottom: 20,
            }}
          >
            {props.route.params.companyId === "" && (
              <Pressable
                onPress={() => {
                  navigation.navigate(NAVIGATION_KEYS.LOGIN_EMAIL_VIEW.view);
                }}
                disabled={finalLoginMutation.isLoading}
              >
                <Text style={[styles.textUnderline]}>
                  {messages.startAgain}
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LoginCompaniesScreen;
