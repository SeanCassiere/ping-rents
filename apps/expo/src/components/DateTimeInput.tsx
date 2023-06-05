import { useState } from "react";
import { Text, View } from "react-native";
import DateTimePickerModal, {
  type ReactNativeModalDateTimePickerProps,
} from "react-native-modal-datetime-picker";
import { Button, type IButtonProps } from "native-base";
import { Controller, type Control } from "react-hook-form";

import { DateFormatter } from "../utils/dates";

const DateTimeInput = (props: {
  control: Control<any>;
  name: string;
  label: string;
  dateTimePickerProps?: ReactNativeModalDateTimePickerProps;
  buttonProps?: IButtonProps;
}) => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const { control, name, label, buttonProps, dateTimePickerProps } = props;

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
          <Button
            {...buttonProps}
            variant="outline"
            size="md"
            justifyContent="flex-start"
            _text={{
              ...buttonProps?._text,
              color: "black",
            }}
            onPress={() => {
              setDatePickerVisibility(true);
            }}
          >
            {value instanceof Date
              ? DateFormatter.dateTimePickerView(value)
              : "no-value-yet"}
          </Button>
          {error && <Text style={{ color: "red" }}>{error.message}</Text>}
          <DateTimePickerModal
            {...dateTimePickerProps}
            isVisible={isDatePickerVisible}
            mode="datetime"
            date={value instanceof Date ? value : undefined}
            onConfirm={(date) => {
              setDatePickerVisibility(false);
              onChange({ target: { value: date, name } });
            }}
            onCancel={() => {
              setDatePickerVisibility(false);
            }}
          />
        </View>
      )}
    />
  );
};

export default DateTimeInput;
