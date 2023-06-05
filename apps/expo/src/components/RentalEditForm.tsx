import React, { useEffect } from "react";
import { Platform } from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { add } from "date-fns";
import { KeyboardAvoidingView, ScrollView, View } from "native-base";
import { useForm } from "react-hook-form";

import { type RouterOutputs } from "@acme/api";
import {
  CreateRentalSchema,
  UpdateRentalSchema,
  type InputCreateRental,
  type InputUpdateRental,
} from "@acme/validator";

import { api } from "../utils/api";
import Button from "./Button";
import DateTimeInput from "./DateTimeInput";
import NumberInput from "./NumberInput";
import RentalRatesSummary from "./RentalRatesSummary";
import SelectInput from "./SelectInput";

type AgreementOutput = RouterOutputs["rental"]["getAgreement"];

export type RentalEditFormProps = {
  referenceType: "agreement" | "reservation";
  referenceId: string | null;
  isEdit: boolean;
  preCreatedReservationId?: string;
  initialData?: AgreementOutput;
  onCreateSuccess: (options: { referenceId: string }) => void;
  locationId?: string;
  amountPaidInitial?: number;
};

const RentalEditForm = (props: RentalEditFormProps) => {
  const {
    initialData,
    preCreatedReservationId,
    isEdit,
    referenceId,
    referenceType,
    locationId,
    amountPaidInitial = 0,
    onCreateSuccess,
  } = props;

  const createAgreementMutation = api.rental.createAgreement.useMutation({
    onSuccess: (data) => {
      onCreateSuccess({ referenceId: data.id });
    },
  });
  const updateAgreementMutation = api.rental.updateAgreement.useMutation({
    onSuccess: (data) => {
      onCreateSuccess({ referenceId: data.id });
    },
  });

  const createReservationMutation = api.rental.createReservation.useMutation({
    onSuccess: (data) => {
      onCreateSuccess({ referenceId: data.id });
    },
  });
  const updateReservationMutation = api.rental.updateReservation.useMutation({
    onSuccess: (data) => {
      onCreateSuccess({ referenceId: data.id });
    },
  });

  const isSubmitting =
    createAgreementMutation.isLoading ||
    updateAgreementMutation.isLoading ||
    createReservationMutation.isLoading ||
    updateReservationMutation.isLoading;

  const customers = api.customer.getAll.useQuery();
  const vehicles = api.vehicle.getAll.useQuery({
    status: isEdit ? undefined : "available",
  });
  const taxes = api.tax.getAll.useQuery({ locationId });
  const taxesList =
    taxes.data?.map((tax) => ({
      id: tax.id,
      name: tax.name,
      calculationType: tax.calculationType,
      value: tax.value,
    })) ?? [];

  const taxesStringList = taxesList.map((tax) => tax.id) ?? [];

  const {
    control: create_control,
    watch: create_watch,
    setValue: create_setValue,
    handleSubmit: create_handleSubmit,
    register: create_register,
    formState: { errors: create_errors },
  } = useForm<InputCreateRental & { vehicleTypeId: string }>({
    resolver: zodResolver(CreateRentalSchema),
    defaultValues: {
      reservationId: preCreatedReservationId ?? null,
      rate: {
        id: initialData?.rate.id ?? "",
        dailyRate: initialData?.rate.dailyRate ?? 0,
      },
      checkoutLocationId: initialData?.checkoutLocationId ?? locationId,
      checkoutDate: initialData?.checkoutDate ?? new Date(),
      checkinLocationId: initialData?.checkinLocationId ?? locationId,
      checkinDate: initialData?.checkinDate ?? add(new Date(), { days: 1 }),
      returnLocationId: initialData?.returnLocationId ?? locationId,
      returnDate: initialData?.returnDate ?? add(new Date(), { days: 1 }),
      taxIdList: taxesStringList, // FIX: @SeanCassiere
      vehicleId: initialData?.vehicleId ?? "",
      customerId: initialData?.customerId ?? "",
      odometerOut: initialData?.odometerOut ?? 0,
      vehicleTypeId: "",
    },
  });

  const {
    control: edit_control,
    watch: edit_watch,
    setValue: edit_setValue,
    handleSubmit: edit_handleSubmit,
    register: edit_register,
  } = useForm<
    InputUpdateRental & {
      vehicleTypeId: string;
      rentalTaxesList: any[];
    }
  >({
    resolver: zodResolver(UpdateRentalSchema),
    defaultValues: {
      id: referenceId ?? "",
      checkoutDate: initialData?.checkoutDate ?? new Date(),
      checkinDate: initialData?.checkinDate ?? add(new Date(), { days: 1 }),
      returnDate: initialData?.returnDate ?? add(new Date(), { days: 1 }),
      rate: {
        dailyRate: initialData?.rate.dailyRate ?? 0,
      },
      vehicleId: initialData?.vehicleId ?? "",
      customerId: initialData?.customerId ?? "",
      odometerOut: initialData?.odometerOut ?? 0,
      vehicleTypeId: initialData?.vehicleTypeId ?? "",
      rentalTaxesList:
        initialData?.rentalTaxes.map((t) => ({
          id: t.id,
          calculationType: t.calculationType,
          name: t.name,
        })) ?? [],
    },
  });

  const create_rateId = create_watch("rate.id");

  const create_dailyRate = create_watch("rate.dailyRate");
  const edit_dailyRate = edit_watch("rate.dailyRate");
  const dailyRate = isEdit ? edit_dailyRate : create_dailyRate;

  const create_vehicleTypeId = create_watch("vehicleTypeId");
  const edit_vehicleTypeId = edit_watch("vehicleTypeId");
  const vehicleTypeId = isEdit ? edit_vehicleTypeId : create_vehicleTypeId;

  const create_vehicleId = create_watch("vehicleId");
  const edit_vehicleId = edit_watch("vehicleId");
  const vehicleId = isEdit ? edit_vehicleId : create_vehicleId;

  const create_checkoutDate = create_watch("checkoutDate");
  const edit_checkoutDate = edit_watch("checkoutDate");
  const checkoutDate = isEdit ? edit_checkoutDate : create_checkoutDate;

  const create_checkinDate = create_watch("checkinDate");
  const edit_checkinDate = edit_watch("checkinDate");
  const checkinDate = isEdit ? edit_checkinDate : create_checkinDate;

  const rates = api.rate.getAll.useQuery({
    locationId: initialData?.checkinLocationId ?? locationId ?? "",
  });

  const handleSubmit = isEdit
    ? edit_handleSubmit(async (data) => {
        if (referenceType === "agreement") {
          console.log("updating agreement", data);
          updateAgreementMutation.mutate(data);
        }
        if (referenceType === "reservation") {
          console.log("updating reservation", data);
        }
      })
    : create_handleSubmit(async (data) => {
        if (referenceType === "agreement") {
          createAgreementMutation.mutate(data);
        }
        if (referenceType === "reservation") {
          console.log("creating reservation", data);
        }
      });

  const summary = api.rental.calculate.useQuery({
    checkoutDate: checkoutDate,
    checkinDate: checkinDate,
    returnDate: checkinDate,
    isCheckIn: false,
    rate: {
      dailyRate: dailyRate,
      calculationType: "retail",
    },
    taxes: taxesList as any,
    amountPaid: amountPaidInitial,
  });

  useEffect(() => {
    create_setValue("returnDate", create_checkinDate);
  }, [create_checkinDate, create_setValue]);

  useEffect(() => {
    edit_setValue("returnDate", edit_checkinDate);
  }, [edit_checkinDate, edit_setValue]);

  useEffect(() => {
    console.log("errors", create_errors);
  }, [create_errors]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView h="full">
        <View flex={1} style={{ gap: 15 }} pb={4}>
          <DateTimeInput
            name="checkoutDate"
            control={isEdit ? edit_control : create_control}
            label="Checkout date & time"
          />
          <DateTimeInput
            name="checkinDate"
            control={isEdit ? edit_control : create_control}
            label="Checkin date & time"
          />
          {!isEdit && vehicles.status === "success" && (
            <SelectInput
              control={isEdit ? edit_control : create_control}
              name="vehicleId"
              label="Vehicle"
              placeholder="eg: Sedan"
              options={vehicles.data.map((type, idx) => ({
                key: `${type.id}_${idx}`,
                value: type.id,
                label: `${type.licensePlate} (${type.vehicleType.name}) - ${type.displayMake} ${type.displayModel} ${type.year}`,
              }))}
              onChangeCb={(selection) => {
                const vehicle = vehicles.data.find(
                  (i) => i.id === selection.value,
                );
                if (vehicle) {
                  create_setValue("vehicleTypeId", vehicle.vehicleTypeId);
                  create_setValue("odometerOut", vehicle.currentOdometer);
                  create_setValue("rate.id", "");
                  create_setValue("rate.dailyRate", 0);

                  edit_setValue("vehicleTypeId", vehicle.vehicleTypeId);
                  edit_setValue("rate.dailyRate", 0);
                }
              }}
            />
          )}
          {!isEdit && (
            <NumberInput
              control={isEdit ? edit_control : create_control}
              register={isEdit ? edit_register : create_register}
              name="odometerOut"
              label="Odometer out"
              minValue={0}
              decimal
              key={`${vehicleId}`}
              disabled={vehicleId === ""}
            />
          )}
          {rates.status === "success" && isEdit === false && (
            <SelectInput
              control={isEdit ? edit_control : create_control}
              name="rate.id"
              label="Selected rate"
              placeholder="eg: Rates"
              options={rates.data
                .filter((i) => i.vehicleTypeId === vehicleTypeId)
                .map((type, idx) => ({
                  key: `${type.id}_${idx}`,
                  value: type.id,
                  label: `${type.name}`,
                }))}
              onChangeCb={(selection) => {
                const rate = rates.data.find((i) => i.id === selection.value);
                if (rate) {
                  create_setValue("rate.dailyRate", rate.dailyRate);
                  edit_setValue("rate.dailyRate", rate.dailyRate);
                }
              }}
              selectProps={{
                isDisabled: vehicleTypeId === "",
              }}
            />
          )}
          {isEdit ? (
            <NumberInput
              control={edit_control}
              register={edit_register}
              name="rate.dailyRate"
              label="Daily rate"
              minValue={0}
              decimal
            />
          ) : (
            <NumberInput
              control={create_control}
              register={create_register}
              name="rate.dailyRate"
              label="Daily rate"
              minValue={0}
              decimal
              key={`dailyRate_${create_rateId}`}
              disabled={create_rateId === ""}
            />
          )}
          {customers.status === "success" && (
            <SelectInput
              control={isEdit ? edit_control : create_control}
              name="customerId"
              label="Renter"
              placeholder="eg: Customer"
              options={customers.data.map((type, idx) => ({
                key: `${type.id}_${idx}`,
                value: type.id,
                label: `${type.firstName} ${type.lastName}`,
              }))}
            />
          )}
          <RentalRatesSummary
            hideRateName
            rate={{
              name: "",
              dailyRate: dailyRate,
              calculationType: "retail",
              parentId: null,
            }}
            summary={
              summary.data ?? {
                baseRate: 0,
                promotionOnBase: 0,
                promotionOnSubtotal: 0,
                subtotal: 0,
                totalTax: 0,
                grandTotal: 0,
                amountPaid: 0,
                balanceDue: 0,
              }
            }
          />

          <Button
            onPress={handleSubmit}
            disabled={isSubmitting}
            isDisabled={isSubmitting}
            isLoading={isSubmitting}
          >
            Submit
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RentalEditForm;
