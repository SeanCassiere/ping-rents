import { Text, View } from "react-native";
import { Select, type ISelectItemProps, type ISelectProps } from "native-base";
import { Controller, type Control } from "react-hook-form";

const SelectInput = (props: {
  control: Control<any>;
  name: string;
  label: string;
  placeholder?: string;
  options: { key: string; value: string; label: string }[];
  selectProps?: ISelectProps;
  selectItemProps?: ISelectItemProps;
}) => {
  const {
    control,
    name,
    label,
    options,
    selectProps = {},
    selectItemProps = {},
  } = props;

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
          <Select
            {...selectProps}
            selectedValue={value}
            onValueChange={(itemValue) => onChange(itemValue)}
            onClose={onBlur}
          >
            {options.map((option) => (
              <Select.Item
                {...selectItemProps}
                key={option.key}
                label={option.label}
                value={option.value}
              />
            ))}
          </Select>
          {error && <Text style={{ color: "red" }}>{error.message}</Text>}
        </View>
      )}
    />
  );
};

export default SelectInput;
