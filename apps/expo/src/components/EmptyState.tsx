import React from "react";
import { StyleSheet, Text, View } from "react-native";

// import { Button } from "native-base";
import Button from "./Button";

const EmptyState = (props: {
  renderIcon?: () => React.ReactNode;
  title: string;
  description: string;
  buttonProps?: {
    text: string;
    onPress: () => void;
  };
}) => {
  return (
    <View style={stateStyles.wrapper}>
      {props.renderIcon && <View>{props.renderIcon()}</View>}
      <Text style={stateStyles.title}>{props.title}</Text>
      <Text style={stateStyles.description}>{props.description}</Text>
      {props.buttonProps && (
        <View style={stateStyles.btnContainer}>
          <Button onPress={props.buttonProps.onPress}>
            {props.buttonProps.text}
          </Button>
        </View>
      )}
    </View>
  );
};

export default EmptyState;

const stateStyles = StyleSheet.create({
  wrapper: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#919191",
    borderStyle: "dashed",
    paddingVertical: 45,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
  },
  description: {
    marginTop: 6,
    fontSize: 14,
  },
  btnContainer: {
    marginTop: 20,
  },
});
