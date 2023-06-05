import { CreateCustomerSchema, UpdateCustomerSchema, z } from "@acme/validator";

import { CustomerLogic } from "../logic/customer";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const customersRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    return CustomerLogic.getAll(ctx.user);
  }),

  getCustomer: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await CustomerLogic.getById(ctx.user, { customerId: input.id });
    }),

  create: protectedProcedure
    .input(CreateCustomerSchema)
    .mutation(async ({ ctx, input }) => {
      return await CustomerLogic.create(ctx.user, input);
    }),
  update: protectedProcedure
    .input(UpdateCustomerSchema)
    .mutation(async ({ ctx, input }) => {
      return await CustomerLogic.updateById(ctx.user, input);
    }),
});
