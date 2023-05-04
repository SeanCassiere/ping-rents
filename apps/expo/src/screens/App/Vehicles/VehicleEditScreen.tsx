import React, { useEffect } from "react";
import { Keyboard, KeyboardAvoidingView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AntDesign } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { type NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScrollView, useToast } from "native-base";
import { useForm, type UseFormReturn } from "react-hook-form";

import {
  CreateVehicleSchema,
  UpdateVehicleSchema,
  type InputCreateVehicle,
  type InputUpdateVehicle,
} from "@acme/validator/src/vehicle";

import Button from "../../../components/Button";
import MainHeader from "../../../components/MainHeader";
import NumberInput from "../../../components/NumberInput";
import SelectInput from "../../../components/SelectInput";
import TextInput from "../../../components/TextInput";
import { type GlobalRoutingType } from "../../../navigation/types";
import { api, type RouterOutputs } from "../../../utils/api";
import { styles } from "../../../utils/styles";

type Props = NativeStackScreenProps<
  GlobalRoutingType["VehiclesStackNavigator"],
  "VehicleEditScreen"
>;

type VehicleTypeData = RouterOutputs["vehicleType"]["getAll"];
type VehicleMakeData = RouterOutputs["vehicle"]["getMakes"];

const VehicleEditScreen = (props: Props) => {
  const vehicleId = props.route.params.vehicleId;
  const currentLocationId = props.route.params.currentLocationId;
  const isEdit = vehicleId !== "";

  const backNavigation = () => {
    props.navigation.canGoBack()
      ? props.navigation.goBack()
      : props.navigation.navigate("RootVehiclesList");
  };

  const onSuccess = () => {
    if (isEdit) {
      props.navigation.navigate("VehicleViewScreen", { vehicleId });
    } else {
      props.navigation.goBack();
    }
  };

  const updateForm = useForm<InputUpdateVehicle>({
    resolver: zodResolver(UpdateVehicleSchema),
    defaultValues: {
      id: vehicleId,
      vin: "",
      licensePlate: "",
      year: new Date().getFullYear().toString(),
      make: "",
      model: "",
      color: "",
      typeId: "",
      currentLocationId: "",
      currentOdometer: 0,
    },
  });

  const vehicleTypes = api.vehicleType.getAll.useQuery();

  const makesQuery = api.vehicle.getMakes.useQuery();
  const vehicleQuery = api.vehicle.getVehicle.useQuery(
    { id: vehicleId },
    { enabled: isEdit },
  );

  useEffect(() => {
    if (!isEdit) return;
    if (vehicleQuery.status !== "success") return;

    const setValue = updateForm.setValue;
    const vehicle = vehicleQuery.data;

    setValue("id", vehicle.id);
    setValue("vin", vehicle.vin);
    setValue("licensePlate", vehicle.licensePlate);
    setValue("year", vehicle.year);
    setValue("make", vehicle.make);
    setValue("model", vehicle.model);
    setValue("color", vehicle.color);
    setValue("typeId", vehicle.vehicleTypeId);
    setValue("currentLocationId", vehicle.currentLocationId);
    setValue("currentOdometer", vehicle.currentOdometer);
  }, [isEdit, updateForm.setValue, vehicleQuery.data, vehicleQuery.status]);

  return (
    <SafeAreaView style={[styles.safeArea]}>
      <StatusBar />
      <View style={[styles.pageContainer]}>
        <MainHeader
          title={isEdit ? "Edit vehicle" : "Add vehicle"}
          leftButton={{
            onPress: backNavigation,
            content: <AntDesign name="left" size={24} color="black" />,
          }}
        />
        <View style={{ flex: 1, paddingTop: 30 }}>
          {!isEdit &&
            vehicleTypes.status === "success" &&
            makesQuery.status === "success" && (
              <CreateForm
                onSuccess={onSuccess}
                vehicleTypes={vehicleTypes.data || []}
                makes={makesQuery.data || []}
                locationId={currentLocationId}
              />
            )}
          {isEdit &&
            vehicleQuery.status === "success" &&
            vehicleTypes.status === "success" &&
            makesQuery.status === "success" && (
              <UpdateForm
                form={updateForm}
                onSuccess={onSuccess}
                vehicleTypes={vehicleTypes.data || []}
                makes={makesQuery.data || []}
              />
            )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const CreateForm = (props: {
  onSuccess: () => void;
  vehicleTypes: VehicleTypeData;
  makes: VehicleMakeData;
  locationId: string;
}) => {
  const toast = useToast();
  const apiUtils = api.useContext();

  const makes = props.makes;
  const vehicleTypes = props.vehicleTypes;

  const form = useForm<InputCreateVehicle>({
    resolver: zodResolver(CreateVehicleSchema),
    defaultValues: {
      vin: "",
      licensePlate: "",
      year: (new Date().getFullYear() - 1).toString(),
      make: "",
      model: "",
      color: "",
      typeId: "",
      currentLocationId: props.locationId,
      currentOdometer: 0,
    },
  });
  const { control, watch, setValue, register } = form;

  const makeId = watch("make");
  const isModelsDisabled = makeId === "";

  const models = api.vehicle.getModels.useQuery({ make: makeId });

  const createVehicleMutation = api.vehicle.create.useMutation({
    onError: (err) => {
      const msg = err.message;
      toast.show({
        title: "Error!",
        variant: "top-accent",
        description: msg,
      });
    },
    onSettled: (data) => {
      toast.show({
        title: "Created!",
        variant: "top-accent",
        description: `Vehicle created.`,
      });

      apiUtils.vehicle.getAll.invalidate();

      props.onSuccess();
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    Keyboard.dismiss();
    createVehicleMutation.mutate(data);
  });

  const isDisabled = createVehicleMutation.isLoading;

  return (
    <KeyboardAvoidingView>
      <ScrollView h="full">
        <View>
          <TextInput
            control={control}
            name="licensePlate"
            label="License no."
            placeholder="ex: DSH-987N"
            enablesReturnKeyAutomatically
            isDisabled={isDisabled}
          />
        </View>

        <View style={{ paddingTop: 10 }}>
          <TextInput
            control={control}
            name="vin"
            label="VIN no."
            placeholder="ex: 1234567890"
            enablesReturnKeyAutomatically
            isDisabled={isDisabled}
          />
        </View>

        <View style={{ paddingTop: 10 }}>
          <SelectInput
            control={control}
            name="typeId"
            label="Vehicle category"
            placeholder="eg: Sedan"
            options={vehicleTypes.map((type, idx) => ({
              key: `${type.id}_${idx}`,
              value: type.id,
              label: type.name,
            }))}
            selectProps={{
              isDisabled,
            }}
          />
        </View>

        <View style={{ paddingTop: 10 }}>
          <SelectInput
            control={control}
            name="make"
            label="Make"
            placeholder="eg: Nissan"
            options={makes.map((make, idx) => ({
              key: `${make.id}_${idx}`,
              value: make.id,
              label: make.displayMake,
            }))}
            onChangeCb={() => {
              setValue("model", "");
            }}
            selectProps={{
              isDisabled,
            }}
          />
        </View>

        <View style={{ paddingTop: 10 }}>
          <SelectInput
            control={control}
            name="model"
            label="Model"
            placeholder="eg: VERSA"
            options={(models.data || []).map((model, idx) => ({
              key: `${model.id}_${idx}`,
              value: model.id,
              label: model.displayModel,
            }))}
            selectProps={{
              isDisabled: isModelsDisabled || isDisabled,
            }}
          />
        </View>

        <View style={{ paddingTop: 10 }}>
          <TextInput
            control={control}
            name="year"
            label="Year"
            placeholder="ex: 2009"
            inputMode="numeric"
            keyboardType="number-pad"
            enablesReturnKeyAutomatically
            isDisabled={isDisabled}
          />
        </View>

        <View style={{ paddingTop: 10 }}>
          <NumberInput
            control={control}
            register={register}
            name="currentOdometer"
            label="Odometer"
            disabled={isDisabled}
          />
        </View>

        <View style={{ paddingTop: 10 }}>
          <TextInput
            control={control}
            name="color"
            label="Color"
            placeholder="ex: Navy Blue"
            enablesReturnKeyAutomatically
            isDisabled={isDisabled}
          />
        </View>

        <View style={{ paddingTop: 20, paddingBottom: 30 }}>
          <Button onPress={onSubmit} isDisabled={isDisabled}>
            Create
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const UpdateForm = (props: {
  form: UseFormReturn<InputUpdateVehicle>;
  onSuccess: () => void;
  vehicleTypes: VehicleTypeData;
  makes: VehicleMakeData;
}) => {
  const makes = props.makes;
  const vehicleTypes = props.vehicleTypes;
  const form = props.form;
  const { control, watch, setValue } = form;

  const toast = useToast();
  const apiUtils = api.useContext();

  const makeId = watch("make");
  const isModelsDisabled = makeId === "";

  const models = api.vehicle.getModels.useQuery({ make: makeId });

  const updateVehicleMutation = api.vehicle.update.useMutation({
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
        description: `Vehicle updated.`,
      });

      apiUtils.vehicle.getAll.invalidate();
      apiUtils.vehicle.getVehicle.invalidate({ id: data.id });

      props.onSuccess();
    },
  });

  const isDisabled = updateVehicleMutation.isLoading;

  const onSubmit = form.handleSubmit((data) => {
    Keyboard.dismiss();
    updateVehicleMutation.mutate(data);
  });

  return (
    <KeyboardAvoidingView>
      <ScrollView h="full">
        <View>
          <TextInput
            control={control}
            name="licensePlate"
            label="License no."
            placeholder="ex: DSH-987N"
            enablesReturnKeyAutomatically
            isDisabled={isDisabled}
          />
        </View>

        <View style={{ paddingTop: 10 }}>
          <TextInput
            control={control}
            name="vin"
            label="VIN no."
            placeholder="ex: 1234567890"
            enablesReturnKeyAutomatically
            isDisabled={isDisabled}
          />
        </View>

        <View style={{ paddingTop: 10 }}>
          <SelectInput
            control={control}
            name="typeId"
            label="Vehicle category"
            placeholder="eg: Sedan"
            options={vehicleTypes.map((type, idx) => ({
              key: `${type.id}_${idx}`,
              value: type.id,
              label: type.name,
            }))}
            selectProps={{
              isDisabled,
            }}
          />
        </View>

        <View style={{ paddingTop: 10 }}>
          <SelectInput
            control={control}
            name="make"
            label="Make"
            placeholder="eg: Nissan"
            options={makes.map((make, idx) => ({
              key: `${make.id}_${idx}`,
              value: make.id,
              label: make.displayMake,
            }))}
            onChangeCb={() => {
              setValue("model", "");
            }}
            selectProps={{
              isDisabled,
            }}
          />
        </View>

        <View style={{ paddingTop: 10 }}>
          <SelectInput
            control={control}
            name="model"
            label="Model"
            placeholder="eg: VERSA"
            options={(models.data || []).map((model, idx) => ({
              key: `${model.id}_${idx}`,
              value: model.id,
              label: model.displayModel,
            }))}
            selectProps={{
              isDisabled: isModelsDisabled || isDisabled,
            }}
          />
        </View>

        <View style={{ paddingTop: 10 }}>
          <TextInput
            control={control}
            name="year"
            label="Year"
            placeholder="ex: 2009"
            inputMode="numeric"
            keyboardType="number-pad"
            enablesReturnKeyAutomatically
            isDisabled={isDisabled}
          />
        </View>

        <View style={{ paddingTop: 10 }}>
          <TextInput
            control={control}
            name="color"
            label="Color"
            placeholder="ex: Navy Blue"
            enablesReturnKeyAutomatically
            isDisabled={isDisabled}
          />
        </View>

        <View style={{ paddingTop: 20, paddingBottom: 30 }}>
          <Button onPress={onSubmit} isDisabled={isDisabled}>
            Update
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default VehicleEditScreen;
