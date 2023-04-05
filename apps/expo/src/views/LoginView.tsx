import React, { useState } from "react";
import { Keyboard, Platform, Pressable, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { zodResolver } from "@hookform/resolvers/zod";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Button, useToast } from "native-base";
import { useForm } from "react-hook-form";

import { z } from "@acme/validator";

import "@acme/validator/src/auth";
import { FlashList } from "@shopify/flash-list";

import TextInput from "../components/TextInput";
import { useAuthContext } from "../context/auth.context";
import { api } from "../utils/api";
import { NAVIGATION_KEYS } from "../utils/navigation";
import { styles } from "../utils/styles";
import { useCustomNavigation } from "../utils/useNavigation";

const messages = {
  signUp: "No account? Sign Up",
  trySendAgain: "I need to send the PIN again",
  startAgain: "I need to start again",
  emailSent: "We've sent you an email with a PIN.",
  pinDuration: (num: number) =>
    `This PIN will only be valid for ${num} minutes.`,
};

const Stack = createNativeStackNavigator();

type LoginState = {
  email: string;
  accessCode: string;
  companyId: string;
};

type FnVerified = (id: keyof LoginState, value: string) => void;

const LoginStack = () => {
  const [loginState, setLoginState] = useState<LoginState>({
    email: "",
    accessCode: "",
    companyId: "",
  });

  const handleVerified: FnVerified = (id, value) => {
    setLoginState((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#fff" },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name={NAVIGATION_KEYS.LOGIN_EMAIL_VIEW.view}
        options={{
          title: NAVIGATION_KEYS.LOGIN_EMAIL_VIEW.title,
          headerShown: false,
        }}
      >
        {() => <LoginEmailView onVerified={handleVerified} />}
      </Stack.Screen>

      <Stack.Screen
        name={NAVIGATION_KEYS.LOGIN_CODE_VIEW.view}
        options={{ title: "" }}
      >
        {() => (
          <LoginAccessCodeView
            email={loginState.email}
            accessCode={loginState.accessCode}
            onVerified={handleVerified}
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name={NAVIGATION_KEYS.LOGIN_COMPANY_VIEW.view}
        options={{ title: "" }}
      >
        {() => (
          <LoginCompanySelectionView
            email={loginState.email}
            accessCode={loginState.accessCode}
            companyId={loginState.companyId}
            onVerified={handleVerified}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default LoginStack;

const LoginEmailViewSchema = z.object({ email: z.string().email() });

const LoginEmailView = (props: { onVerified: FnVerified }) => {
  const navigation = useCustomNavigation();
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(LoginEmailViewSchema),
    defaultValues: { email: "" },
  });

  const trigger = api.auth.triggerEmailLoginAccessCode.useMutation({
    onMutate: () => {
      Keyboard.dismiss();
    },
    onError: (error) => {
      toast.show({
        title: "Error",
        variant: "top-accent",
        description: error.message,
      });
    },
    onSuccess: (_, variables) => {
      reset();
      props.onVerified("email", variables.email);
      navigation.navigate(NAVIGATION_KEYS.LOGIN_CODE_VIEW.view);
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    trigger.mutate(data);
  });

  return (
    <SafeAreaView style={[styles.safeArea]}>
      <StatusBar />
      <View
        style={[
          styles.pageContainer,
          {
            paddingTop: insets.top,
            paddingBottom: 20,
            gap: 10,
            justifyContent: "space-between",
          },
        ]}
      >
        <View style={[styles.pageTitleContainer]}>
          <Text style={styles.pageTitle}>Login</Text>
        </View>
        <View style={{ gap: 30, justifyContent: "space-between" }}>
          <View style={{ gap: 15 }}>
            <TextInput
              control={control}
              name="email"
              label="Email"
              placeholder="enter your email"
            />
            <View>
              <Button
                onPress={onSubmit}
                disabled={trigger.isLoading}
                isDisabled={trigger.isLoading}
                isLoading={trigger.isLoading}
              >
                Send access PIN
              </Button>
            </View>
          </View>
          <View
            style={{
              alignItems: "center",
              justifyContent: "flex-end",
              paddingBottom: 20,
            }}
          >
            <Pressable
              onPress={() => {
                navigation.navigate(NAVIGATION_KEYS.REGISTER_TAB.view);
              }}
              disabled={trigger.isLoading}
            >
              <Text style={[styles.textUnderline]}>{messages.signUp}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const LoginAccessCodeViewSchema = z.object({
  accessCode: z.string(),
  email: z.string(),
});

const LoginAccessCodeView = (props: {
  email: string;
  accessCode: string;
  onVerified: FnVerified;
}) => {
  const navigation = useCustomNavigation();
  const toast = useToast();

  const [accessCode, setAccessCode] = useState(props.accessCode);

  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(LoginAccessCodeViewSchema),
    defaultValues: { email: "", accessCode },
  });

  const trigger = api.auth.getCompaniesWithAccessCode.useQuery(
    {
      email: props.email,
      accessCode,
    },
    {
      enabled: accessCode !== "",
      onSuccess: (data) => {
        props.onVerified("accessCode", accessCode);
        if (data.length === 0) {
          toast.show({
            title: "Error",
            variant: "top-accent",
            description: "This account is not linked to a company.",
          });
          navigation.navigate(NAVIGATION_KEYS.LOGIN_EMAIL_VIEW.view);
        } else if (data.length === 1 && data[0]) {
          props.onVerified("companyId", data[0].id);
          navigation.navigate(NAVIGATION_KEYS.LOGIN_COMPANY_VIEW.view);
        } else {
          navigation.navigate(NAVIGATION_KEYS.LOGIN_COMPANY_VIEW.view);
        }
      },
      onError: (error) => {
        reset();
        toast.show({
          title: "Error",
          variant: "top-accent",
          description: error.message,
        });
      },
    },
  );

  const onSubmit = handleSubmit(async (data) => {
    setAccessCode(data.accessCode);
  });

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
          <Text style={styles.pageTitle}>Access Code</Text>
          <View style={{ marginTop: 25, gap: 10 }}>
            <Text>{messages.emailSent}</Text>
            <Text>{messages.pinDuration(10)}</Text>
          </View>
        </View>
        <View style={{ gap: 30, justifyContent: "space-between" }}>
          <View style={{ gap: 15 }}>
            <TextInput
              control={control}
              name="accessCode"
              label="PIN"
              placeholder="enter the access pin"
              inputMode="numeric"
            />
            <View>
              <Button
                onPress={onSubmit}
                disabled={trigger.isFetching}
                isDisabled={trigger.isFetching}
                isLoading={trigger.isFetching}
              >
                Confirm
              </Button>
            </View>
          </View>
          <View
            style={{
              alignItems: "center",
              justifyContent: "flex-end",
              paddingBottom: 20,
            }}
          >
            <Pressable
              onPress={() => {
                navigation.goBack();
              }}
              disabled={trigger.isFetching}
            >
              <Text style={[styles.textUnderline]}>
                {messages.trySendAgain}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const LoginCompanySelectionView = (props: {
  onVerified: FnVerified;
  email: string;
  accessCode: string;
  companyId: string;
}) => {
  const { login: loginFn } = useAuthContext();

  const navigation = useCustomNavigation();
  const toast = useToast();

  const [selectedCompanyId, setSelectedCompanyId] = useState(props.companyId);

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
      email: props.email,
      accessCode: props.accessCode,
    },
    {
      enabled: props.companyId === "",
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
          <Text style={styles.pageTitle}>
            {props.companyId === "" ? "Select a company" : "Success!"}
          </Text>
          {props.companyId !== "" && (
            <Text style={[styles.errorText, { color: "black" }]}>
              Press confirm to login.
            </Text>
          )}
        </View>
        <View style={{ gap: 30, justifyContent: "space-between" }}>
          <View style={{ gap: 15, flexGrow: 1 }}>
            {props.companyId === "" ? (
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
              {props.companyId !== "" ? (
                <Button
                  onPress={() => {
                    finalLoginMutation.mutate({
                      accountEmail: props.email,
                      accessCode: props.accessCode,
                      companyId: props.companyId,
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
                      accountEmail: props.email,
                      accessCode: props.accessCode,
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
            {props.companyId === "" && (
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
