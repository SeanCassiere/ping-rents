import { prisma } from "@acme/db";
import { ZodError } from "@acme/validator";
import type {
  InputCreateNewTax,
  InputGetTaxes,
  InputUpdateTax,
} from "@acme/validator/src/tax";

import type { AuthMetaUser } from "../trpc";

class TaxController {
  public async createTaxForLocation(
    user: AuthMetaUser,
    payload: InputCreateNewTax,
  ) {
    const existing = await prisma.tax.findFirst({
      where: {
        name: payload.name,
        locationId: payload.locationId,
        companyId: user.companyId,
      },
    });
    if (existing) {
      throw new ZodError([
        { message: "Tax already exists", path: ["name"], code: "custom" },
      ]);
    }
    const { companyId, ...created } = await prisma.tax.create({
      data: {
        company: { connect: { id: user.companyId } },
        name: payload.name,
        value: payload.value,
        calculationType: payload.calculationType,
        location: { connect: { id: payload.locationId } },
      },
    });

    return created;
  }

  public async updateTaxForLocation(_: AuthMetaUser, payload: InputUpdateTax) {
    const { companyId, ...updated } = await prisma.tax.update({
      where: { id: payload.taxId },
      data: {
        name: payload.name,
        value: payload.value,
        calculationType: payload.calculationType,
      },
    });
    return updated;
  }

  public async getTaxes(user: AuthMetaUser, payload: InputGetTaxes) {
    const query = await prisma.tax.findMany({
      where: {
        companyId: user.companyId,
        ...(payload.locationId ? { locationId: payload.locationId } : {}),
      },
    });

    return query.map(({ companyId, ...tax }) => tax);
  }
}

export const TaxLogic = new TaxController();
