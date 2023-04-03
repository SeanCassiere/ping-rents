import {
  CreateNewTaxSchema,
  GetTaxesSchema,
  UpdateTaxSchema,
} from "@acme/validator/src/tax";

import { TaxLogic } from "../logic/tax";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const taxesRouter = createTRPCRouter({
  getTaxes: protectedProcedure
    .input(GetTaxesSchema)
    .query(async ({ ctx, input }) => {
      return await TaxLogic.getTaxes(ctx.user, input);
    }),
  createTax: protectedProcedure
    .input(CreateNewTaxSchema)
    .mutation(async ({ ctx, input }) => {
      return await TaxLogic.createTaxForLocation(ctx.user, input);
    }),
  updateTax: protectedProcedure
    .input(UpdateTaxSchema)
    .mutation(async ({ ctx, input }) => {
      return await TaxLogic.updateTaxForLocation(ctx.user, input);
    }),
});
