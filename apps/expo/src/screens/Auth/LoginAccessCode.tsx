import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AntDesign } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { type NativeStackScreenProps } from "@react-navigation/native-stack";
import { useToast } from "native-base";
import { useForm } from "react-hook-form";

import { z } from "@acme/validator";

import Button from "../../components/Button";
import MainHeader from "../../components/MainHeader";
import TextInput from "../../components/TextInput";
import { type GlobalRoutingType } from "../../navigation/types";
import { api } from "../../utils/api";
import { styles } from "../../utils/styles";

const messages = {
  trySendAgain: "I need to send the PIN again",
  emailSent: "We've sent you an email with a PIN to proceed.",
  pinDuration: (num: number) =>
    `This PIN will only be valid for ${num} minutes.`,
};

const LoginAccessCodeViewSchema = z.object({
  accessCode: z.string(),
  email: z.string(),
});

type Props = NativeStackScreenProps<
  GlobalRoutingType["AuthStackNavigator"],
  "LoginAccessCode"
>;

const LoginAccessCodeScreen = (props: Props) => {
  const { navigation } = props;
  const toast = useToast();

  const [accessCode, setAccessCode] = useState("");

  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(LoginAccessCodeViewSchema),
    defaultValues: { email: props.route.params.email, accessCode },
  });

  const trigger = api.auth.getUserTenantsUsingAccessCode.useQuery(
    {
      email: props.route.params.email,
      accessCode,
    },
    {
      enabled: accessCode !== "",
      onSuccess: (data) => {
        if (data.length === 0) {
          toast.show({
            title: "Error",
            variant: "top-accent",
            description: "This account is not linked to a company.",
          });
          navigation.push("LoginEmail");
        } else if (data.length === 1 && data[0]) {
          navigation.push("LoginCompanies", {
            email: props.route.params.email,
            accessCode,
            companyId: data[0].id,
          });
        } else {
          navigation.navigate("LoginCompanies", {
            email: props.route.params.email,
            accessCode,
            companyId: "",
          });
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
        <MainHeader
          title="Access Code"
          leftButton={{
            onPress: () =>
              props.navigation.canGoBack()
                ? props.navigation.goBack()
                : props.navigation.navigate("LoginEmail"),
            content: <AntDesign name="left" size={24} color="black" />,
          }}
          contentBelow={
            <View style={{ marginTop: 15 }}>
              <Text>{messages.emailSent}</Text>
              <Text>{messages.pinDuration(10)}</Text>
            </View>
          }
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          enabled={Platform.OS !== "web"}
          style={{ gap: 30, justifyContent: "space-between" }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 60}
        >
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
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

export default LoginAccessCodeScreen;
