import { z } from "./zod-project";

export const GetAllVehiclesSchema = z.object({
  status: z.enum(["available", "on_rental"]).optional(),
});
export type InputGetAllVehicles = z.infer<typeof GetAllVehiclesSchema>;

export const CreateVehicleSchema = z.object({
  vin: z.string().min(1),
  licensePlate: z.string().min(1),
  year: z.string().min(1).default(new Date().getFullYear().toString()),
  make: z.string().min(1),
  model: z.string().min(1),
  color: z.string().min(1),
  typeId: z.string().min(1),
  currentLocationId: z.string().min(1),
  currentOdometer: z.number().min(0),
});
export type InputCreateVehicle = z.infer<typeof CreateVehicleSchema>;

export const UpdateVehicleSchema = CreateVehicleSchema.extend({
  id: z.string().min(1),
});
export type InputUpdateVehicle = z.infer<typeof UpdateVehicleSchema>;
