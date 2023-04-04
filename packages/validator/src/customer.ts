import { z } from "./zod-project";

export const CreateCustomerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
});
export type InputCreateCustomer = z.infer<typeof CreateCustomerSchema>;

export const UpdateCustomerSchema = CreateCustomerSchema.extend({
  id: z.string(),
});
export type InputUpdateCustomer = z.infer<typeof UpdateCustomerSchema>;
