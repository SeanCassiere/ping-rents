import { z } from "./zod-project";

export const CreateRentalPaymentSchema = z.object({
  rentalId: z.string().min(1),
  mode: z.enum(["pay", "refund"]),
  value: z.number().min(0.01, "Must be at least 0.01"),
});
export type InputCreateRentalPayment = z.infer<
  typeof CreateRentalPaymentSchema
>;
