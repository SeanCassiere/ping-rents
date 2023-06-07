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
});
