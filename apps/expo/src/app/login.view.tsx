import React, { useState } from "react";
import { Button, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuthContext } from "../context/auth.context";
import { api } from "../utils/api";
import { useCustomNavigation } from "../utils/useNavigation";

const LoginView = () => {
  const { login: loginFn } = useAuthContext();
  const navigation = useCustomNavigation();

  const [errorText, setErrorText] = useState("");
  const [email, setEmail] = useState("");
  const [accessCodeExpiry, setAccessCodeExpiry] = useState(0);

  const [accessCode, setAccessCode] = useState("");
  const [canSearchCompanies, setCanSearchCompanies] = useState(false);

  const [stage, setStage] = useState<"email" | "access-code" | "selection">(
    "email",
  );

  const emailTriggerMutation = api.auth.triggerEmailLoginAccessCode.useMutation(
    {
      onSuccess: (data) => {
        setAccessCodeExpiry(data.expiresInMinutes);
        setStage("access-code");
      },
      onError: (error) => {
        setErrorText(error.message);
      },
    },
  );
  const finalLoginMutation = api.auth.loginWithAccessCodeAndCompany.useMutation(
    {
      onSuccess: async (data) => {
        await loginFn({
          accessToken: data.accessToken,
          sessionId: data.sessionId,
        });
      },
    },
  );
  const companiesQuery = api.auth.getCompaniesWithAccessCode.useQuery(
    { email, accessCode },
    {
      enabled: canSearchCompanies,
      onSuccess: (data) => {
        if (data.length === 1 && data[0]) {
          handleSelectCompany(data[0].id);
        } else {
          setStage("selection");
        }
      },
      onError: (error) => {
        setErrorText(error.message);
        setCanSearchCompanies(false);
        setAccessCode("");
      },
    },
  );

  const handleEmailSubmit = () => {
    if (!email) {
      alert("Email must be provided");
      return;
    }
    emailTriggerMutation.mutate({ email });
  };

  const handleAccessCodeSubmit = () => {
    if (!email || !accessCode) {
      alert("Access code must be provided");
      return;
    }
    setCanSearchCompanies(true);
  };

  const handleSelectCompany = (id: string) => {
    if (!email || !accessCode || !id) {
      alert("Company must be selected");
      return;
    }
    finalLoginMutation.mutate({
      accountEmail: email,
      accessCode,
      companyId: id,
    });
  };

  return (
    <SafeAreaView className="bg-slate-50">
      <View className="mt-4 h-full w-full px-4">
        <Text className="text-2xl font-semibold text-slate-800">
          Login to PingRents
        </Text>
        {errorText && <Text className="py-3 text-red-600">{errorText}</Text>}
        {stage === "email" && (
          <>
            <View className="py-2">
              <TextInput
                onChangeText={setEmail}
                value={email}
                placeholder="enter your email"
                className="rounded border border-slate-400 px-4 py-1.5"
                editable={!emailTriggerMutation.isLoading}
                inputMode="email"
              />
            </View>
            <View className="py-1">
              <Button
                title="Sign in"
                onPress={handleEmailSubmit}
                disabled={emailTriggerMutation.isLoading}
              />
            </View>
          </>
        )}
        {stage === "access-code" && (
          <>
            <View>
              <Pressable
                className="mt-2"
                onPress={() => {
                  setStage("email");
                  setErrorText("");
                }}
              >
                <Text className="text-slate-800">Back</Text>
              </Pressable>
            </View>
            <View className="py-2">
              <Text className="py-3 text-slate-800">
                Enter the access code emailed to you. It only lasts for{" "}
                {accessCodeExpiry} minutes.
              </Text>
              <TextInput
                onChangeText={setAccessCode}
                value={accessCode}
                placeholder="enter the access code"
                className="rounded border border-slate-400 px-4 py-1.5"
                inputMode="numeric"
                maxLength={6}
                editable={!canSearchCompanies}
              />
            </View>
            <View className="py-1">
              <Button
                title="Submit"
                onPress={handleAccessCodeSubmit}
                disabled={canSearchCompanies}
              />
            </View>
          </>
        )}
        {stage === "selection" && (
          <>
            <View>
              <Pressable
                className="mt-2"
                onPress={() => {
                  setStage("email");
                  setErrorText("");
                }}
              >
                <Text className="text-slate-800">Back</Text>
              </Pressable>
            </View>
            <View className="py-2">
              <Text className="py-3 text-slate-800">
                Which company do you want to sign-in to?
              </Text>
              {(companiesQuery.data || []).map((company, idx) => (
                <Button
                  key={company.id}
                  title={`${idx + 1}. ${company.name}`}
                  onPress={() => handleSelectCompany(company.id)}
                />
              ))}
            </View>
          </>
        )}
        {stage === "email" && (
          <Pressable
            onPress={() => {
              navigation.navigate("register");
            }}
            className="mt-4"
          >
            <Text className="text-center text-slate-800">Register</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
};

export default LoginView;
