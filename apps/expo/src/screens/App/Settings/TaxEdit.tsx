import React, { useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AntDesign } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { type NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, useToast } from "native-base";
import { useForm } from "react-hook-form";

import { CreateNewTaxSchema, UpdateTaxSchema } from "@acme/validator/src/tax";

import MainHeader from "../../../components/MainHeader";
import NumberInput from "../../../components/NumberInput";
import TextInput from "../../../components/TextInput";
import { useRefreshOnFocus } from "../../../hooks/useRefreshOnFocus";
import { type GlobalRoutingType } from "../../../navigation/types";
import { api } from "../../../utils/api";
import { styles } from "../../../utils/styles";

type Props = NativeStackScreenProps<
  GlobalRoutingType["SettingsStackNavigator"],
  "TaxEditScreen"
>;

const TaxEditScreen = (props: Props) => {
  const toast = useToast();

  const backNavigation = () => {
    props.navigation.canGoBack()
      ? props.navigation.goBack()
      : props.navigation.navigate("TaxesListScreen");
  };

  const isEdit = props.route.params.taxId !== "";

  const [isLoaded, setIsLoaded] = useState(isEdit ? false : true);

  const { control: newControl, handleSubmit: newHandleSubmit } = useForm({
    resolver: zodResolver(CreateNewTaxSchema),
    defaultValues: {
      name: "",
      value: 0,
      calculationType: "percentage",
      locationId: props.route.params.locationId,
    },
  });

  const {
    setValue: setEditValue,
    control: editControl,
    handleSubmit: editHandleSubmit,
  } = useForm({
    resolver: zodResolver(UpdateTaxSchema),
    defaultValues: {
      id: props.route.params.taxId,
      name: "",
      value: 0,
    },
  });

  const taxTypeQuery = api.tax.getTax.useQuery(
    { id: props.route.params.taxId },
    {
      enabled: isEdit,
      onSuccess: (data) => {
        if (data) {
          setEditValue("id", data.id);
          setEditValue("name", data.name);
          setEditValue("value", data.value);
          setIsLoaded(true);
        }
      },
    },
  );
  useRefreshOnFocus(taxTypeQuery.refetch);

  const createMutation = api.tax.create.useMutation({
    onError: (err) => {
      toast.show({
        title: "Error",
        variant: "top-accent",
        description: `${err.message}`,
      });
    },
    onSuccess: (data) => {
      toast.show({
        title: "Created!",
        variant: "top-accent",
        description: `${data.name} tax created.`,
      });
      backNavigation();
    },
  });
  const editMutation = api.tax.update.useMutation({
    onError: (err) => {
      toast.show({
        title: "Error",
        variant: "top-accent",
        description: `${err.message}`,
      });
    },
    onSuccess: (data) => {
      toast.show({
        title: "Created!",
        variant: "top-accent",
        description: `${data.name} tax updated.`,
      });
      backNavigation();
    },
  });

  const control = isEdit ? editControl : newControl;

  const onSubmit = isEdit
    ? editHandleSubmit(async (data) => {
        editMutation.mutate({
          id: data.id,
          name: data.name,
          value: data.value,
        });
      })
    : newHandleSubmit(async (data) => {
        createMutation.mutate({
          name: data.name,
          value: data.value,
          calculationType: data.calculationType as any,
          locationId: props.route.params.locationId,
        });
      });

  const isDisabled = isEdit
    ? taxTypeQuery.isLoading || editMutation.isLoading
    : createMutation.isLoading;

  const isError =
    taxTypeQuery.status === "error" ||
    createMutation.status === "error" ||
    editMutation.status === "error";
  const errorMessage =
    taxTypeQuery.error?.message ||
    createMutation.error?.message ||
    editMutation.error?.message ||
    "";

  return (
    <SafeAreaView style={[styles.safeArea]}>
      <StatusBar />
      <View style={[styles.pageContainer, { paddingBottom: 20 }]}>
        <MainHeader
          title={`${isEdit ? "Edit" : "New"} tax`}
          leftButton={{
            onPress: backNavigation,
            content: <AntDesign name="left" size={24} color="black" />,
          }}
        />
        <View style={{ gap: 15, paddingTop: 40 }}>
          {taxTypeQuery.isInitialLoading && (
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
                label="Name"
                isDisabled={isDisabled}
                placeholder="ex: GST, PST, HST"
              />
              <NumberInput
                control={control}
                name="value"
                label="Percentage %"
                decimal
                maxValue={100}
                minValue={0}
                disabled={isDisabled}
              />
              <Button onPress={onSubmit} disabled={isDisabled}>
                {isEdit ? "Update" : "Save"}
              </Button>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default TaxEditScreen;
