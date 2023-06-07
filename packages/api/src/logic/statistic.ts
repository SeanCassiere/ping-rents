import { endOfMonth, startOfMonth } from "date-fns";

import { prisma } from "@acme/db";

import { type AuthMetaUser } from "../trpc";
import { CalculationLogic, formatNumber } from "./calculation";

class StatisticController {
  public async getOnRentAgreementsCount(user: AuthMetaUser): Promise<number> {
    const agreements = await prisma.rental.findMany({
      where: {
        companyId: user.companyId,
        status: "on_rent",
        type: "agreement",
      },
    });

    return agreements.length;
  }

  public async getClosedThisMonthAgreementsCount(
    user: AuthMetaUser,
    clientDate: Date,
  ) {}

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
