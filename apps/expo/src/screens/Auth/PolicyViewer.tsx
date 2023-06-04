import React from "react";
import { StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { AntDesign } from "@expo/vector-icons";
import { type NativeStackScreenProps } from "@react-navigation/native-stack";

import MainHeader from "../../components/MainHeader";
import { type GlobalRoutingType } from "../../navigation/types";
import { styles } from "../../utils/styles";

type Props = NativeStackScreenProps<
  GlobalRoutingType["AuthStackNavigator"],
  "PolicyWebView"
>;

const PolicyViewerScreen = (props: Props) => {
  const { navigation } = props;
  const { title = "", url = "" } = props.route.params;

  return (
    <SafeAreaView style={[styles.safeArea]}>
      <StatusBar />
      <View
        style={[
          styles.pageContainer,
          {
            paddingBottom: 20,
            gap: 10,
            justifyContent: "space-between",
          },
        ]}
      >
        <MainHeader
          title={title}
          leftButton={{
            onPress: () =>
              navigation.canGoBack()
                ? navigation.goBack()
                : navigation.navigate("Register"),
            content: <AntDesign name="left" size={24} color="black" />,
          }}
        />
        <WebView style={{ flex: 1 }} source={{ uri: url }} />
      </View>
    </SafeAreaView>
  );
};

export default PolicyViewerScreen;
