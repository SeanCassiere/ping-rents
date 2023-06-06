import React from "react";
import { Platform } from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyboardAvoidingView, ScrollView, View, useToast } from "native-base";
import { useForm } from "react-hook-form";

import { CheckInRentalSchema, type InputCheckInRental } from "@acme/validator";

import { useIsomorphicConfirm } from "../hooks/useIsomorphicConfirm";
import { api, type RouterOutputs } from "../utils/api";
import Button from "./Button";
import DateTimeInput from "./DateTimeInput";
import NumberInput from "./NumberInput";
import RentalRatesSummary from "./RentalRatesSummary";

type AgreementOutput = RouterOutputs["rental"]["getAgreement"];

export type RentalCheckInFormProps = {
  amountPaidSoFar: number;
  initialData: AgreementOutput;
  onCheckinSuccess: (options: {
    agreementId: string;
    vehicleId: string;
    customerId: string;
  }) => void;
};

const RentalCheckInForm = (props: RentalCheckInFormProps) => {
  const { initialData, amountPaidSoFar } = props;

  const confirm = useIsomorphicConfirm();
  const toast = useToast();

  const checkinMutation = api.rental.checkinAgreement.useMutation({
    onSuccess: (data) => {
      props.onCheckinSuccess({
        agreementId: data.id,
        vehicleId: data.vehicleId,
        customerId: data.customerId,
      });
    },
    onError: (err) => {
      toast.show({
        title: "Error!",
        variant: "top-accent",
        description: err.message,
      });
    },
  });

  const { control, register, watch, handleSubmit } =
    useForm<InputCheckInRental>({
      resolver: zodResolver(CheckInRentalSchema),
      defaultValues: {
        id: initialData.id,
        checkoutDate: initialData.checkoutDate,
        checkinDate: initialData.checkinDate,
        returnDate: new Date(),
        odometerOut: initialData.odometerOut,
        odometerIn: initialData.odometerOut,
      },
    });

  const returnDate = watch("returnDate");

  const summary = api.rental.calculate.useQuery(
    {
      checkoutDate: initialData.checkoutDate,
      checkinDate: initialData.checkinDate,
      returnDate: returnDate,

      rate: {
        dailyRate: initialData.rate.dailyRate,
        calculationType: "retail",
      },

      taxes: initialData.rentalTaxes.map((tax) => ({
        id: tax.id,
        name: tax.name,
        value: tax.value,
        calculationType: tax.calculationType,
      })),

      amountPaid: amountPaidSoFar,
      isCheckIn: true,
    },
    {
      onError: () => {},
    },
  );

  const onConfirm = handleSubmit(async (data) => {
    confirm("Are you sure?", "You can't undo this action", {
      onConfirm: () => {
        checkinMutation.mutate(data);
      },
    });
  });

  const isSubmitDisabled = checkinMutation.isLoading;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView h="full">
        <View flex={1} style={{ gap: 15 }} pb={4}>
          <DateTimeInput
            control={control}
            label="Return date"
            name="returnDate"
          />
          <NumberInput
            control={control}
            register={register}
            name="odometerIn"
            label="Odometer In"
          />
          <RentalRatesSummary
            summary={summary?.data ?? null}
            rate={initialData.rate}
            checkoutDate={initialData.checkoutDate}
            checkinDate={returnDate}
          />
          <Button
            disabled={isSubmitDisabled}
            isDisabled={isSubmitDisabled}
            isLoading={checkinMutation.isLoading}
            onPress={onConfirm}
          >
            CheckIn
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RentalCheckInForm;
