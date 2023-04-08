import React from "react";
import { Platform, Text, View } from "react-native";
import NumericInput from "react-native-numeric-input";
import {
  Controller,
  type Control,
  type UseFormRegister,
} from "react-hook-form";

type NumberInputProps = {
  control: Control<any>;
  register: UseFormRegister<any>;
  name: string;
  label: string;
  decimal?: boolean;
  disabled?: boolean;
  minValue?: number;
  maxValue?: number;
  placeHolder?: string;
};

const MobileNumberInput = (props: NumberInputProps) => {
  const { control, name, label, decimal, disabled = false } = props;
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View style={{ width: "100%" }}>
          <Text style={{ paddingBottom: 6, fontSize: 15, fontWeight: "400" }}>
            {label}
          </Text>
          <NumericInput
            value={value}
            onChange={onChange}
            valueType={decimal ? "real" : "integer"}
            type="up-down"
            containerStyle={{ borderRadius: 5, width: "100%", maxHeight: 45 }}
            inputStyle={{
              borderRadius: 5,
              width: "100%",
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              textAlign: "left",
              paddingLeft: 10,
              fontSize: 12,
            }}
            editable={!disabled}
          />
          {error && <Text style={{ color: "red" }}>{error.message}</Text>}
        </View>
      )}
    />
  );
};

const WebNumberInput = (props: NumberInputProps) => {
  const {
    control,
    name,
    label,
    register,
    disabled = false,
    placeHolder,
  } = props;
  return (
    <Controller
      control={control}
      name={name}
      render={({ fieldState: { error } }) => (
        <View style={{ width: "100%" }}>
          <Text style={{ paddingBottom: 6, fontSize: 15, fontWeight: "400" }}>
            {label}
          </Text>
          <input
            type="number"
            {...register(name, { valueAsNumber: true })}
            disabled={disabled}
            style={{
              fontSize: 12,
              color: "rgb(23, 23, 23)",
              lineHeight: "1.5em",
              fontWeight: 400,
              paddingTop: "8px",
              paddingBottom: "9px",
              paddingLeft: "12px",
              paddingRight: "12px",
              width: "100%",
              appearance: "none",
              resize: "none",
              boxSizing: "border-box",
              borderColor: "rgb(212, 212, 212)",
              borderRadius: "4px",
              borderWidth: "1px",
              textDecoration: "none",
              fontStyle: "normal",
            }}
            step={0.01}
            placeholder={placeHolder}
          />
          {error && <Text style={{ color: "red" }}>{error.message}</Text>}
        </View>
      )}
    />
  );
};

const NumberInput = Platform.OS === "web" ? WebNumberInput : MobileNumberInput;

export default NumberInput;
