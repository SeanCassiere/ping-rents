import {
  CreateNewTaxSchema,
  GetTaxesSchema,
  UpdateTaxSchema,
  z,
} from "@acme/validator";

import { TaxLogic } from "../logic/tax";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const taxesRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(GetTaxesSchema)
    .query(async ({ ctx, input }) => {
      return await TaxLogic.getAll(ctx.user, input);
    }),
  getTax: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await TaxLogic.getById(ctx.user, input);
    }),
  create: protectedProcedure
    .input(CreateNewTaxSchema)
    .mutation(async ({ ctx, input }) => {
      return await TaxLogic.create(ctx.user, input);
    }),
  update: protectedProcedure
    .input(UpdateTaxSchema)
    .mutation(async ({ ctx, input }) => {
      return await TaxLogic.updateById(ctx.user, input);
    }),
});
