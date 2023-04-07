type CalculationOutput = {
  baseRate: number;
  promotionOnBase: number;
  promotionOnSubtotal: number;
  subtotal: number;
  totalTax: number;
  grandTotal: number;
  amountPaid: number;
  amountDue: number;
  balance: number;
};

class CalculationController {
  private calculate(): CalculationOutput {
    return {
      baseRate: 0,
      promotionOnBase: 0,
      promotionOnSubtotal: 0,
      subtotal: 0,
      totalTax: 0,
      grandTotal: 0,
      amountPaid: 0,
      amountDue: 0,
      balance: 0,
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
      amountDue: 0,
      balance: 0,
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
      amountDue: 0,
      balance: 0,
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
      amountDue: 0,
      balance: 0,
    };
  }
}

export const CalculationLogic = new CalculationController();
