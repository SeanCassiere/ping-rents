import React from "react";
import { Button, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useCustomNavigation } from "../utils/useNavigation";

const RegisterView = () => {
  const navigation = useCustomNavigation();

  return (
    <SafeAreaView>
      <View
        style={{
          marginTop: 25,
          paddingHorizontal: 10,
          height: "100%",
          width: "100%",
          gap: 10,
        }}
      >
        <Text>Registration View</Text>
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
