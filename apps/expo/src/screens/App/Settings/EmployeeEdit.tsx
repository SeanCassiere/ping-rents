import React, { useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AntDesign } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { type NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, useToast } from "native-base";
import { useForm } from "react-hook-form";

import {
  AddUserToCompanySchema,
  UpdateUserInCompanySchema,
} from "@acme/validator/src/company";

import MainHeader from "../../../components/MainHeader";
import TextInput from "../../../components/TextInput";
import { useIsomorphicConfirm } from "../../../hooks/useIsomorphicConfirm";
import { useRefreshOnFocus } from "../../../hooks/useRefreshOnFocus";
import { type GlobalRoutingType } from "../../../navigation/types";
import { api } from "../../../utils/api";
import { styles } from "../../../utils/styles";

type Props = NativeStackScreenProps<
  GlobalRoutingType["SettingsStackNavigator"],
  "EmployeeEditScreen"
>;

const EmployeeEditScreen = (props: Props) => {
  const toast = useToast();

  const authUser = api.auth.getAuthUser.useQuery();
  useRefreshOnFocus(authUser.refetch);

  const backNavigation = () => {
    props.navigation.canGoBack()
      ? props.navigation.goBack()
      : props.navigation.navigate("EmployeesListScreen");
  };

  const isEdit = props.route.params.employeeId !== "";

  const [isLoaded, setIsLoaded] = useState(isEdit ? false : true);

  const { control: newControl, handleSubmit: newHandleSubmit } = useForm({
    resolver: zodResolver(AddUserToCompanySchema),
    defaultValues: { name: "", email: "" },
  });

  const {
    setValue: setEditValue,
    control: editControl,
    handleSubmit: editHandleSubmit,
  } = useForm({
    resolver: zodResolver(UpdateUserInCompanySchema),
    defaultValues: {
      id: props.route.params.employeeId,
      name: "",
    },
  });

  const employeeQuery = api.company.getEmployee.useQuery(
    { id: props.route.params.employeeId },
    {
      enabled: isEdit,
      onSuccess: (data) => {
        if (data) {
          setEditValue("id", data.id);
          setEditValue("name", data.name);
          setIsLoaded(true);
        }
      },
    },
  );
  useRefreshOnFocus(employeeQuery.refetch);

  const createMutation = api.company.addEmployee.useMutation({
    onSuccess: (data) => {
      toast.show({
        title: "Created!",
        variant: "top-accent",
        description: `${data.name} employee added.`,
      });
      backNavigation();
    },
  });
  const editMutation = api.company.updateEmployee.useMutation({
    onSuccess: (data) => {
      toast.show({
        title: "Updated!",
        variant: "top-accent",
        description: `${data.name} employee updated.`,
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
        });
      })
    : newHandleSubmit(async (data) => {
        createMutation.mutate({ name: data.name, email: data.email });
      });

  const isDisabled = isEdit
    ? employeeQuery.isLoading || editMutation.isLoading
    : createMutation.isLoading;

  const isError =
    employeeQuery.status === "error" ||
    createMutation.status === "error" ||
    editMutation.status === "error";
  const errorMessage =
    employeeQuery.error?.message ||
    createMutation.error?.message ||
    editMutation.error?.message ||
    "";

  const removeEmployeeMutation = api.company.removeEmployee.useMutation({
    onError: (err) => {
      toast.show({
        title: "Error!",
        variant: "top-accent",
        description: `${err.message}`,
      });
    },
    onSuccess: (data) => {
      toast.show({
        title: "Removed!",
        variant: "top-accent",
        description: `${data.name} employee removed.`,
      });
      backNavigation();
    },
  });

  const confirm = useIsomorphicConfirm();

  return (
    <SafeAreaView style={[styles.safeArea]}>
      <StatusBar />
      <View style={[styles.pageContainer, { paddingBottom: 20 }]}>
        <MainHeader
          title={`${isEdit ? "Edit" : "New"} employee`}
          leftButton={{
            onPress: backNavigation,
            content: <AntDesign name="left" size={24} color="black" />,
          }}
        />
        <View style={{ gap: 15, paddingTop: 40 }}>
          {employeeQuery.isInitialLoading && (
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
                placeholder="ex: John Doe"
              />
              {!isEdit && (
                <TextInput
                  control={control}
                  name="email"
                  label="Email"
                  isDisabled={isDisabled}
                  placeholder="ex: john.doe@example.com"
                  inputMode="email"
                  keyboardType="email-address"
                />
              )}
              <Button
                onPress={onSubmit}
                disabled={isDisabled || removeEmployeeMutation.isLoading}
                isDisabled={isDisabled || removeEmployeeMutation.isLoading}
              >
                {isEdit ? "Update" : "Save"}
              </Button>
              {isEdit && (
                <Button
                  onPress={() => {
                    confirm(
                      "Remove employee?",
                      "Are you sure you want to remove this employee?",
                      {
                        onConfirm: () => {
                          removeEmployeeMutation.mutate({
                            accountId: props.route.params.employeeId,
                          });
                        },
                        confirmText: "Yes",
                      },
                    );
                  }}
                  disabled={
                    isDisabled ||
                    removeEmployeeMutation.isLoading ||
                    authUser.data?.id === props.route.params.employeeId
                  }
                  isDisabled={
                    isDisabled ||
                    removeEmployeeMutation.isLoading ||
                    authUser.data?.id === props.route.params.employeeId
                  }
                  colorScheme="red"
                >
                  Remove
                </Button>
              )}
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default EmployeeEditScreen;
