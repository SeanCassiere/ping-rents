import { Text, View } from "react-native";
import { TextArea, type ITextAreaProps } from "native-base";
import { Controller, type Control } from "react-hook-form";

const TextAreaInput = (props: {
  control: Control<any>;
  name: string;
  label: string;
  textAreaProps?: ITextAreaProps;
}) => {
  const { control, name, label, textAreaProps } = props;

  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error, isDirty },
      }) => (
        <View>
          <Text style={{ paddingBottom: 6, fontSize: 15, fontWeight: "400" }}>
            {label}
          </Text>
          <TextArea
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            numberOfLines={6}
            totalLines={6}
            autoCompleteType="off"
            size="md"
            isInvalid={!!error}
            {...textAreaProps}
          />
          {error && <Text style={{ color: "red" }}>{error.message}</Text>}
        </View>
      )}
    />
  );
};

export default TextAreaInput;
