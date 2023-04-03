import * as crypto from "crypto";
import nodemailer from "nodemailer";

import { add } from "@acme/date-fns";
import { prisma } from "@acme/db";
import type { InputRegisterNewCompanyAndAccount } from "@acme/validator/src/auth";

function sha256(content: string) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

function generateAccessCode() {
  return `${Math.floor(100000 + Math.random() * 900000)}`;
}

const isUsingTestMailer = true;
let mailer: nodemailer.Transporter | null = null;

async function setupTransport() {
  if (!mailer && isUsingTestMailer) {
    const testAccount = await nodemailer.createTestAccount();
    mailer = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
  } else if (!mailer) {
    const testAccount = await nodemailer.createTestAccount();
    mailer = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
  }
  return mailer;
}

const accessCodeExpiryMinutes = 10;

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
      where: { email: input.accountEmail.toLowerCase() },
    });

    if (!findUser) {
      const newUser = await prisma.account.create({
        data: {
          name: input.accountName,
          email: input.accountEmail.toLowerCase(),
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

  static async initEmailLoginWithMagicLink(email: string) {
    const user = await prisma.account.findFirst({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return { expiresInMinutes: accessCodeExpiryMinutes };
    }

    // send email with access-code
    const accessCode = generateAccessCode();
    const hashedAccessCode = sha256(accessCode);
    const expiresAt = add(new Date(), { minutes: accessCodeExpiryMinutes });

    await prisma.accountLoginAttempt.create({
      data: {
        accessCode: hashedAccessCode,
        expiresAt,
        account: { connect: { id: user.id } },
        isUsed: false,
      },
    });

    const transport = await setupTransport();

    const emailSent = await transport.sendMail({
      from: '"Ping Rents 👻" <admin@pingstash.com>', // sender address
      to: user.email, // list of receivers
      subject: "Ping Rents | Access Code", // Subject line
      text: `Access Code: ${accessCode}, Expires in ${accessCodeExpiryMinutes} minutes.`, // plain text body
      html: `<p>Access Code: <b>${accessCode}</b>.<br>expires in ${accessCodeExpiryMinutes} minutes.</p>`, // html body
    });

    if (isUsingTestMailer) {
      // Preview only available when sending through an Ethereal account
      console.log(
        "Login Magic Link Preview URL: %s",
        nodemailer.getTestMessageUrl(emailSent), // eslint-disable-line
      );
    }

    return { expiresInMinutes: accessCodeExpiryMinutes };
  }

  static async getPortalsWithAccessCode(email: string, accessCode: string) {
    const hashedAccessCode = sha256(accessCode);
    const attempt = await prisma.accountLoginAttempt.findFirst({
      where: {
        accessCode: hashedAccessCode,
        account: { email: email.toLowerCase() },
        isUsed: false,
        expiresAt: { gte: new Date() },
      },
    });

    if (!attempt) {
      throw new Error("Invalid or expired access code.");
    }

    const userId = attempt.accountId;

    const portals = await prisma.companyAccountConnection.findMany({
      where: { accountId: userId },
      select: {
        company: true,
      },
    });

    return portals.map((portal) => ({
      id: portal.company.id,
      name: portal.company.name,
    }));
  }

  static async loginWithCompanyIdAndUserId() {
    //
    return {
      sessionId: "",
      accessToken: "",
      accessTokenExpiresAt: new Date(),
      sessionExpiresAt: new Date(),
    };
  }
}
