import { z } from "@acme/validator";
import {
  CreateRentalSchema,
  UpdateRentalSchema,
} from "@acme/validator/src/rental";

import { RentalLogic } from "../logic/rental";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const reservationsRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await RentalLogic.getAll(ctx.user, "reservation");
  }),
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await RentalLogic.getById(ctx.user, "reservation", input);
    }),
  create: protectedProcedure
    .input(CreateRentalSchema)
    .mutation(async ({ ctx, input }) => {
      return await RentalLogic.createRental(
        ctx.user,
        { type: "reservation", status: "open" },
        input,
      );
    }),
  updateById: protectedProcedure
    .input(UpdateRentalSchema)
    .mutation(async ({ ctx, input }) => {
      return await RentalLogic.updateById(ctx.user, "reservation", input);
    }),
});
