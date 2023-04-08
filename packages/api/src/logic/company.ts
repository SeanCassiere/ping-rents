import { AuthService } from "@acme/auth";
import { prisma } from "@acme/db";
import {
  type InputAddUserToCompany,
  type InputUpdateCompanyInformation,
  type InputUpdateUserForCompany,
} from "@acme/validator/src/company";

import { type AuthMetaUser } from "../trpc";

class CompanyController {
  async createGrantForAccount(
    user: AuthMetaUser,
    payload: InputAddUserToCompany,
  ) {
    let accountId = "";
    const account = await AuthService.emailHasExistingAccount(payload.email);

    if (account) {
      accountId = account.id;
    } else {
      const newAccount = await AuthService.createAccount(payload.email);
      accountId = newAccount.id;
    }

    const connection = await prisma.companyAccountConnection.upsert({
      where: {
        accountId_companyId: {
          accountId,
          companyId: user.companyId,
        },
      },
      update: {
        name: payload.name,
      },
      create: {
        name: payload.name,
        role: "employee",
        isOwner: false,
        account: {
          connect: {
            id: accountId,
          },
        },
        company: {
          connect: {
            id: user.companyId,
          },
        },
      },
    });

    return connection;
  }

  async revokeGrantFromCompany(_: AuthMetaUser, grantId: string) {
    return await prisma.companyAccountConnection.delete({
      where: {
        id: grantId,
      },
    });
  }

  async updateGrantForAccount(
    _: AuthMetaUser,
    payload: InputUpdateUserForCompany,
  ) {
    return await prisma.companyAccountConnection.update({
      where: {
        id: payload.id,
      },
      data: {
        name: payload.name,
      },
    });
  }

  async getGrantForAccount(_: AuthMetaUser, grantId: string) {
    return await prisma.companyAccountConnection.findUnique({
      where: {
        id: grantId,
      },
      include: {
        account: {
          select: {
            email: true,
          },
        },
      },
    });
  }

  async updateCompanyInformation(
    user: AuthMetaUser,
    payload: InputUpdateCompanyInformation,
  ) {
    return await prisma.company.update({
      where: { id: user.companyId },
      data: { name: payload.name },
    });
  }

  async getAllGrantsForCompany(user: AuthMetaUser) {
    return await prisma.companyAccountConnection.findMany({
      where: {
        companyId: user.companyId,
      },
      include: {
        account: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}

export const CompanyLogic = new CompanyController();
