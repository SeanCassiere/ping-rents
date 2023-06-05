import { differenceInDays, differenceInHours } from "date-fns";

import { type EnumRentalType } from "@acme/db";
import { type InputRentalCalculation } from "@acme/validator";

import { type AuthMetaUser } from "../trpc";
import { RentalLogic } from "./rental";

type CalculationOutput = {
  baseRate: number;
  promotionOnBase: number;
  promotionOnSubtotal: number;
  subtotal: number;
  totalTax: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
};

function formatNumber(num: number, decimals = 2): number {
  return parseFloat(num.toFixed(decimals));
}

class CalculationController {
  private calculateBaseRate(input: InputRentalCalculation): number {
    if (input.rate.calculationType === "retail") {
      const hourlyRate = input.rate.dailyRate / 24;

      const hours =
        differenceInHours(
          input.checkinDate,
          input.isCheckIn ? input.returnDate : input.checkoutDate,
        ) / 24;
      const days = differenceInDays(
        input.checkinDate,
        input.isCheckIn ? input.returnDate : input.checkoutDate,
      );

      const totalHoursCost = hours * hourlyRate;
      const totalDaysCost = days * input.rate.dailyRate;

      return totalHoursCost + totalDaysCost;
    }

    return 0;
  }

  private calculateTaxes(input: {
    baseRate: number;
    taxes: InputRentalCalculation["taxes"];
  }): number {
    const taxTotal = input.taxes.reduce((acc, tax) => {
      if (tax.calculationType === "percentage") {
        return acc + input.baseRate * (tax.value / 100);
      }

      return acc;
    }, 0);
    return taxTotal;
  }

  private calculate(input: InputRentalCalculation): CalculationOutput {
    const baseRate = this.calculateBaseRate(input);
    const totalTax = this.calculateTaxes({ baseRate, taxes: input.taxes });
    const amountPaid = input.amountPaid || 0;
    const grandTotal = baseRate + totalTax;
    const balanceDue = grandTotal - amountPaid;
    return {
      baseRate: formatNumber(baseRate),
      promotionOnBase: formatNumber(0),
      promotionOnSubtotal: formatNumber(0),
      subtotal: formatNumber(baseRate),
      totalTax: formatNumber(totalTax),
      grandTotal: formatNumber(grandTotal),
      amountPaid: formatNumber(amountPaid),
      balanceDue: formatNumber(balanceDue),
    };
  }

  getCalculationForRental(
    rental: Awaited<ReturnType<(typeof RentalLogic)["getById"]>>,
  ) {
    return this.calculate({
      rate: {
        dailyRate: rental.rate.dailyRate,
        calculationType:
          rental.rate.calculationType === "retail" ? "retail" : "retail",
      },
      amountPaid: 0,
      taxes: rental.rentalTaxes.map((tax) => ({
        name: tax.name,
        calculationType: tax.calculationType,
        value: tax.value,
      })),
      checkoutDate: rental.checkoutDate,
      checkinDate: rental.checkinDate,
      returnDate: rental.returnDate,
      isCheckIn:
        rental.status === "closed" || rental.status === "pending_payment",
    });
  }

  async getCalculationByRentalId(
    user: AuthMetaUser,
    type: EnumRentalType,
    payload: { id: string },
  ): Promise<CalculationOutput> {
    const rental = await RentalLogic.getById(user, type, { id: payload.id });
    return this.getCalculationForRental(rental);
  }

  async getLiveCalculation(
    _: AuthMetaUser,
    input: InputRentalCalculation,
  ): Promise<CalculationOutput> {
    return this.calculate(input);
  }
}

export const CalculationLogic = new CalculationController();
