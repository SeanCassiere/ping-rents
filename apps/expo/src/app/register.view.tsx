import React from "react";
import { Button, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useCustomNavigation } from "../utils/useNavigation";

const RegisterView = () => {
  const navigation = useCustomNavigation();

  return (
    <SafeAreaView className="bg-slate-50">
      <View className="mt-4 h-full w-full px-4">
        <Text className="text-red-500">Registration View</Text>
        <Button
          title="Register"
          onPress={() => {
            alert("Registration begun");
          }}
        />
        <Button
          title="Login"
          onPress={() => {
            navigation.navigate("login");
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default RegisterView;
