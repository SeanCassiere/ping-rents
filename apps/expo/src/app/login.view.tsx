import React, { useState } from "react";
import { Button, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "native-base";

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
    <SafeAreaView>
      <View
        style={{
          marginTop: 25,
          paddingHorizontal: 10,
          height: "100%",
          width: "100%",
          gap: 10,
        }}
      >
        <Text>Login to PingRents</Text>
        {errorText && (
          <Text style={{ paddingVertical: 3, color: "#dc2626" }}>
            {errorText}
          </Text>
        )}
        {stage === "email" && (
          <>
            <View style={{ paddingVertical: 2 }}>
              <Input
                placeholder="enter your email"
                onChangeText={setEmail}
                value={email}
                editable={!emailTriggerMutation.isLoading}
                inputMode="email"
              />
            </View>
            <View style={{ paddingVertical: 1 }}>
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
                style={{ marginTop: 4 }}
                onPress={() => {
                  setStage("email");
                  setErrorText("");
                }}
              >
                <Text style={{ color: "#1e293b" }}>Back</Text>
              </Pressable>
            </View>
            <View style={{ paddingVertical: 2 }}>
              <Text style={{ paddingVertical: 3, color: "#1e293b" }}>
                Enter the access code emailed to you. It only lasts for{" "}
                {accessCodeExpiry} minutes.
              </Text>
              <Input
                onChangeText={setAccessCode}
                value={accessCode}
                placeholder="enter the access code"
                inputMode="numeric"
                maxLength={6}
                editable={!canSearchCompanies}
              />
            </View>
            <View style={{ paddingVertical: 1 }}>
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
                style={{ marginTop: 4 }}
                onPress={() => {
                  setStage("email");
                  setErrorText("");
                }}
              >
                <Text style={{ color: "#1e293b" }}>Back</Text>
              </Pressable>
            </View>
            <View style={{ paddingVertical: 2 }}>
              <Text style={{ paddingVertical: 3, color: "#1e293b" }}>
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
            style={{ marginTop: 4 }}
          >
            <Text style={{ textAlign: "center", color: "#1e293b" }}>
              Register
            </Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
};

export default LoginView;
