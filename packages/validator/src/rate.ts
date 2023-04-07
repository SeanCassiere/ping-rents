import { z } from "./zod-project";

export const RateSchema = z.object({
  dailyRate: z.number().min(0),
});

export const CreateRateNewSchema = RateSchema.extend({
  name: z.string().min(1),
  calculationType: z.enum(["retail"]),
  locationId: z.string().min(1),
  vehicleTypeId: z.string().min(1),
});
export type InputCreateNewRate = z.infer<typeof CreateRateNewSchema>;

export const UpdateRateSchema = CreateRateNewSchema.extend({
  id: z.string(),
}).omit({ vehicleTypeId: true, locationId: true });
export type InputUpdateRate = z.infer<typeof UpdateRateSchema>;
