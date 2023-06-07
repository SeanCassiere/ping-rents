import { StatisticLogic } from "../logic/statistic";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const statisticsRouter = createTRPCRouter({
  getMonthlyEarnings: protectedProcedure.query(async ({ ctx }) => {
    return await StatisticLogic.getTotalMonthlyEarnings(ctx.user, new Date());
  }),
  getOnRentAgreementsCount: protectedProcedure.query(async ({ ctx }) => {
    return await StatisticLogic.getOnRentAgreementsCount(ctx.user);
  }),
  getMonthlyClosedAgreementsCount: protectedProcedure.query(async ({ ctx }) => {
    return await StatisticLogic.getClosedThisMonthAgreementsCount(
      ctx.user,
      new Date(),
    );
  }),
  getVehicleStatusCounts: protectedProcedure.query(async ({ ctx }) => {
    return await StatisticLogic.getVehicleStatusCounts(ctx.user);
  }),
});
