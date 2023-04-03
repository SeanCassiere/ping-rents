import { TRPCError } from "@trpc/server";

import { AuthService } from "@acme/auth";
import { z } from "@acme/validator";
import { RegisterNewCompanyAndAccountSchema } from "@acme/validator/src/auth";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const authRouter = createTRPCRouter({
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.user;
  }),
  getSecretMessage: protectedProcedure.query(() => {
    // testing type validation of overridden next-auth Session in @acme/auth package
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
});
