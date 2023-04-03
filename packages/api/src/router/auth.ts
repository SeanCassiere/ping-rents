import { TRPCError } from "@trpc/server";

import { AuthService } from "@acme/auth";
import { z } from "@acme/validator";
import {
  COOKIE_SESSION_ID_IDENTIFIER,
  LoginWithCompanyAndUserSchema,
  RegisterNewCompanyAndAccountSchema,
} from "@acme/validator/src/auth";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const authRouter = createTRPCRouter({
  registerCompanyAndAccount: publicProcedure
    .input(RegisterNewCompanyAndAccountSchema)
    .mutation(async ({ input }) => {
      try {
        return await AuthService.registerNewCompanyAndAccount(input);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: (error as any)?.message ?? "Something went wrong", // eslint-disable-line
        });
      }
    }),
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.user;
  }),
  getSecretMessage: protectedProcedure.query(() => {
    return "you can see this secret message!";
  }),
  getProtectedUser: protectedProcedure.query(({ ctx }) => {
    return ctx.user;
  }),
  initEmailLoginWithMagicLink: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      try {
        const result = await AuthService.initEmailLoginWithMagicLink(
          input.email,
        );
        return result;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: (error as any)?.message ?? "Something went wrong", // eslint-disable-line
        });
      }
    }),
  getPossibleLoginCompaniesForAccessCode: publicProcedure
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
          message: (error as any)?.message ?? "Something went wrong", // eslint-disable-line
        });
      }
    }),
  loginWithAccessCode: publicProcedure
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
          message: (error as any)?.message ?? "Something went wrong", // eslint-disable-line
        });
      }
    }),
  logout: publicProcedure.mutation(({ ctx }) => {
    ctx.res.clearCookie(COOKIE_SESSION_ID_IDENTIFIER);
    return { success: true };
  }),
});
