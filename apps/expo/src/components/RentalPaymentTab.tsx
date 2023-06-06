import React, { useMemo, useRef } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Heading, Button as NativeBaseButton, View } from "native-base";

import Button from "./Button";

const RentalPaymentTab = () => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["40%"], []);
  const handlePresentPress = () => bottomSheetModalRef.current?.present();
  const handleDismissPress = () => bottomSheetModalRef.current?.dismiss();
  const insets = useSafeAreaInsets();

  return (
    <View flex={1}>
      <Button onPress={handlePresentPress}>Open bottom sheet</Button>
      <BottomSheetModal
        snapPoints={snapPoints}
        ref={bottomSheetModalRef}
        enableHandlePanningGesture
        enablePanDownToClose
        handleComponent={null}
      >
        <View
          bgColor="gray.100"
          flex={1}
          borderTopColor="gray.200"
          borderTopWidth={1.5}
          px={4}
          justifyContent="space-between"
          pb={4}
          pt={4}
        >
          <View>
            <Heading>Add payment</Heading>
          </View>
          <View>
            <Button onPress={handleDismissPress}>Add payment</Button>
            <NativeBaseButton
              variant="link"
              _text={{ color: "red.500" }}
              onPress={handleDismissPress}
              size="lg"
            >
              Cancel
            </NativeBaseButton>
          </View>
        </View>
      </BottomSheetModal>
    </View>
  );
};

export default RentalPaymentTab;
