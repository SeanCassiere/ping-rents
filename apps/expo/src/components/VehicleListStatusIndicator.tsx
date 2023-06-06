import { Box, Text } from "native-base";

import { type RouterOutputs } from "../utils/api";

type OutputVehicle = RouterOutputs["vehicle"]["getAll"][number];

export const VehicleListStatusIndicator = ({
  status,
  large = false,
}: {
  status: OutputVehicle["status"];
  large?: boolean;
}) => {
  let statusText = "";
  switch (status) {
    case "available":
      statusText = "Available";
      break;
    case "on_rental":
      statusText = "On Rent";
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
      bgColor={status === "available" ? "green.500" : "red.500"}
    >
      <Text color="white" fontSize={large ? 18 : 12}>
        {statusText}
      </Text>
    </Box>
  );
};
