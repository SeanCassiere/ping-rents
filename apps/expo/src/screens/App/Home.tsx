import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { type DrawerScreenProps } from "@react-navigation/drawer";
import { Button } from "native-base";

import { useAuthContext } from "../../context/auth.context";
import { type GlobalRoutingType } from "../../navigation/types";
import { styles } from "../../utils/styles";

type Props = DrawerScreenProps<GlobalRoutingType["AppDrawer"], "Home">;

const HomeScreen = (props: Props) => {
  const { logout } = useAuthContext();
  return (
    <SafeAreaView style={[styles.safeArea]}>
      <View>
        <View>
          <Text>Home</Text>
        </View>
        <View>
          <Button
            onPress={() => {
              props.navigation.toggleDrawer();
            }}
          >
            Drawer
          </Button>
        </View>
        <View>
          <Button onPress={logout}>Logout</Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
