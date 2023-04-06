import {
  CreateCustomerSchema,
  UpdateCustomerSchema,
} from "@acme/validator/src/customer";

import { CustomerLogic } from "../logic/customer";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const customersRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    return CustomerLogic.getAll(ctx.user);
  }),
  create: protectedProcedure
    .input(CreateCustomerSchema)
    .mutation(async ({ ctx, input }) => {
      return await CustomerLogic.create(ctx.user, input);
    }),
  updateById: protectedProcedure
    .input(UpdateCustomerSchema)
    .mutation(async ({ ctx, input }) => {
      return await CustomerLogic.updateById(ctx.user, input);
    }),
});
