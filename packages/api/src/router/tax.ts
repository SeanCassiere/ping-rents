import {
  CreateNewTaxSchema,
  GetTaxesSchema,
  UpdateTaxSchema,
} from "@acme/validator/src/tax";

import { TaxLogic } from "../logic/tax";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const taxesRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(GetTaxesSchema)
    .query(async ({ ctx, input }) => {
      return await TaxLogic.getAll(ctx.user, input);
    }),
  create: protectedProcedure
    .input(CreateNewTaxSchema)
    .mutation(async ({ ctx, input }) => {
      return await TaxLogic.create(ctx.user, input);
    }),
  updateById: protectedProcedure
    .input(UpdateTaxSchema)
    .mutation(async ({ ctx, input }) => {
      return await TaxLogic.updateById(ctx.user, input);
    }),
});
