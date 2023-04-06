import { z } from "@acme/validator";
import {
  CreateVehicleSchema,
  UpdateVehicleSchema,
} from "@acme/validator/src/vehicle";

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

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await VehicleLogic.getAll(ctx.user);
  }),

  create: protectedProcedure
    .input(CreateVehicleSchema)
    .mutation(async ({ ctx, input }) => {
      return await VehicleLogic.create(ctx.user, input);
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      return await VehicleLogic.getById(ctx.user, input.id);
    }),

  updateById: protectedProcedure
    .input(UpdateVehicleSchema)
    .mutation(async ({ ctx, input }) => {
      return await VehicleLogic.updateById(ctx.user, input);
    }),
});
