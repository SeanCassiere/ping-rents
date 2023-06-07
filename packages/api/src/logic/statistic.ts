import { endOfMonth, startOfMonth } from "date-fns";

import { prisma } from "@acme/db";

import { type AuthMetaUser } from "../trpc";
import { CalculationLogic, formatNumber } from "./calculation";

class StatisticController {
  public async getOnRentAgreementsCount(
    user: AuthMetaUser,
  ): Promise<{ count: number }> {
    const agreements = await prisma.rental.findMany({
      where: {
        companyId: user.companyId,
        status: "on_rent",
        type: "agreement",
      },
      select: { id: true },
    });

    return { count: agreements.length };
  }

  public async getClosedThisMonthAgreementsCount(
    user: AuthMetaUser,
    clientDate: Date,
  ): Promise<{ count: number }> {
    const monthStartDate = startOfMonth(clientDate);
    const monthEndDate = endOfMonth(clientDate);
    const agreements = await prisma.rental.findMany({
      where: {
        companyId: user.companyId,
        status: "closed",
        type: "agreement",
        returnDate: {
          gte: monthStartDate,
          lte: monthEndDate,
        },
      },
      select: { id: true },
    });
    return { count: agreements.length };
  }

  public async getVehicleStatusCounts(
    user: AuthMetaUser,
  ): Promise<{ available: number; onRent: number; total: number }> {
    const vehicles = await prisma.vehicle.findMany({
      where: { companyId: user.companyId },
    });

    const available = vehicles.filter(
      (vehicle) => vehicle.status === "available",
    ).length;
    const onRent = vehicles.filter(
      (vehicle) => vehicle.status === "on_rental",
    ).length;
    const total = vehicles.length;

    return {
      available,
      onRent,
      total,
    };
  }

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
