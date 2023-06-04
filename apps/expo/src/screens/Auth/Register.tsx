import React from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { type NativeStackScreenProps } from "@react-navigation/native-stack";
import { Box, Pressable, Text, useToast } from "native-base";
import { useForm } from "react-hook-form";

import {
  RegisterNewCompanyAndAccountSchema,
  type InputRegisterNewCompanyAndAccount,
} from "@acme/validator/src/auth";

import Button from "../../components/Button";
import MainHeader from "../../components/MainHeader";
import TextInput from "../../components/TextInput";
import { type GlobalRoutingType } from "../../navigation/types";
import { PingRentsStaticLinks, api } from "../../utils/api";
import { styles } from "../../utils/styles";

const messages = {
  haveAccount: "I already have an account, let's sign in!",
  creationSuccessfulTitle: "Successful!",
  creationSuccessfulMsg: "Your account has been successfully created!",
  creationErrorTitle: "Error",
};

type Props = NativeStackScreenProps<
  GlobalRoutingType["AuthStackNavigator"],
  "Register"
>;

type RegisterScreenNavigation = Props["navigation"];

const RegisterScreen = (props: Props) => {
  const { navigation } = props;

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
    onMutate: () => {
      Keyboard.dismiss();
    },
    onSuccess: () => {
      toast.show({
        title: messages.creationSuccessfulTitle,
        variant: "top-accent",
        description: messages.creationSuccessfulMsg,
      });
      reset();
      navigation.canGoBack()
        ? navigation.goBack()
        : navigation.navigate("LoginEmail");
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
    register.mutate(data);
  };

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
          title="Sign up"
          leftButton={{
            onPress: () =>
              props.navigation.canGoBack()
                ? props.navigation.goBack()
                : props.navigation.navigate("LoginEmail"),
            content: <AntDesign name="left" size={24} color="black" />,
          }}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          enabled={Platform.OS === "ios"}
          style={{ gap: 30, justifyContent: "space-between" }}
        >
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
              <Box mb={5} mt={5}>
                <Text lineHeight={25}>
                  By clicking {'"Register"'}, you agree to our{" "}
                  <TextHyperLink
                    text="Terms"
                    title="Terms and Conditions"
                    url={PingRentsStaticLinks.termsAndConditions}
                    navigation={navigation}
                  />
                  <Text>,</Text>
                  <TextHyperLink
                    text=" Privacy Policy"
                    title="Privacy Policy"
                    url={PingRentsStaticLinks.privacyPolicy}
                    navigation={navigation}
                  />
                  <Text>,</Text>
                  <TextHyperLink
                    text=" End-User License Agreement (EULA)"
                    title="EULA"
                    url={PingRentsStaticLinks.eula}
                    navigation={navigation}
                  />
                  <Text>, and</Text>
                  <TextHyperLink
                    text=" Account Deletion
                    Policy"
                    title="Account Deletion Policy"
                    url={PingRentsStaticLinks.deleteAccountPolicy}
                    navigation={navigation}
                  />
                  <Text>.</Text>
                </Text>
              </Box>
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
                navigation.navigate("LoginEmail");
              }}
              disabled={register.isLoading}
            >
              <Text style={[styles.textUnderline]}>{messages.haveAccount}</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

const TextHyperLink = ({
  text,
  title,
  url,
  navigation,
}: {
  text: string;
  url: string;
  title: string;
  navigation: RegisterScreenNavigation;
}) => {
  return (
    <Text
      onPress={() => {
        navigation.push("PolicyWebView", { title, url });
      }}
      color="blue.500"
    >
      {text}
    </Text>
  );
};

export default RegisterScreen;
