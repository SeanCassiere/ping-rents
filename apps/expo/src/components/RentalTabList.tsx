import React from "react";
import { TouchableOpacity } from "react-native";
import { Box, ScrollView, Text, View } from "native-base";

type Props = {
  tabs: { displayText: string; key: string; onPress: () => void }[];
  activeKey: string;
};
const RentalTabList = (props: Props) => {
  return (
    <View alignItems="center">
      <ScrollView
        width="100%"
        bgColor="gray.100"
        maxHeight="16"
        flex={0}
        horizontal
        p={2}
      >
        {props.tabs.map((tab) => {
          const isActive = props.activeKey === tab.key;
          return (
            <TouchableOpacity key={`tab_${tab.key}`} onPress={tab.onPress}>
              <Box
                px={5}
                py={4}
                bgColor={isActive ? "black" : undefined}
                h="full"
                rounded="sm"
              >
                <Text
                  color={isActive ? "white" : undefined}
                  fontSize={16}
                  lineHeight={16}
                >
                  {tab.displayText}
                </Text>
              </Box>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};
export default RentalTabList;
