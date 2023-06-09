import { prisma, type PaymentMode as EnumPaymentMode } from "@acme/db";
import { type InputCreateRentalPayment } from "@acme/validator";

import { type AuthMetaUser } from "../trpc";
import { CalculationLogic } from "./calculation";

type PaymentMode = EnumPaymentMode;
export type CalculationPayment = { value: number; mode: PaymentMode };

class PaymentController {
  public async getPaymentsByRentalId(user: AuthMetaUser, rentalId: string) {
    const payments = await prisma.payment.findMany({
      where: { rentalId, companyId: user.companyId },
      orderBy: { createdAt: "asc" },
    });
    return payments.map((p) => ({
      id: p.id,
      value: p.value,
      mode: p.mode,
      rentalId: p.rentalId,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  }

  public async createPaymentForRental(
    user: AuthMetaUser,
    input: InputCreateRentalPayment,
  ) {
    const payments = await this.getPaymentsByRentalId(user, input.rentalId);
    const summary = await CalculationLogic.getCalculationByRentalId(
      user,
      "agreement",
      { id: input.rentalId },
      payments,
    );
    if (input.mode === "pay" && summary.balanceDue < input.value) {
      throw new Error("Payment amount is greater than balance due");
    }
    if (input.mode === "refund" && input.value > summary.amountPaid) {
      throw new Error("Refund amount is more than amount paid");
    }
    return await prisma.$transaction(async (tx) => {
      const company = await tx.company.findFirstOrThrow({
        where: { id: user.companyId },
      });

      await tx.payment.create({
        data: {
          value: input.value,
          mode: input.mode,
          displayRefNo: `${company.nextPaymentTrackNumber}`,
          rental: { connect: { id: input.rentalId } },
          company: { connect: { id: user.companyId } },
        },
      });

      await tx.company.update({
        where: { id: user.companyId },
        data: {
          nextPaymentTrackNumber: {
            increment: 1,
          },
        },
      });

      const newSummary = await CalculationLogic.getCalculationByRentalId(
        user,
        "agreement",
        { id: input.rentalId },
        [...payments, { value: input.value, mode: input.mode }],
      );

      const rental = await tx.rental.findFirstOrThrow({
        where: { id: input.rentalId },
      });

      // if balance is zero and agreement is in pending_payment, close it
      if (
        newSummary.balanceDue <= 0 &&
        rental.type === "agreement" &&
        rental.status === "pending_payment"
      ) {
        await tx.rental.update({
          where: { id: input.rentalId },
          data: { status: "closed" },
        });
      }

      // if balance is not zero and agreement is closed, reopen it
      if (
        newSummary.balanceDue > 0 &&
        rental.type === "agreement" &&
        rental.status === "closed"
      ) {
        await tx.rental.update({
          where: { id: input.rentalId },
          data: { status: "pending_payment" },
        });
      }

      return { success: true };
    });
  }
}

export const PaymentLogic = new PaymentController();
