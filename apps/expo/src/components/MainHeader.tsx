import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

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
}

const MainHeader = (props: MainHeaderProps) => {
  const { title, leftButton, rightButton } = props;
  return (
    <View>
      <View style={[headerStyles.container]}>
        <View style={[headerStyles.leftContainer]}>
          {leftButton && (
            <Pressable
              onPress={leftButton.onPress}
              style={[headerStyles.btn, headerStyles.leftBtn]}
            >
              {leftButton.content}
            </Pressable>
          )}
          <Text style={[headerStyles.titleText]}>{title}</Text>
        </View>
        {rightButton && (
          <Pressable
            onPress={rightButton.onPress}
            style={[headerStyles.btn, headerStyles.rightBtn]}
          >
            {rightButton.content}
          </Pressable>
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
