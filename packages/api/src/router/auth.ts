import { TRPCError } from "@trpc/server";

import { AuthService } from "@acme/auth";
import { z } from "@acme/validator";
import {
  COOKIE_SESSION_ID_IDENTIFIER,
  HEADER_SESSION_ID_IDENTIFIER,
  LoginWithCompanyAndUserSchema,
  RegisterNewCompanyAndAccountSchema,
} from "@acme/validator/src/auth";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const authRouter = createTRPCRouter({
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.user;
  }),
  getAuthUser: protectedProcedure.query(async ({ ctx }) => {
    const user = await AuthService.getUserMetadata(ctx.user.grantId);
    if (!user) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "No user" });
    }
    return user;
  }),
  refreshAccessToken: publicProcedure.mutation(async ({ ctx }) => {
    let sessionId: string | null = null;

    const cookieSessionId = ctx.req.cookies[COOKIE_SESSION_ID_IDENTIFIER];
    if (typeof cookieSessionId === "string") {
      sessionId = cookieSessionId;
    }

    if (!sessionId) {
      const fromHeader = ctx.req.headers[HEADER_SESSION_ID_IDENTIFIER];
      if (typeof fromHeader === "string") {
        sessionId = fromHeader;
      }
    }

    if (!sessionId) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "No session id" });
    }

    const result = await AuthService.refreshAccessTokenWithSessionId(sessionId);
    ctx.res.cookie(COOKIE_SESSION_ID_IDENTIFIER, result.sessionId, {
      httpOnly: true,
    });

    return result;
  }),
  registerCompanyAndAccount: publicProcedure
    .input(RegisterNewCompanyAndAccountSchema)
    .mutation(async ({ input }) => {
      try {
        return await AuthService.registerNewCompanyAndAccount(input);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: (error as any)?.message ?? "Something went wrong",
        });
      }
    }),
  triggerEmailLoginAccessCode: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      try {
        const result = await AuthService.initEmailLoginWithAccessCode(
          input.email,
        );
        return result;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: (error as any)?.message ?? "Something went wrong",
        });
      }
    }),
  getCompaniesWithAccessCode: publicProcedure
    .input(z.object({ email: z.string().email(), accessCode: z.string() }))
    .query(async ({ input }) => {
      try {
        return await AuthService.getPortalsWithAccessCode(
          input.email,
          input.accessCode,
        );
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: (error as any)?.message ?? "Something went wrong",
        });
      }
    }),
  loginWithAccessCodeAndCompany: publicProcedure
    .input(LoginWithCompanyAndUserSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await AuthService.userLoginWithAccessCode(input);
        ctx.res.cookie(COOKIE_SESSION_ID_IDENTIFIER, result.sessionId, {
          httpOnly: true,
        });

        return result;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: (error as any)?.message ?? "Something went wrong",
        });
      }
    }),
  logout: publicProcedure.mutation(({ ctx }) => {
    ctx.res.clearCookie(COOKIE_SESSION_ID_IDENTIFIER);
    return { success: true };
  }),
});
