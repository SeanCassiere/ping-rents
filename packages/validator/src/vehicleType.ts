import { z } from "./zod-project";

export const CreateVehicleTypeSchema = z.object({
  name: z.string().min(1),
});
export type InputCreateVehicleType = z.infer<typeof CreateVehicleTypeSchema>;

export const UpdateVehicleTypeSchema = CreateVehicleTypeSchema.extend({
  vehicleTypeId: z.string().min(1),
});
export type InputUpdateVehicleType = z.infer<typeof UpdateVehicleTypeSchema>;
