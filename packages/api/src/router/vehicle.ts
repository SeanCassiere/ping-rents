import {
  CreateVehicleSchema,
  GetAllVehiclesSchema,
  UpdateVehicleSchema,
  z,
} from "@acme/validator";

import { VehicleLogic } from "../logic/vehicle";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const vehiclesRouter = createTRPCRouter({
  getMakes: protectedProcedure.query(async ({ ctx }) => {
    return await VehicleLogic.getMakes(ctx.user);
  }),

  getModels: protectedProcedure
    .input(z.object({ make: z.string() }))
    .query(async ({ ctx, input }) => {
      return await VehicleLogic.getModels(ctx.user, input.make);
    }),

  getAll: protectedProcedure
    .input(GetAllVehiclesSchema)
    .query(async ({ ctx, input }) => {
      return await VehicleLogic.getAll(ctx.user, input);
    }),

  getVehicle: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      return await VehicleLogic.getById(ctx.user, { id: input.id });
    }),

  create: protectedProcedure
    .input(CreateVehicleSchema)
    .mutation(async ({ ctx, input }) => {
      return await VehicleLogic.create(ctx.user, input);
    }),

  update: protectedProcedure
    .input(UpdateVehicleSchema)
    .mutation(async ({ ctx, input }) => {
      return await VehicleLogic.updateById(ctx.user, input);
    }),
});
