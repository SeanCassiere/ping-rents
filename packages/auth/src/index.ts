import * as crypto from "crypto";
import SendGrid from "@sendgrid/mail";
import jwt from "jsonwebtoken";

import { add } from "@acme/date-fns";
import { prisma } from "@acme/db";
import {
  z,
  type InputLoginWithCompanyAndUser,
  type InputRegisterNewCompanyAndAccount,
} from "@acme/validator";

function sha256(content: string) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

function generateAccessCode() {
  return `${Math.floor(100000 + Math.random() * 900000)}`;
}

const SendGridApiKey = process.env.SENDGRID_API_KEY;
const SendGridFromEmail = process.env.SENDGRID_FROM_EMAIL;

if (!SendGridApiKey) {
  throw new Error(
    "🤯 AUTH: Missing the SendGrid API Key. process.env.SENDGRID_API_KEY",
  );
}

if (!SendGridFromEmail) {
  throw new Error(
    "🤯 AUTH: Missing the SendGrid From Email. process.env.SENDGRID_FROM_EMAIL",
  );
}

SendGrid.setApiKey(SendGridApiKey);

const accessCodeExpiryMinutes = 10;

const JWT_SECRET = process.env.JWT_SECRET ?? "secret";

const JwtSchema = z.object({
  userId: z.string(),
  companyId: z.string(),
  grantId: z.string(),
});

export class AuthService {
  constructor() {}

  static generateJWTToken(userId: string, companyId: string, grantId: string) {
    const date = new Date();
    const token = jwt.sign({ userId, companyId, grantId }, JWT_SECRET, {
      expiresIn: "1h",
      subject: userId,
    });
    return { jwt: token, date };
  }

  static verifyJWTToken(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      if (typeof decoded === "string") {
        return JwtSchema.parse(JSON.parse(decoded));
      } else {
        return JwtSchema.parse(decoded);
      }
    } catch (error) {
      return null;
    }
  }

  static async createAccount(email: string) {
    return await prisma.account.create({
      data: {
        email: email.toLowerCase(),
      },
    });
  }

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
      const newUser = await AuthService.createAccount(input.accountEmail);
      userId = newUser.id;
    } else {
      userId = findUser.id;
    }

    const connection = await prisma.companyAccountConnection.create({
      data: {
        name: input.accountName,
        isOwner: true,
        role: "admin",
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

    return { companyId: company.id, userId, grantId: connection.id };
  }

  static async initEmailLoginWithAccessCode(email: string) {
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

    const attempt = await prisma.accountLoginAttempt.create({
      data: {
        accessCode: hashedAccessCode,
        expiresAt,
        account: { connect: { id: user.id } },
        isUsed: false,
      },
    });

    await SendGrid.send({
      from: { email: SendGridFromEmail!, name: "NoReply@pingstash.com" },
      to: { email: user.email },
      subject: `Ping Rents | Access Code | Attempt ID#${attempt.id}`,
      html: `<p>Access Code: <b>${accessCode}</b>.<br>expires in ${accessCodeExpiryMinutes} minutes.</p>`,
      text: `Access Code: ${accessCode}, Expires in ${accessCodeExpiryMinutes} minutes.`,
    });

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

  static async userLoginWithAccessCode(payload: InputLoginWithCompanyAndUser) {
    const accessCode = payload.accessCode;

    const hashedAccessCode = sha256(accessCode);
    const attempt = await prisma.accountLoginAttempt.findFirst({
      where: {
        accessCode: hashedAccessCode,
        isUsed: false,
        expiresAt: { gte: new Date() },
        account: {
          email: payload.accountEmail.toLowerCase(),
        },
      },
    });

    if (!attempt) {
      throw new Error("Invalid or expired access code.");
    }

    let grantId = "";
    try {
      const connection = await prisma.companyAccountConnection.findFirstOrThrow(
        {
          where: { accountId: attempt.accountId, companyId: payload.companyId },
        },
      );
      grantId = connection.id;
    } catch (error) {
      throw new Error("You are not connected to this company.");
    }

    const generatedJwt = this.generateJWTToken(
      attempt.accountId,
      payload.companyId,
      grantId,
    );

    const session = await prisma.session
      .create({
        data: {
          account: { connect: { id: attempt.accountId } },
          company: { connect: { id: payload.companyId } },
          expiresAt: add(new Date(), { days: 7 }),
        },
      })
      .catch((err) => {
        throw new Error(err?.message ?? "Error creating session."); // eslint-disable-line
      });

    await prisma.accountLoginAttempt.update({
      where: { id: attempt.id },
      data: { isUsed: true },
    });

    return {
      sessionId: session.id,
      accessToken: generatedJwt.jwt,
      accessTokenExpiresAt: add(generatedJwt.date, { hours: 1 }),
      sessionExpiresAt: session.expiresAt,
    };
  }

  static async refreshAccessTokenWithSessionId(sessionId: string) {
    const session = await prisma.session.findFirst({
      where: { id: sessionId },
    });

    if (!session) {
      throw new Error("Session not found");
    }

    if (session.expiresAt < new Date()) {
      throw new Error("Session expired");
    }

    let grantId = "";

    try {
      const connection = await prisma.companyAccountConnection.findFirstOrThrow(
        {
          where: { accountId: session.accountId, companyId: session.companyId },
        },
      );
      grantId = connection.id;
    } catch (error) {
      throw new Error("You are not connected to this company.");
    }

    const generatedJwt = this.generateJWTToken(
      session.accountId,
      session.companyId,
      grantId,
    );
    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: { expiresAt: add(new Date(), { days: 7 }) },
    });

    return {
      sessionId: session.id,
      accessToken: generatedJwt.jwt,
      accessTokenExpiresAt: add(generatedJwt.date, { hours: 1 }),
      sessionExpiresAt: updatedSession.expiresAt,
    };
  }

  static async emailHasExistingAccount(email: string) {
    const account = await prisma.account.findFirst({
      where: {
        email: email.toLowerCase(),
      },
    });
    return account ?? false;
  }

  /**
   * Get metadata for a user. Ex: name, email, etc.
   * @param grantId grant/connection id linking the user to the company
   */
  static async getUserMetadata(grantId: string) {
    return await prisma.companyAccountConnection.findFirst({
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

  static async userIsAdmin(grantId: string) {
    const user = await AuthService.getUserMetadata(grantId);
    if (!user) {
      return false;
    }
    if (user.role !== "admin" && user.isOwner === false) {
      return false;
    }
    return true;
  }
}
