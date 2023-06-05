import { prisma } from "@acme/db";
import type {
  InputCreateCustomer,
  InputUpdateCustomer,
} from "@acme/validator";

import type { AuthMetaUser } from "../trpc";

class CustomerController {
  public async getAll(user: AuthMetaUser) {
    return await prisma.customer
      .findMany({
        where: { companyId: user.companyId },
        orderBy: { firstName: "asc" },
      })
      .then((results) =>
        results.map((customer) => ({
          ...customer,
          fullName: `${customer.firstName} ${customer.lastName}`.trim(),
        })),
      );
  }

  public async create(user: AuthMetaUser, payload: InputCreateCustomer) {
    const customer = await prisma.customer.upsert({
      where: {
        email_companyId: {
          email: payload.email.toLowerCase(),
          companyId: user.companyId,
        },
      },
      update: {
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email.toLowerCase(),
      },
      create: {
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email.toLowerCase(),
        company: { connect: { id: user.companyId } },
      },
    });

    return {
      ...customer,
      fullName: `${customer.firstName} ${customer.lastName}`.trim(),
    };
  }

  public async updateById(_: AuthMetaUser, payload: InputUpdateCustomer) {
    const customer = await prisma.customer.update({
      where: {
        id: payload.id,
      },
      data: {
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email.toLowerCase(),
      },
    });

    return {
      ...customer,
      fullName: `${customer.firstName} ${customer.lastName}`.trim(),
    };
  }

  public async getById(_: AuthMetaUser, payload: { customerId: string }) {
    const customer = await prisma.customer.findUniqueOrThrow({
      where: { id: payload.customerId },
    });

    return {
      ...customer,
      fullName: `${customer.firstName} ${customer.lastName}`.trim(),
    };
  }
}

export const CustomerLogic = new CustomerController();
