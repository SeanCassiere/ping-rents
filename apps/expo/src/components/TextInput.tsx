import { Text, View } from "react-native";
import { Input, type IInputProps } from "native-base";
import { Controller, type Control } from "react-hook-form";

const TextInput = (
  props: {
    control: Control<any>;
    name: string;
    label: string;
  } & IInputProps,
) => {
  const { control, name, label, ...inputProps } = props;

  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <View>
          <Text style={{ paddingBottom: 6, fontSize: 15, fontWeight: "400" }}>
            {label}
          </Text>
          <Input
            {...inputProps}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            size="md"
          />
          {error && <Text style={{ color: "red" }}>{error.message}</Text>}
        </View>
      )}
    />
  );
};

export default TextInput;
