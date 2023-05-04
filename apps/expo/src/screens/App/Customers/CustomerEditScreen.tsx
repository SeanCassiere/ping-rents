import React, { useEffect } from "react";
import { Keyboard, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AntDesign } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { type NativeStackScreenProps } from "@react-navigation/native-stack";
import { KeyboardAvoidingView, useToast } from "native-base";
import { useForm, type UseFormReturn } from "react-hook-form";

import {
  CreateCustomerSchema,
  UpdateCustomerSchema,
  type InputCreateCustomer,
  type InputUpdateCustomer,
} from "@acme/validator/src/customer";

import Button from "../../../components/Button";
import MainHeader from "../../../components/MainHeader";
import TextInput from "../../../components/TextInput";
import { useRefreshOnFocus } from "../../../hooks/useRefreshOnFocus";
import { type GlobalRoutingType } from "../../../navigation/types";
import { api } from "../../../utils/api";
import { styles } from "../../../utils/styles";

type Props = NativeStackScreenProps<
  GlobalRoutingType["CustomersStackNavigator"],
  "CustomerEditScreen"
>;

const CustomerEditScreen = (props: Props) => {
  const propCustomerId = props.route.params.customerId;
  const isEdit = propCustomerId !== "";

  const backNavigation = () => {
    props.navigation.canGoBack()
      ? props.navigation.goBack()
      : props.navigation.navigate("RootCustomersList");
  };

  const onSuccess = (customerId: string) => {
    if (isEdit) {
      props.navigation.navigate("CustomerViewScreen", { customerId });
    } else {
      props.navigation.goBack();
    }
  };

  const createForm = useForm<InputCreateCustomer>({
    resolver: zodResolver(CreateCustomerSchema),
  });

  const updateForm = useForm<InputUpdateCustomer>({
    resolver: zodResolver(UpdateCustomerSchema),
    defaultValues: { firstName: "", lastName: "", email: "" },
  });

  const customerQuery = api.customer.getCustomer.useQuery(
    { id: propCustomerId },
    {
      enabled: isEdit,
    },
  );
  useRefreshOnFocus(customerQuery.refetch);

  useEffect(() => {
    if (!isEdit) return;

    if (customerQuery.status === "success") {
      const customer = customerQuery.data;
      updateForm.setValue("id", customer.id);
      updateForm.setValue("firstName", customer.firstName);
      updateForm.setValue("lastName", customer.lastName);
      updateForm.setValue("email", customer.email);
    }
  }, [customerQuery.data, customerQuery.status, isEdit, updateForm]);

  return (
    <SafeAreaView style={[styles.safeArea]}>
      <StatusBar />
      <View style={[styles.pageContainer]}>
        <MainHeader
          title={isEdit ? "Edit customer" : "New customer"}
          leftButton={{
            onPress: backNavigation,
            content: <AntDesign name="left" size={24} color="black" />,
          }}
        />
        <View style={{ flex: 1, paddingTop: 30 }}>
          {!isEdit && (
            <NewCustomerForm form={createForm} onSuccess={onSuccess} />
          )}
          {isEdit && customerQuery.status === "success" && (
            <UpdateCustomerForm
              form={updateForm}
              onSuccess={onSuccess}
              customerId={propCustomerId}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const NewCustomerForm = (props: {
  form: UseFormReturn<InputCreateCustomer>;
  onSuccess: (customerId: string) => void;
}) => {
  const toast = useToast();

  const control = props.form.control;

  const apiUtils = api.useContext();
  const createCustomerMutation = api.customer.create.useMutation({
    onError: (err) => {
      const msg = err.message;
      toast.show({
        title: "Error!",
        variant: "top-accent",
        description: msg,
      });
    },
    onSuccess: (data) => {
      toast.show({
        title: "Updated!",
        variant: "top-accent",
        description: `Customer updated.`,
      });
      apiUtils.customer.getAll.invalidate();
      props.onSuccess(data.id);
    },
  });

  const onSubmit = props.form.handleSubmit(async (data) => {
    Keyboard.dismiss();
    createCustomerMutation.mutate(data);
  });

  return (
    <KeyboardAvoidingView style={{ gap: 10 }}>
      <TextInput
        control={control}
        name="firstName"
        label="First name"
        placeholder="ex: John"
        enablesReturnKeyAutomatically
      />
      <TextInput
        control={control}
        name="lastName"
        label="Last name"
        placeholder="ex: Smith"
      />
      <TextInput
        control={control}
        name="email"
        label="Email address"
        placeholder="ex: john.smith@example.com"
        keyboardType="email-address"
        inputMode="email"
      />
      <View style={{ paddingTop: 10 }}>
        <Button onPress={onSubmit}>Create</Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const UpdateCustomerForm = (props: {
  form: UseFormReturn<InputUpdateCustomer>;
  onSuccess: (customerId: string) => void;
  customerId: string;
}) => {
  const toast = useToast();

  const control = props.form.control;

  const apiUtils = api.useContext();
  const updateCustomerMutation = api.customer.update.useMutation({
    onError: (err) => {
      const msg = err.message;
      toast.show({
        title: "Error!",
        variant: "top-accent",
        description: msg,
      });
    },
    onSuccess: (data) => {
      toast.show({
        title: "Updated!",
        variant: "top-accent",
        description: `Customer updated.`,
      });
      apiUtils.customer.getAll.invalidate();
      apiUtils.customer.getCustomer.invalidate({ id: data.id });
      props.onSuccess(data.id);
    },
  });

  const onSubmit = props.form.handleSubmit(async (data) => {
    Keyboard.dismiss();
    updateCustomerMutation.mutate(data);
  });

  return (
    <KeyboardAvoidingView style={{ gap: 10 }}>
      <TextInput
        control={control}
        name="firstName"
        label="First name"
        placeholder="ex: John"
        enablesReturnKeyAutomatically
      />
      <TextInput
        control={control}
        name="lastName"
        label="Last name"
        placeholder="ex: Smith"
      />
      <TextInput
        control={control}
        name="email"
        label="Email address"
        placeholder="ex: john.smith@example.com"
        keyboardType="email-address"
        inputMode="email"
      />
      <View style={{ paddingTop: 10 }}>
        <Button onPress={onSubmit}>Update</Button>
      </View>
    </KeyboardAvoidingView>
  );
};

export default CustomerEditScreen;
