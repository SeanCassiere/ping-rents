import React from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { zodResolver } from "@hookform/resolvers/zod";
import { type NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, useToast } from "native-base";
import { useForm } from "react-hook-form";

import { z } from "@acme/validator";

import "@acme/validator/src/auth";
import MainHeader from "../../components/MainHeader";
import TextInput from "../../components/TextInput";
import { type GlobalRoutingType } from "../../navigation/types";
import { api } from "../../utils/api";
import { styles } from "../../utils/styles";

const messages = {
  signUp: "No account? Sign Up",
};

const LoginEmailFormSchema = z.object({ email: z.string().email() });

type Props = NativeStackScreenProps<
  GlobalRoutingType["AuthStackNavigator"],
  "LoginEmail"
>;

const LoginEmailScreen = (props: Props) => {
  const { navigation } = props;
  const toast = useToast();

  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(LoginEmailFormSchema),
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
      navigation.push("LoginAccessCode", { email: variables.email });
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
            paddingBottom: 20,
            gap: 10,
            justifyContent: "space-between",
          },
        ]}
      >
        <MainHeader title="Login" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          enabled={Platform.OS !== "web"}
          style={{ gap: 30, justifyContent: "space-between" }}
        >
          <View style={{ gap: 15 }}>
            <TextInput
              control={control}
              name="email"
              label="Email"
              placeholder="enter your email"
              isDisabled={trigger.isLoading}
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
                navigation.navigate("Register");
              }}
              disabled={trigger.isLoading}
            >
              <Text style={[styles.textUnderline]}>{messages.signUp}</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

export default LoginEmailScreen;
