import React, { type ReactNode } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface MainHeaderProps {
  title: string;
  leftButton?: {
    onPress: () => void;
    content: React.ReactNode;
    disabled?: boolean;
  };
  rightButton?: {
    onPress: () => void;
    content: React.ReactNode;
    disabled?: boolean;
  };
  noTopPadding?: boolean;
  contentBelow?: ReactNode;
}

const MainHeader = (props: MainHeaderProps) => {
  const { title, leftButton, rightButton, noTopPadding = false } = props;
  return (
    <View>
      <View
        style={[
          headerStyles.titleContainer,
          noTopPadding ? { paddingTop: 0 } : {},
        ]}
      >
        <View style={[headerStyles.leftContainer]}>
          {leftButton && (
            <TouchableOpacity
              onPress={leftButton.onPress}
              style={[headerStyles.btn, headerStyles.leftBtn]}
              disabled={leftButton.disabled}
            >
              {leftButton.content}
            </TouchableOpacity>
          )}
          <Text style={[headerStyles.titleText]}>{title}</Text>
        </View>
        {rightButton && (
          <TouchableOpacity
            onPress={rightButton.onPress}
            style={[headerStyles.btn, headerStyles.rightBtn]}
            disabled={rightButton.disabled}
          >
            {rightButton.content}
          </TouchableOpacity>
        )}
      </View>
      {props.contentBelow && <>{props.contentBelow}</>}
    </View>
  );
};

export default MainHeader;

const headerStyles = StyleSheet.create({
  titleContainer: {
    paddingTop: Platform.OS === "web" ? 18 : 15,
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
    fontSize: 26,
    fontWeight: "bold",
  },
  leftBtn: {
    paddingRight: 2,
  },
  rightBtn: {
    paddingLeft: 2,
  },
  btn: {
    paddingVertical: 4,
  },
});
