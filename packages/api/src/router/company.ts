import { TRPCError } from "@trpc/server";

import { AuthService } from "@acme/auth";
import { z } from "@acme/validator";
import { AddUserToCompanySchema } from "@acme/validator/src/company";

import { CompanyLogic } from "../logic/company";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const companyRouter = createTRPCRouter({
  addEmployee: protectedProcedure
    .input(AddUserToCompanySchema)
    .mutation(async ({ ctx, input }) => {
      const currentUser = await AuthService.getUserMetadata(ctx.user.grantId);
      if (!currentUser) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: `Could not find the user for grantId: ${ctx.user.grantId}`,
        });
      }
      if (currentUser.isOwner || currentUser.role === "admin") {
        return await CompanyLogic.createGrantForAccount(ctx.user, input);
      } else {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: `User does not have permission to add employees to the company`,
        });
      }
    }),
  removeEmployee: protectedProcedure
    .input(z.object({ accountId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const currentUser = await AuthService.getUserMetadata(ctx.user.grantId);
      if (!currentUser) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: `Could not find the user for grantId: ${ctx.user.grantId}`,
        });
      }
      if (currentUser.isOwner || currentUser.role === "admin") {
        return await CompanyLogic.revokeGrantFromCompany(
          ctx.user,
          input.accountId,
        );
      } else {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: `User does not have permission to remove employees from the company`,
        });
      }
    }),
});
