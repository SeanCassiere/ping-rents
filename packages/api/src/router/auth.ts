import { TRPCError } from "@trpc/server";

import { AuthService } from "@acme/auth";
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
  registerCompanyAndAccount: publicProcedure
    .input(RegisterNewCompanyAndAccountSchema)
    .mutation(async ({ input }) => {
      try {
        const registrationDetails =
          await AuthService.registerNewCompanyAndAccount(input);

        return registrationDetails;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }
    }),
});
