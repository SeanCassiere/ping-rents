import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { styles } from "../../../utils/styles";

const VehiclesListScreen = () => {
  return (
    <SafeAreaView style={[styles.safeArea]}>
      <StatusBar />
      <View style={[styles.pageContainer]}>
        <Text>Hello World</Text>
      </View>
    </SafeAreaView>
  );
};

export default VehiclesListScreen;
