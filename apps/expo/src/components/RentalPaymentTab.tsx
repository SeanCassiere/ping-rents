import React, { useMemo, useRef, useState } from "react";
import { AntDesign, FontAwesome5 } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import { Heading, Button as NativeBaseButton, Text, View } from "native-base";

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

  const summary = api.rental.getAgreementSummary.useQuery({ id: agreementId });
  useRefreshOnFocus(summary.refetch);
  const balanceDue: number | null =
    summary.status === "success" ? summary.data.balanceDue : null;
  const amountPaid: number | null =
    summary.status === "success" ? summary.data.amountPaid : null;

  const payments = api.rental.getAgreementPayments.useQuery({
    id: agreementId,
  });
  useRefreshOnFocus(payments.refetch);

  return (
    <View flex={1}>
      <View
        mt={2}
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
            <AntDesign name="plus" size={16} color="white" />
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
            <AntDesign name="minus" size={16} color="white" />
            <Text color="white" fontSize={16}>
              Refund
            </Text>
          </View>
        </Button>
      </View>
      <View flex={1} mt={2}>
        {payments.status === "success" && payments.data.length > 0 && (
          <FlashList
            data={payments.data}
            renderItem={({ item }) => <PaymentListItem payment={item} />}
            estimatedItemSize={200}
            onRefresh={payments.refetch}
            refreshing={payments.isLoading}
          />
        )}
        {payments.status === "success" && payments.data.length === 0 && (
          <View mt={4}>
            <EmptyState
              renderIcon={() => (
                <FontAwesome5 name="cash-register" size={38} color="black" />
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
          <View>
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
  return (
    <View
      my={1}
      py={2}
      px={2}
      borderStyle="solid"
      borderWidth={2}
      borderColor="gray.900"
      borderRadius={5}
      flexDirection="row"
      style={{ gap: 10 }}
      alignItems="center"
    >
      <View alignItems="center" justifyContent="center" px={2}>
        {payment.mode === "pay" ? (
          <AntDesign name="plus" size={14} color="black" />
        ) : (
          <AntDesign name="minus" size={14} color="black" />
        )}
      </View>
      <View flex={1}>
        {payment.mode === "pay" ? (
          <Text fontSize={18} color="green.600">
            ${payment.value.toFixed(2)}
          </Text>
        ) : (
          <Text fontSize={18} color="red.600">
            ${payment.value.toFixed(2)}
          </Text>
        )}
      </View>
      <View fontSize={16}>
        <Text>{DateFormatter.rentalListView(payment.createdAt)}</Text>
      </View>
    </View>
  );
};
