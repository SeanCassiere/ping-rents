import React from "react";
import { Text, View } from "react-native";
import NumericInput, {
  type INumericInputProps,
} from "react-native-numeric-input";
import { Controller, type Control } from "react-hook-form";

const NumberInput = (
  props: {
    control: Control<any>;
    name: string;
    label: string;
    decimal?: boolean;
    disabled?: boolean;
  } & Omit<
    INumericInputProps,
    | "value"
    | "onChange"
    | "valueType"
    | "type"
    | "containerStyle"
    | "inputStyle"
    | "editable"
  >,
) => {
  const {
    control,
    name,
    label,
    decimal,
    disabled = false,
    ...inputProps
  } = props;
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
            {...inputProps}
          />
          {error && <Text style={{ color: "red" }}>{error.message}</Text>}
        </View>
      )}
    />
  );
};

export default NumberInput;
