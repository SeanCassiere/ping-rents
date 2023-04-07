import { TRPCError } from "@trpc/server";

import "@acme/validator/src/vehicleType";
import { z } from "@acme/validator";
import {
  CreateVehicleTypeSchema,
  UpdateVehicleTypeSchema,
} from "@acme/validator/src/vehicleType";

import { VehicleTypeLogic } from "../logic/vehicleType";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const vehicleTypesRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    return VehicleTypeLogic.getAll(ctx.user);
  }),
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await VehicleTypeLogic.getById(ctx.user, input);
    }),
  create: protectedProcedure
    .input(CreateVehicleTypeSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await VehicleTypeLogic.create(ctx.user, input);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: (error as any)?.message ?? "Something went wrong",
        });
      }
    }),
  updateById: protectedProcedure
    .input(UpdateVehicleTypeSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await VehicleTypeLogic.updateById(ctx.user, input);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: (error as any)?.message ?? "Something went wrong",
        });
      }
    }),
});
