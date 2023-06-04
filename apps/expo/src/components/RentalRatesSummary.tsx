import React from "react";
import { ScrollView, Text, View } from "native-base";

import { type RouterOutputs } from "@acme/api";

import { DateFormatter } from "../utils/dates";

type RentalRate = Omit<RouterOutputs["rental"]["getAgreement"]["rate"], "id">;
type RentalSummary = RouterOutputs["rental"]["getAgreementSummary"];

type Props = {
  rate: RentalRate;
  summary: RentalSummary;
  checkoutDate: Date;
  checkinDate: Date;
};

const RentalRatesSummary = ({
  rate,
  summary,
  checkoutDate,
  checkinDate,
}: Props) => {
  return (
    <ScrollView width="100%" mt={5} ml={0} mr={-0.5}>
      <View flexDirection="row" style={{ gap: 6 }}>
        <Text fontSize={18} fontWeight="bold">
          Rate name:
        </Text>
        <Text fontSize={18}>{rate.name}</Text>
      </View>
      <View flexDirection="row" style={{ gap: 6 }}>
        <Text fontSize={18} fontWeight="bold">
          Daily rate:
        </Text>
        <Text fontSize={18}>$ {rate.dailyRate.toFixed(2)}</Text>
      </View>
      <View flexDirection="row" mt={2} style={{ gap: 6 }}>
        <Text fontSize={18} fontWeight="bold">
          Checkout:
        </Text>
        <Text fontSize={18}>{DateFormatter.rentalListView(checkoutDate)}</Text>
      </View>
      <View flexDirection="row" style={{ gap: 6 }}>
        <Text fontSize={18} fontWeight="bold">
          Checkin:
        </Text>
        <Text fontSize={18}>{DateFormatter.rentalListView(checkinDate)}</Text>
      </View>
      <View rounded="xs" mt={4} py={4} bgColor="gray.100" style={{ gap: 10 }}>
        <TableRow label="Base rate" value={summary.baseRate} />
        <TableRow label="Subtotal" value={summary.subtotal} />
        <TableRow label="Total tax" value={summary.totalTax} />
        <TableRow
          label="Grand total"
          value={summary.grandTotal}
          large
          highlight
        />
        <TableRow label="Amount paid" value={summary.amountPaid} />
        <TableRow
          label="Balance due"
          value={summary.balanceDue}
          bold
          large
          red={Boolean(summary.balanceDue)}
        />
      </View>
    </ScrollView>
  );
};

const TableRow = ({
  value,
  label,
  bold = false,
  large = false,
  highlight = false,
  red = false,
}: {
  value: number;
  label: string;
  bold?: boolean;
  large?: boolean;
  red?: boolean;
  highlight?: boolean;
}) => {
  return (
    <View
      justifyContent="space-between"
      flexDirection="row"
      alignItems="center"
      px={4}
      py={2.5}
      bgColor={highlight ? "black" : undefined}
    >
      <Text
        fontSize={large ? 18 : 16}
        bold={bold}
        color={highlight ? "white" : "gray.900"}
      >
        {label}
      </Text>
      <Text
        fontSize={large ? 18 : 16}
        bold={bold}
        color={red ? "red.600" : highlight ? "white" : "gray.900"}
      >
        $ {value.toFixed(2)}
      </Text>
    </View>
  );
};

export default RentalRatesSummary;
