import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AntDesign } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { type NativeStackScreenProps } from "@react-navigation/native-stack";
import { useToast } from "native-base";
import { useForm } from "react-hook-form";

import { UpdateCompanyInformationSchema } from "@acme/validator";

import Button from "../../../components/Button";
import MainHeader from "../../../components/MainHeader";
import TextInput from "../../../components/TextInput";
import { useRefreshOnFocus } from "../../../hooks/useRefreshOnFocus";
import { type GlobalRoutingType } from "../../../navigation/types";
import { api } from "../../../utils/api";
import { styles } from "../../../utils/styles";

type Props = NativeStackScreenProps<
  GlobalRoutingType["SettingsStackNavigator"],
  "CompanyEditScreen"
>;

const CompanyEditScreen = (props: Props) => {
  const toast = useToast();

  const backNavigation = () => {
    props.navigation.canGoBack()
      ? props.navigation.goBack()
      : props.navigation.navigate("RootSettingsScreen");
  };

  const [isLoaded, setIsLoaded] = useState(false);

  const { control, handleSubmit, setValue } = useForm({
    resolver: zodResolver(UpdateCompanyInformationSchema),
    defaultValues: { name: "" },
  });

  const companyQuery = api.company.getCompany.useQuery(undefined, {
    onSuccess: (data) => {
      if (data) {
        setValue("name", data.name);
        setIsLoaded(true);
      }
    },
  });
  useRefreshOnFocus(companyQuery.refetch);

  const saveMutation = api.company.update.useMutation({
    onSuccess: () => {
      toast.show({
        title: "Updated!",
        variant: "top-accent",
        description: `Company updated.`,
      });
      backNavigation();
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    saveMutation.mutate({
      name: data.name,
    });
  });

  const isDisabled = companyQuery.isLoading || saveMutation.isLoading;
  const isError = companyQuery.isError || saveMutation.isError;
  const errorMessage =
    companyQuery.error?.message || saveMutation.error?.message || "";

  return (
    <SafeAreaView style={[styles.safeArea]}>
      <StatusBar />
      <View style={[styles.pageContainer, { paddingBottom: 20 }]}>
        <MainHeader
          title={`Edit company details`}
          leftButton={{
            onPress: backNavigation,
            content: <AntDesign name="left" size={24} color="black" />,
          }}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          enabled={Platform.OS !== "web"}
          style={{ gap: 15, paddingTop: 40 }}
        >
          {companyQuery.isInitialLoading && (
            <View style={{ maxHeight: 30, width: "100%" }}>
              <Text>Loading...</Text>
            </View>
          )}
          {isError && (
            <View style={{ maxHeight: 30, width: "100%" }}>
              <Text>{errorMessage}</Text>
            </View>
          )}
          {isLoaded && (
            <>
              <TextInput
                control={control}
                name="name"
                label="Company name"
                isDisabled={isDisabled}
                placeholder="ex: DrivePro Rentals"
              />
              <Button onPress={onSubmit} disabled={isDisabled}>
                Update
              </Button>
            </>
          )}
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

export default CompanyEditScreen;
