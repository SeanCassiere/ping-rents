import React from "react";
import {
  Platform,
  Pressable,
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
  };
  rightButton?: {
    onPress: () => void;
    content: React.ReactNode;
  };
  noTopPadding?: boolean;
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
          >
            {rightButton.content}
          </TouchableOpacity>
        )}
      </View>
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
    fontSize: 30,
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
