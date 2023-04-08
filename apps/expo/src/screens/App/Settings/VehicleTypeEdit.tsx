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
  CreateVehicleTypeSchema,
  UpdateVehicleTypeSchema,
} from "@acme/validator/src/vehicleType";

import MainHeader from "../../../components/MainHeader";
import TextInput from "../../../components/TextInput";
import { useRefreshOnFocus } from "../../../hooks/useRefreshOnFocus";
import { type GlobalRoutingType } from "../../../navigation/types";
import { api } from "../../../utils/api";
import { styles } from "../../../utils/styles";

type Props = NativeStackScreenProps<
  GlobalRoutingType["SettingsStackNavigator"],
  "VehicleTypeEditScreen"
>;

const VehicleTypesEditScreen = (props: Props) => {
  const toast = useToast();

  const backNavigation = () => {
    props.navigation.canGoBack()
      ? props.navigation.goBack()
      : props.navigation.navigate("VehicleTypesListScreen");
  };

  const isEdit = props.route.params.vehicleTypeId !== "";

  const [isLoaded, setIsLoaded] = useState(isEdit ? false : true);

  const { control: newControl, handleSubmit: newHandleSubmit } = useForm({
    resolver: zodResolver(CreateVehicleTypeSchema),
    defaultValues: { name: "" },
  });

  const {
    setValue: setEditValue,
    control: editControl,
    handleSubmit: editHandleSubmit,
  } = useForm({
    resolver: zodResolver(UpdateVehicleTypeSchema),
    defaultValues: {
      vehicleTypeId: props.route.params.vehicleTypeId,
      name: "",
    },
  });

  const vehicleTypeQuery = api.vehicleType.getVehicleType.useQuery(
    { id: props.route.params.vehicleTypeId },
    {
      enabled: isEdit,
      onSuccess: (data) => {
        setEditValue("vehicleTypeId", data.id);
        setEditValue("name", data.name);
        setIsLoaded(true);
      },
    },
  );
  useRefreshOnFocus(vehicleTypeQuery.refetch);

  const createMutation = api.vehicleType.create.useMutation({
    onSuccess: (data) => {
      toast.show({
        title: "Created!",
        variant: "top-accent",
        description: `${data.name} vehicle type created.`,
      });
      backNavigation();
    },
  });
  const editMutation = api.vehicleType.update.useMutation({
    onSuccess: (data) => {
      toast.show({
        title: "Created!",
        variant: "top-accent",
        description: `${data.name} vehicle type updated.`,
      });
      backNavigation();
    },
  });

  const control = isEdit ? editControl : newControl;

  const onSubmit = isEdit
    ? editHandleSubmit(async (data) => {
        editMutation.mutate({
          vehicleTypeId: data.vehicleTypeId,
          name: data.name,
        });
      })
    : newHandleSubmit(async (data) => {
        createMutation.mutate({ name: data.name });
      });

  const isDisabled = isEdit
    ? vehicleTypeQuery.isLoading || editMutation.isLoading
    : createMutation.isLoading;

  const isError =
    vehicleTypeQuery.status === "error" ||
    createMutation.status === "error" ||
    editMutation.status === "error";
  const errorMessage =
    vehicleTypeQuery.error?.message ||
    createMutation.error?.message ||
    editMutation.error?.message ||
    "";

  return (
    <SafeAreaView style={[styles.safeArea]}>
      <StatusBar />
      <View style={[styles.pageContainer, { paddingBottom: 20 }]}>
        <MainHeader
          title={`${isEdit ? "Edit" : "New"} vehicle type`}
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
          {vehicleTypeQuery.isInitialLoading && (
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
                placeholder="ex: Compact, Sedan, Luxury"
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

export default VehicleTypesEditScreen;
