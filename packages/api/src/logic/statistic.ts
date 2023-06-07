import { endOfMonth, startOfMonth } from "date-fns";

import { prisma } from "@acme/db";

import { type AuthMetaUser } from "../trpc";
import { CalculationLogic, formatNumber } from "./calculation";

class StatisticController {
  public async getOpenAgreementsCount(user: AuthMetaUser) {}

  public async getAvailableVehiclesCount(user: AuthMetaUser) {}

  public async getTotalMonthlyEarnings(
    user: AuthMetaUser,
    clientDate: Date,
  ): Promise<{ payments: number; refunds: number; profit: number }> {
    const monthStartDate = startOfMonth(clientDate);
    const monthEndDate = endOfMonth(clientDate);

    const paymentsWithinTheMonth = await prisma.payment.findMany({
      where: {
        createdAt: {
          gte: monthStartDate,
          lte: monthEndDate,
        },
        companyId: user.companyId,
      },
    });

    const output = CalculationLogic.calculateRentalPaymentsAndRefunds(
      paymentsWithinTheMonth,
    );

    return {
      payments: formatNumber(output.payments),
      refunds: formatNumber(output.refunds),
      profit: formatNumber(output.payments - output.refunds),
    };
  }
}

export const StatisticLogic = new StatisticController();
