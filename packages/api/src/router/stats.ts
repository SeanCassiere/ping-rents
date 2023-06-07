import { z } from "@acme/validator";

import { StatisticLogic } from "../logic/statistic";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const statisticsRouter = createTRPCRouter({
  getMonthlyEarnings: protectedProcedure
    .input(z.object({ clientDate: z.date() }))
    .query(async ({ ctx, input }) => {
      return await StatisticLogic.getTotalMonthlyEarnings(
        ctx.user,
        input.clientDate,
      );
    }),
  getOnRentAgreementsCount: protectedProcedure.query(async ({ ctx }) => {
    return await StatisticLogic.getOnRentAgreementsCount(ctx.user);
  }),
  getMonthlyClosedAgreementsCount: protectedProcedure
    .input(z.object({ clientDate: z.date() }))
    .query(async ({ ctx, input }) => {
      return await StatisticLogic.getClosedThisMonthAgreementsCount(
        ctx.user,
        input.clientDate,
      );
    }),
});
