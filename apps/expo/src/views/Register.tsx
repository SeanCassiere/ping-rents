import React from "react";
import { Keyboard, StatusBar, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Pressable, Text, useToast } from "native-base";
import { useForm } from "react-hook-form";

import {
  RegisterNewCompanyAndAccountSchema,
  type InputRegisterNewCompanyAndAccount,
} from "@acme/validator/src/auth";

import TextInput from "../components/TextInput";
import { api } from "../utils/api";
import { NAVIGATION_KEYS } from "../utils/navigation";
import { styles } from "../utils/styles";
import { useCustomNavigation } from "../utils/useNavigation";

const messages = {
  haveAccount: "I already have an account, let's sign in!",
  creationSuccessfulTitle: "Successful!",
  creationSuccessfulMsg: "Your account has been successfully created!",
  creationErrorTitle: "Error",
};

const RegisterView = () => {
  const navigation = useCustomNavigation();
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(RegisterNewCompanyAndAccountSchema),
    defaultValues: {
      companyName: "",
      accountName: "",
      accountEmail: "",
    },
  });

  const register = api.auth.registerCompanyAndAccount.useMutation({
    onSuccess: () => {
      toast.show({
        title: messages.creationSuccessfulTitle,
        variant: "top-accent",
        description: messages.creationSuccessfulMsg,
      });
      reset();
      navigation.navigate(NAVIGATION_KEYS.LOGIN_TAB.view);
    },
    onError: (error) => {
      toast.show({
        title: messages.creationErrorTitle,
        variant: "top-accent",
        description: error.message,
      });
    },
  });

  const onSubmit = (data: InputRegisterNewCompanyAndAccount) => {
    Keyboard.dismiss();
    register.mutate(data);
  };

  return (
    <SafeAreaView>
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
        <View>
          <Text style={styles.pageTitle}>Sign up</Text>
        </View>
        <View style={{ gap: 30, justifyContent: "space-between" }}>
          <View style={{ gap: 15 }}>
            <TextInput
              control={control}
              name="companyName"
              label="Company name"
              placeholder="What's your rental company called?"
            />
            <TextInput
              control={control}
              name="accountName"
              label="Name"
              placeholder="ex: John Doe"
            />
            <TextInput
              control={control}
              name="accountEmail"
              label="Email"
              placeholder="ex: john@company.com"
              inputMode="email"
            />
            <View>
              <Button
                onPress={handleSubmit(onSubmit)}
                disabled={register.isLoading}
                isDisabled={register.isLoading}
              >
                Register
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
                navigation.navigate(NAVIGATION_KEYS.LOGIN_TAB.view);
              }}
              disabled={register.isLoading}
            >
              <Text style={[styles.textUnderline]}>{messages.haveAccount}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default RegisterView;
