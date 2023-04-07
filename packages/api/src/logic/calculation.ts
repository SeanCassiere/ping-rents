import {
  type EnumRateCalculationType,
  type EnumTaxCalculationType,
} from "@acme/db";

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

type CalculationInput = {
  checkoutDate: Date;
  checkinDate: Date;
  rate: {
    calculationType: EnumRateCalculationType;
    dailyRate: number;
  };
  taxes: {
    calculationType: EnumTaxCalculationType;
    value: number;
    name: string;
  }[];
};

class CalculationController {
  private calculate(_: CalculationInput): CalculationOutput {
    return {
      baseRate: 0,
      promotionOnBase: 0,
      promotionOnSubtotal: 0,
      subtotal: 0,
      totalTax: 0,
      grandTotal: 0,
      amountPaid: 0,
      balanceDue: 0,
    };
  }

  async getCalculationForRental(): Promise<CalculationOutput> {
    return {
      baseRate: 0,
      promotionOnBase: 0,
      promotionOnSubtotal: 0,
      subtotal: 0,
      totalTax: 0,
      grandTotal: 0,
      amountPaid: 0,
      balanceDue: 0,
    };
  }

  async getLiveCalculation(): Promise<CalculationOutput> {
    return {
      baseRate: 0,
      promotionOnBase: 0,
      promotionOnSubtotal: 0,
      subtotal: 0,
      totalTax: 0,
      grandTotal: 0,
      amountPaid: 0,
      balanceDue: 0,
    };
  }

  async recalculateForRental(): Promise<CalculationOutput> {
    return {
      baseRate: 0,
      promotionOnBase: 0,
      promotionOnSubtotal: 0,
      subtotal: 0,
      totalTax: 0,
      grandTotal: 0,
      amountPaid: 0,
      balanceDue: 0,
    };
  }
}

export const CalculationLogic = new CalculationController();
