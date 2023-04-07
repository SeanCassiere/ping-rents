import { z } from "@acme/validator";
import { CreateRentalSchema } from "@acme/validator/src/rental";

import { RentalLogic } from "../logic/rental";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const agreementsRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await RentalLogic.getAll(ctx.user, "agreement");
  }),
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await RentalLogic.getById(ctx.user, "agreement", input);
    }),
  create: protectedProcedure
    .input(CreateRentalSchema)
    .mutation(async ({ ctx, input }) => {
      return await RentalLogic.createRental(
        ctx.user,
        { type: "agreement", status: "open" },
        input,
      );
    }),
});
