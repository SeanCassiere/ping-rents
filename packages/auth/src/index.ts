import * as crypto from "crypto";
import SendGrid from "@sendgrid/mail";
import { add, format } from "date-fns";
import jwt from "jsonwebtoken";

import { prisma } from "@acme/db";
import {
  z,
  type InputLoginWithCompanyAndUser,
  type InputRegisterNewCompanyAndAccount,
} from "@acme/validator";

import { generateLoginCodeEmailTemplateHtml } from "./generateLoginCodeEmailTemplateHtml";

function sha256(content: string) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

/**
 *
 * @param isDemoAccount a user's email
 * @returns a 6 digit access code, ranging from 100000 to 999999
 */
function generateAccessCode(isDemoAccount: boolean) {
  if (isDemoAccount) {
    return "123456";
  }
  return `${Math.floor(100000 + Math.random() * 900000)}`;
}

const SendGridApiKey = process.env.SENDGRID_API_KEY;
const SendGridFromEmail = process.env.SENDGRID_FROM_EMAIL;
const GOOGLE_DEMO_EMAIL = process.env.GOOGLE_DEMO_EMAIL || "demo@example.com";

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

    const location = await prisma.location.create({
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

    return {
      companyId: company.id,
      userId,
      grantId: connection.id,
      locationId: location.id,
    };
  }

  static async initEmailLoginWithAccessCode(email: string) {
    const user = await prisma.account.findFirst({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return { expiresInMinutes: accessCodeExpiryMinutes };
    }

    const isDemoAccount =
      user.email.toLowerCase() === GOOGLE_DEMO_EMAIL.toLowerCase();
    const minutesTillExpiry = isDemoAccount ? 180 : accessCodeExpiryMinutes;

    // send email with access-code
    const accessCode = generateAccessCode(isDemoAccount);
    const hashedAccessCode = sha256(accessCode);
    const expiresAt = add(new Date(), {
      minutes: minutesTillExpiry,
    });

    const attempt = await prisma.accountLoginAttempt.create({
      data: {
        accessCode: hashedAccessCode,
        expiresAt,
        account: { connect: { id: user.id } },
        isUsed: false,
      },
    });

    const formattedCreatedDate = format(
      attempt.createdAt,
      "dd/MM/yyyy HH:mm a",
    );

    if (!isDemoAccount) {
      await SendGrid.send({
        from: { email: SendGridFromEmail!, name: "noreply - PingRents" },
        to: { email: user.email },
        subject: `Login access code - ${formattedCreatedDate} | PingRents`,
        html: generateLoginCodeEmailTemplateHtml(
          accessCode,
          minutesTillExpiry,
          attempt.id,
          formattedCreatedDate,
        ),
        text: `Access Code: ${accessCode}, Expires in ${minutesTillExpiry} minutes.`,
      });
    }

    return { expiresInMinutes: minutesTillExpiry };
  }

  static async getTenantsForUserUsingAccessCode(
    email: string,
    accessCode: string,
  ) {
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

    const tenantConnections = await prisma.companyAccountConnection.findMany({
      where: { accountId: userId },
      select: {
        company: true,
      },
    });

    return tenantConnections.map((connection) => ({
      id: connection.company.id,
      name: connection.company.name,
    }));
  }

  static async getAvailableTenantsForSession(sessionId: string) {
    const session = await prisma.session.findFirst({
      where: { id: sessionId },
    });

    if (!session) {
      throw new Error("Session not found");
    }

    if (session.expiresAt < new Date()) {
      throw new Error("Session expired");
    }

    const tenants = await prisma.companyAccountConnection.findMany({
      where: {
        accountId: session.accountId,
      },
      include: {
        company: {
          select: {
            name: true,
          },
        },
      },
    });

    return tenants.map((tenant) => ({
      id: tenant.companyId,
      name: tenant.company.name,
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

  static async switchTenantForSession(
    sessionId: string,
    intendedCompanyId: string,
  ) {
    const session = await prisma.session.findFirst({
      where: { id: sessionId },
    });

    if (!session) {
      throw new Error("Session not found");
    }

    if (session.expiresAt < new Date()) {
      throw new Error("Session expired");
    }

    const tenantConnections = await prisma.companyAccountConnection.findMany({
      where: {
        accountId: session.accountId,
      },
    });

    const intendedTenantConnection = tenantConnections.find(
      (tenant) => tenant.companyId === intendedCompanyId,
    );

    if (!intendedTenantConnection) {
      throw new Error("You are not connected to this company.");
    }

    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: {
        expiresAt: add(new Date(), { days: 7 }),
        company: { connect: { id: intendedCompanyId } },
      },
    });

    const generatedJwt = this.generateJWTToken(
      session.accountId,
      intendedCompanyId,
      intendedTenantConnection.id,
    );

    return {
      sessionId,
      accessToken: generatedJwt.jwt,
      accessTokenExpiresAt: generatedJwt.date,
      sessionExpiresAt: updatedSession.expiresAt,
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
