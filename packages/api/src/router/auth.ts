import { TRPCError } from "@trpc/server";

import { AuthService } from "@acme/auth";
import {
  COOKIE_SESSION_ID_IDENTIFIER,
  HEADER_SESSION_ID_IDENTIFIER,
  LoginWithCompanyAndUserSchema,
  RegisterNewCompanyAndAccountSchema,
  z,
} from "@acme/validator";

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

    // const cookieSessionId = ctx.req.cookies[COOKIE_SESSION_ID_IDENTIFIER];
    // if (typeof cookieSessionId === "string") {
    //   sessionId = cookieSessionId;
    // }
    ctx.req.headers["cookie"]?.split(";").forEach((cookie) => {
      console.log("cookies", cookie);
      const parts = cookie.split("=");
      if (
        parts[0] &&
        parts[1] &&
        parts[0].trim() === COOKIE_SESSION_ID_IDENTIFIER
      ) {
        sessionId = parts[1].trim();
      } else if (parts[0] && parts[1] && parts[0].trim() === "cookie") {
        parts[1].split(";").forEach((cookie) => {
          const parts = cookie.split("=");
          if (
            parts[0] &&
            parts[1] &&
            parts[0].trim() === COOKIE_SESSION_ID_IDENTIFIER
          ) {
            sessionId = parts[1].trim();
          }
        });
      }
    });

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
    // ctx.res.cookie(COOKIE_SESSION_ID_IDENTIFIER, result.sessionId, {
    //   httpOnly: true,
    // });
    ctx.res.header(
      "Set-Cookie",
      COOKIE_SESSION_ID_IDENTIFIER +
        "=" +
        result.sessionId +
        "; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=None; Secure",
    );

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
  getUserTenantsUsingAccessCode: publicProcedure
    .input(z.object({ email: z.string().email(), accessCode: z.string() }))
    .query(async ({ input }) => {
      try {
        return await AuthService.getTenantsForUserUsingAccessCode(
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
        ctx.res.header(
          "Set-Cookie",
          COOKIE_SESSION_ID_IDENTIFIER +
            "=" +
            result.sessionId +
            "; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=None; Secure",
        );

        return result;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: (error as any)?.message ?? "Something went wrong",
        });
      }
    }),
  getTenantsForUser: protectedProcedure.query(async ({ ctx }) => {
    return await AuthService.getAvailableTenantsForSession(ctx.sessionId);
  }),
  switchTenantForSession: protectedProcedure
    .input(z.object({ companyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const result = await AuthService.switchTenantForSession(
        ctx.sessionId,
        input.companyId,
      );
      ctx.res.header(
        "Set-Cookie",
        COOKIE_SESSION_ID_IDENTIFIER +
          "=" +
          result.sessionId +
          "; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=None; Secure",
      );

      return result;
    }),
  logout: publicProcedure.mutation(({ ctx }) => {
    ctx.res.header(
      "Set-Cookie",
      COOKIE_SESSION_ID_IDENTIFIER +
        "=; HttpOnly; Path=/; Max-Age=0; SameSite=None; Secure",
    );
    return { success: true };
  }),
});
