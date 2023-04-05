import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { Button, type IButtonProps } from "native-base";

interface MainHeaderProps {
  title: string;
  leftButton?: {
    onPress: () => void;
    content: React.ReactNode;
    buttonProps?: IButtonProps;
  };
  rightButton?: {
    onPress: () => void;
    content: React.ReactNode;
    buttonProps?: IButtonProps;
  };
}

const MainHeader = (props: MainHeaderProps) => {
  const { title, leftButton, rightButton } = props;
  return (
    <View>
      <View style={[headerStyles.container]}>
        <View style={[headerStyles.leftContainer]}>
          {leftButton && (
            <Button
              variant="ghost"
              padding={0}
              {...leftButton.buttonProps}
              onPress={leftButton.onPress}
            >
              {leftButton.content}
            </Button>
          )}
          <Text style={[headerStyles.titleText]}>{title}</Text>
        </View>
        {rightButton && (
          <Button
            variant="ghost"
            padding={0}
            {...rightButton.buttonProps}
            onPress={rightButton.onPress}
          >
            {rightButton.content}
          </Button>
        )}
      </View>
    </View>
  );
};

export default MainHeader;

const headerStyles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === "web" ? 18 : 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 10,
  },
  titleText: {
    fontSize: 30,
    fontWeight: "bold",
  },
});
