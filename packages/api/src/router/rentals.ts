import { z } from "@acme/validator";
import {
  CreateRentalSchema,
  RentalCalculationSchema,
  UpdateRentalSchema,
} from "@acme/validator/src/rental";

import { CalculationLogic } from "../logic/calculation";
import { RentalLogic } from "../logic/rental";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const rentalsRouter = createTRPCRouter({
  calculate: protectedProcedure
    .input(RentalCalculationSchema)
    .query(async ({ ctx, input }) => {
      return await CalculationLogic.getLiveCalculation(ctx.user, input);
    }),
  getAgreements: protectedProcedure.query(async ({ ctx }) => {
    return await RentalLogic.getAll(ctx.user, "agreement");
  }),
  getAgreement: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await RentalLogic.getById(ctx.user, "agreement", input);
    }),
  getAgreementSummary: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await CalculationLogic.getCalculationByRentalId(
        ctx.user,
        "agreement",
        input,
      );
    }),
  createAgreement: protectedProcedure
    .input(CreateRentalSchema)
    .mutation(async ({ ctx, input }) => {
      return await RentalLogic.createRental(
        ctx.user,
        { type: "agreement", status: "open" },
        input,
      );
    }),
  updateAgreement: protectedProcedure
    .input(UpdateRentalSchema)
    .mutation(async ({ ctx, input }) => {
      return await RentalLogic.updateById(ctx.user, "agreement", input);
    }),
  getReservations: protectedProcedure.query(async ({ ctx }) => {
    return await RentalLogic.getAll(ctx.user, "reservation");
  }),
  getReservation: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await RentalLogic.getById(ctx.user, "reservation", input);
    }),
  getReservationSummary: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await CalculationLogic.getCalculationByRentalId(
        ctx.user,
        "reservation",
        input,
      );
    }),
  createReservation: protectedProcedure
    .input(CreateRentalSchema)
    .mutation(async ({ ctx, input }) => {
      return await RentalLogic.createRental(
        ctx.user,
        { type: "reservation", status: "open" },
        input,
      );
    }),
  updateReservation: protectedProcedure
    .input(UpdateRentalSchema)
    .mutation(async ({ ctx, input }) => {
      return await RentalLogic.updateById(ctx.user, "reservation", input);
    }),
});
