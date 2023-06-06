import React, { useMemo, useRef, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import {
  Heading,
  Button as NativeBaseButton,
  ScrollView,
  Text,
  View,
  useTheme,
} from "native-base";

import { useRefreshOnFocus } from "../hooks/useRefreshOnFocus";
import { api, type RouterOutputs } from "../utils/api";
import { DateFormatter } from "../utils/dates";
import Button from "./Button";
import EmptyState from "./EmptyState";

const RentalPaymentTab = ({ agreementId }: { agreementId: string }) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const [paymentType, setPaymentType] = useState<"pay" | "refund">("pay");
  const [isOpen, setOpen] = useState(false);

  const snapPoints = useMemo(() => ["50%"], []);

  const handlePresentPress = () => {
    if (bottomSheetModalRef.current) {
      bottomSheetModalRef.current?.present();
      setOpen(true);
    }
  };
  const handleDismissPress = () => {
    if (bottomSheetModalRef.current) {
      setPaymentType("pay");
      bottomSheetModalRef.current?.dismiss();
      setOpen(false);
    }
  };

  const theme = useTheme();
  const gray700 = theme.colors.gray[700];

  // get summary for agreement
  const agreementSummary = api.rental.getAgreementSummary.useQuery({
    id: agreementId,
  });
  useRefreshOnFocus(agreementSummary.refetch);

  const balanceDue: number | null =
    agreementSummary.status === "success"
      ? agreementSummary.data.balanceDue
      : null;
  const amountPaid: number | null =
    agreementSummary.status === "success"
      ? agreementSummary.data.amountPaid
      : null;

  // get payments for agreement
  const agreementPayments = api.rental.getAgreementPayments.useQuery({
    id: agreementId,
  });
  useRefreshOnFocus(agreementPayments.refetch);

  return (
    <View flex={1}>
      <View
        mt={4}
        bg="gray.100"
        p={4}
        borderRadius={5}
        flexDirection="row"
        justifyContent="space-between"
      >
        <View>
          <Text fontSize={32} fontWeight="medium">
            ${Number(balanceDue === null ? 0 : balanceDue).toFixed(2)}
          </Text>
          <Text>Balance due</Text>
        </View>
        <View alignItems="flex-end">
          <Text fontSize={32} fontWeight="medium">
            ${Number(amountPaid === null ? 0 : amountPaid).toFixed(2)}
          </Text>
          <Text>Amount paid</Text>
        </View>
      </View>
      <View
        mt={3}
        flexDirection="row"
        style={{ gap: 15 }}
        w="full"
        justifyContent="center"
      >
        <Button
          style={{ width: "48%" }}
          onPress={() => {
            setPaymentType("pay");
            handlePresentPress();
          }}
          size="sm"
          fontSize="sm"
          disabled={isOpen}
          isDisabled={isOpen}
        >
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row",
              gap: 5,
            }}
          >
            <MaterialCommunityIcons name="cash-plus" size={20} color="white" />
            <Text color="white" fontSize={16}>
              Payment
            </Text>
          </View>
        </Button>
        <Button
          style={{ width: "48%" }}
          onPress={() => {
            setPaymentType("refund");
            handlePresentPress();
          }}
          size="sm"
          fontSize="sm"
          disabled={isOpen}
          isDisabled={isOpen}
        >
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row",
              gap: 5,
            }}
          >
            <MaterialCommunityIcons name="cash-minus" size={20} color="white" />
            <Text color="white" fontSize={16}>
              Refund
            </Text>
          </View>
        </Button>
      </View>
      <View flex={1} mt={4}>
        {agreementPayments.status === "success" &&
          agreementPayments.data.length > 0 && (
            <FlashList
              data={agreementPayments.data || []}
              renderItem={({ item }) => <PaymentListItem payment={item} />}
              estimatedItemSize={200}
              onRefresh={agreementPayments.refetch}
              refreshing={agreementPayments.isLoading}
            />
          )}

        {agreementPayments.status === "success" &&
          agreementPayments.data.length === 0 && (
            <View mt={4}>
              <EmptyState
                renderIcon={() => (
                  <MaterialCommunityIcons
                    name="cash-register"
                    size={38}
                    color="black"
                  />
                )}
                title="No payments yet"
                description="No payments have been made  yet."
              />
            </View>
          )}
      </View>
      <BottomSheetModal
        snapPoints={snapPoints}
        ref={bottomSheetModalRef}
        enableHandlePanningGesture
        enablePanDownToClose
        handleComponent={null}
      >
        <View
          bgColor="gray.50"
          flex={1}
          borderTopColor="gray.200"
          borderTopWidth={1.5}
          px={4}
          justifyContent="space-between"
          pt={4}
          pb={4}
        >
          <View>
            <Heading mb={2}>
              {paymentType === "pay" ? "Add payment" : "Issue refund"}
            </Heading>
            <Heading size="md">
              Amount paid:{" "}
              <Text>
                ${Number(amountPaid === null ? 0 : amountPaid).toFixed(2)}
              </Text>
            </Heading>
            <Heading size="md">
              Balance due:{" "}
              <Text color={balanceDue ? "red.500" : undefined}>
                ${Number(balanceDue === null ? 0 : balanceDue).toFixed(2)}
              </Text>
            </Heading>
          </View>
          <View pb={2}>
            <Button onPress={handleDismissPress}>
              <Text color="white" fontSize={16}>
                {paymentType === "pay" ? "Add payment" : "Issue refund"}
              </Text>
            </Button>
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

type OutputPayment = RouterOutputs["rental"]["getAgreementPayments"][number];

const PaymentListItem = ({ payment }: { payment: OutputPayment }) => {
  const theme = useTheme();
  const gray700 = theme.colors.gray[700];

  return (
    <View
      my={1}
      py={2}
      px={2}
      borderStyle="solid"
      borderWidth={1.5}
      borderColor="gray.500"
      borderRadius={5}
      flexDirection="row"
      style={{ gap: 10 }}
    >
      <View alignItems="center" justifyContent="flex-start" px={2}>
        {payment.mode === "pay" ? (
          <MaterialCommunityIcons name="cash-plus" size={40} color={gray700} />
        ) : (
          <MaterialCommunityIcons name="cash-minus" size={40} color={gray700} />
        )}
      </View>
      <View flex={1}>
        <Text
          fontSize={24}
          fontWeight="medium"
          color={payment.mode === "refund" ? "red.500" : "gray.800"}
        >
          ${payment.value.toFixed(2)}
        </Text>
        <Text color="gray.600">
          {DateFormatter.rentalListView(payment.createdAt)}
        </Text>
      </View>
    </View>
  );
};
