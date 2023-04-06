import { TRPCError } from "@trpc/server";

import { AuthService } from "@acme/auth";
import { z } from "@acme/validator";
import {
  AddUserToCompanySchema,
  UpdateCompanyInformationSchema,
} from "@acme/validator/src/company";

import { CompanyLogic } from "../logic/company";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const companyRouter = createTRPCRouter({
  update: protectedProcedure
    .input(UpdateCompanyInformationSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await AuthService.getUserMetadata(ctx.user.grantId);
      if (!user || user.isOwner === false) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You do not have permission to update company information",
        });
      }

      return await CompanyLogic.updateCompanyInformation(ctx.user, input);
    }),
  addEmployee: protectedProcedure
    .input(AddUserToCompanySchema)
    .mutation(async ({ ctx, input }) => {
      const userIsAdmin = await AuthService.userIsAdmin(ctx.user.grantId);
      if (!userIsAdmin) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You do not have permission to add employees",
        });
      }

      return await CompanyLogic.createGrantForAccount(ctx.user, input);
    }),
  removeEmployee: protectedProcedure
    .input(z.object({ accountId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userIsAdmin = await AuthService.userIsAdmin(ctx.user.grantId);
      if (!userIsAdmin) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You do not have permission to remove employees",
        });
      }

      return await CompanyLogic.revokeGrantFromCompany(
        ctx.user,
        input.accountId,
      );
    }),
});
