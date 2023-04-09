import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AntDesign } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { type NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, useToast } from "native-base";
import { useForm } from "react-hook-form";

import {
  CreateRateNewSchema,
  UpdateRateSchema,
} from "@acme/validator/src/rate";

import MainHeader from "../../../components/MainHeader";
import NumberInput from "../../../components/NumberInput";
import SelectInput from "../../../components/SelectInput";
import TextInput from "../../../components/TextInput";
import { useRefreshOnFocus } from "../../../hooks/useRefreshOnFocus";
import { type GlobalRoutingType } from "../../../navigation/types";
import { api } from "../../../utils/api";
import { styles } from "../../../utils/styles";

type Props = NativeStackScreenProps<
  GlobalRoutingType["SettingsStackNavigator"],
  "RentalRateEditScreen"
>;

const RentalRateEditScreen = (props: Props) => {
  const toast = useToast();
  const isEdit = props.route.params.rentalRateId !== "";

  const [forceError, setForceError] = useState("");
  const [isLoaded, setIsLoaded] = useState(isEdit ? false : true);

  const backNavigation = () => {
    props.navigation.canGoBack()
      ? props.navigation.goBack()
      : props.navigation.navigate("RentalRatesListScreen");
  };

  const {
    control: newControl,
    handleSubmit: newHandleSubmit,
    register: newRegister,
    setValue: setNewValue,
  } = useForm({
    resolver: zodResolver(CreateRateNewSchema),
    defaultValues: {
      name: "",
      calculationType: "retail",
      vehicleTypeId: "",
      locationId: props.route.params.locationId,
      dailyRate: 0,
    },
  });

  const {
    setValue: setEditValue,
    control: editControl,
    handleSubmit: editHandleSubmit,
    register: editRegister,
  } = useForm({
    resolver: zodResolver(UpdateRateSchema),
    defaultValues: {
      id: props.route.params.rentalRateId,
      name: "",
      calculationType: "retail",
      dailyRate: 0,
      vehicleTypeId: "",
    },
  });

  const rateQuery = api.rate.getRate.useQuery(
    { id: props.route.params.rentalRateId },
    {
      enabled: isEdit,
      onSuccess: (data) => {
        setEditValue("id", data.id);
        setEditValue("name", data.name);
        setEditValue("calculationType", data.calculationType);
        setEditValue("vehicleTypeId", data.vehicleTypeId);
        setEditValue("dailyRate", data.dailyRate);
        setIsLoaded(true);
      },
    },
  );
  useRefreshOnFocus(rateQuery.refetch);

  const createMutation = api.rate.create.useMutation({
    onSuccess: (data) => {
      toast.show({
        title: "Created!",
        variant: "top-accent",
        description: `Rental rate created.`,
      });
      backNavigation();
    },
  });
  const editMutation = api.rate.update.useMutation({
    onSuccess: (data) => {
      toast.show({
        title: "Created!",
        variant: "top-accent",
        description: `Rental rate updated.`,
      });
      backNavigation();
    },
  });

  const control = isEdit ? editControl : newControl;
  const register = isEdit ? editRegister : newRegister;

  const onSubmit = isEdit
    ? editHandleSubmit(async (data) => {
        editMutation.mutate({
          id: data.id,
          name: data.name,
          calculationType: data.calculationType as any,
          dailyRate: data.dailyRate,
        });
      })
    : newHandleSubmit(async (data) => {
        createMutation.mutate({
          name: data.name,
          calculationType: data.calculationType as any,
          dailyRate: data.dailyRate,
          locationId: data.locationId,
          vehicleTypeId: data.vehicleTypeId,
        });
      });

  const vehicleTypesQuery = api.vehicleType.getAll.useQuery(undefined, {
    onSuccess: (data) => {
      if (data.length === 0) {
        setForceError("No vehicle types found.\nPlease create one first.");
      }
      if (!isEdit && data[0]) {
        setNewValue("vehicleTypeId", data[0].id);
      }
    },
  });
  useRefreshOnFocus(vehicleTypesQuery.refetch);

  const isDisabled = isEdit
    ? rateQuery.isLoading || editMutation.isLoading
    : createMutation.isLoading || forceError !== "";

  const isError =
    rateQuery.status === "error" ||
    createMutation.status === "error" ||
    editMutation.status === "error" ||
    forceError !== "";
  const errorMessage =
    rateQuery.error?.message ||
    createMutation.error?.message ||
    editMutation.error?.message ||
    forceError ||
    "";

  return (
    <SafeAreaView style={[styles.safeArea]}>
      <StatusBar />
      <View style={[styles.pageContainer, { paddingBottom: 20 }]}>
        <MainHeader
          title={`${isEdit ? "Edit" : "New"} rental rate`}
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
          {rateQuery.isInitialLoading && (
            <View style={{ maxHeight: 30, width: "100%" }}>
              <Text>Loading...</Text>
            </View>
          )}
          {isError && (
            <View style={{ width: "100%" }}>
              <Text>{errorMessage}</Text>
            </View>
          )}
          {isLoaded && (
            <>
              <TextInput
                control={control}
                name="name"
                label="Rate name"
                isDisabled={isDisabled || isEdit}
                placeholder="ex: Compact, Sedan, Luxury"
              />
              <SelectInput
                control={control}
                label="Vehicle type"
                name="vehicleTypeId"
                placeholder="Select vehicle type"
                options={(vehicleTypesQuery.data || []).map((item) => ({
                  key: item.id,
                  label: item.name,
                  value: item.id,
                }))}
                selectProps={{ isDisabled: isDisabled || isEdit }}
              />
              <NumberInput
                control={control}
                register={register}
                name="dailyRate"
                label="Daily rate"
                minValue={0}
                disabled={isDisabled}
                decimal
              />
              <Button onPress={onSubmit} disabled={isDisabled}>
                {isEdit ? "Update" : "Save"}
              </Button>
            </>
          )}
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

export default RentalRateEditScreen;
