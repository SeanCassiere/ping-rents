import { prisma } from "@acme/db";
import type { InputRegisterNewCompanyAndAccount } from "@acme/validator/src/auth";

export class AuthService {
  constructor() {}

  static async registerNewCompanyAndAccount(
    input: InputRegisterNewCompanyAndAccount,
  ) {
    const company = await prisma.company.create({
      data: { name: input.companyName },
    });

    await prisma.location.create({
      data: { name: "Main Office", company: { connect: { id: company.id } } },
    });

    let userId = "";

    const findUser = await prisma.account.findFirst({
      where: { email: String(input.accountEmail).toLowerCase() },
    });

    if (!findUser) {
      const newUser = await prisma.account.create({
        data: {
          name: input.accountName,
          email: String(input.accountEmail).toLowerCase(),
        },
      });
      userId = newUser.id;
    } else {
      userId = findUser.id;
    }

    await prisma.companyAccountConnection.create({
      data: {
        isOwner: true,
        account: {
          connect: {
            id: userId,
          },
        },
        company: {
          connect: {
            id: company.id,
          },
        },
      },
    });

    return { companyId: company.id, userId };
  }
}
