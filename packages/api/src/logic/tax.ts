import { prisma } from "@acme/db";
import { ZodError } from "@acme/validator";
import type {
  InputCreateNewTax,
  InputGetTaxes,
  InputUpdateTax,
} from "@acme/validator/src/tax";

import type { AuthMetaUser } from "../trpc";

class TaxController {
  public async getAll(user: AuthMetaUser, payload: InputGetTaxes) {
    return await prisma.tax.findMany({
      where: {
        companyId: user.companyId,
        ...(payload.locationId ? { locationId: payload.locationId } : {}),
        accessType: "config",
      },
    });
  }

  public async create(user: AuthMetaUser, payload: InputCreateNewTax) {
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

    return await prisma.tax.create({
      data: {
        company: { connect: { id: user.companyId } },
        name: payload.name,
        value: payload.value,
        calculationType: payload.calculationType,
        location: { connect: { id: payload.locationId } },
        accessType: "config",
      },
    });
  }

  public async getById(user: AuthMetaUser, payload: { id: string }) {
    return await prisma.tax.findFirst({
      where: { companyId: user.companyId, id: payload.id },
    });
  }

  public async updateById(user: AuthMetaUser, payload: InputUpdateTax) {
    return await prisma.tax.update({
      where: { companyId_id: { companyId: user.companyId, id: payload.id } },
      data: {
        name: payload.name,
        value: payload.value,
        calculationType: payload.calculationType,
      },
    });
  }
}

export const TaxLogic = new TaxController();
