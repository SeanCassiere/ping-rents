import { format } from "@acme/date-fns";

export const DateFormatter = {
  rentalListView: (date: Date) => {
    return format(date, "dd/MM/yyyy HH:mm a");
  },
};
