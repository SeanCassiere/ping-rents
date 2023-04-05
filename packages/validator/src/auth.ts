import { z } from "./zod-project";

export const COOKIE_SESSION_ID_IDENTIFIER = "session-id";
export const HEADER_SESSION_ID_IDENTIFIER = "X-SESSION-ID";

export const RegisterNewCompanyAndAccountSchema = z.object({
  companyName: z.string().min(1),
  accountName: z.string().min(1),
  accountEmail: z.string().email(),
});
export type InputRegisterNewCompanyAndAccount = z.infer<
  typeof RegisterNewCompanyAndAccountSchema
>;

export const LoginWithCompanyAndUserSchema = z.object({
  accountEmail: z.string().min(1),
  accessCode: z.string().min(1),
  companyId: z.string().min(1),
});
export type InputLoginWithCompanyAndUser = z.infer<
  typeof LoginWithCompanyAndUserSchema
>;

export const VerifyRefreshTokenPayloadSchema = z.object({
  data: z
    .object({
      sessionId: z.string(),
      accessToken: z.string(),
      accessTokenExpiresAt: z.string(),
      sessionExpiresAt: z.string(),
    })
    .nullable(),
});
