import { Box, Text } from "native-base";

import { type RouterOutputs } from "../utils/api";

type OutputAgreement = RouterOutputs["rental"]["getAgreements"][number];

export const RentalListStatusIndicator = ({
  status,
  large = false,
}: {
  status: OutputAgreement["status"];
  large?: boolean;
}) => {
  let statusText = "";
  switch (status) {
    case "open":
      statusText = "Open";
      break;
    case "closed":
      statusText = "Closed";
      break;
    case "on_rent":
      statusText = "On Rent";
      break;
    case "pending_payment":
      statusText = "Pending Payment";
      break;
    default:
      statusText = "Unknown";
      break;
  }

  return (
    <Box
      ml={2}
      px={4}
      py={0.5}
      borderRadius={20}
      bgColor={
        status === "open"
          ? "green.500"
          : status === "closed"
          ? "red.500"
          : status === "on_rent"
          ? "green.500"
          : status === "pending_payment"
          ? "orange.500"
          : "blue.500"
      }
    >
      <Text
        color={
          status === "open"
            ? "white"
            : status === "closed"
            ? "white"
            : status === "on_rent"
            ? "white"
            : status === "pending_payment"
            ? "white"
            : "white"
        }
        fontSize={large ? 18 : 12}
      >
        {statusText}
      </Text>
    </Box>
  );
};
