import { z } from "./zod-project";

const calculationType = z.enum(["percentage"]).default("percentage");

export const CreateNewTaxSchema = z.object({
  name: z.string().min(1),
  value: z.number().min(0).default(0),
  locationId: z.string().min(1),
  calculationType,
});
export type InputCreateNewTax = z.infer<typeof CreateNewTaxSchema>;

export const UpdateTaxSchema = CreateNewTaxSchema.extend({
  id: z.string().min(1),
}).omit({ locationId: true });
export type InputUpdateTax = z.infer<typeof UpdateTaxSchema>;

export const GetTaxesSchema = z.object({
  locationId: z.string().optional(),
});
export type InputGetTaxes = z.infer<typeof GetTaxesSchema>;
