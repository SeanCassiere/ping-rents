import { CreateRateNewSchema, UpdateRateSchema, z } from "@acme/validator";

import { RateLogic } from "../logic/rate";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const ratesRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(z.object({ locationId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await RateLogic.getAll(ctx.user, {
        locationId: input.locationId,
        accessType: "config",
      });
    }),
  getRate: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await RateLogic.getById(ctx.user, { id: input.id });
    }),
  create: protectedProcedure
    .input(CreateRateNewSchema)
    .mutation(async ({ ctx, input }) => {
      return await RateLogic.createParent(ctx.user, {
        ...input,
        accessType: "config",
      });
    }),
  update: protectedProcedure
    .input(UpdateRateSchema)
    .mutation(async ({ ctx, input }) => {
      return await RateLogic.updateById(ctx.user, input);
    }),
});
