// import { add } from "date-fns";
import {
  CheckInRentalSchema,
  CreateNoteForRentalSchema,
  CreateRentalSchema,
  RentalCalculationSchema,
  UpdateNoteSchema,
  UpdateRentalSchema,
  z,
} from "@acme/validator";

import { CalculationLogic } from "../logic/calculation";
import { NoteLogic } from "../logic/note";
import { RentalLogic } from "../logic/rental";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const IdInputSchema = z.object({ id: z.string() });
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
    .input(IdInputSchema)
    .query(async ({ ctx, input }) => {
      // const now = new Date();
      // const checkinDate = add(now, { days: 3 });
      // await RentalLogic.createRental(
      //   ctx.user,
      //   { type: "agreement", status: "on_rent" },
      //   {
      //     reservationId: null,
      //     checkoutLocationId: "cliherrbb0002fy2kcjm3reys",
      //     checkinLocationId: "cliherrbb0002fy2kcjm3reys",
      //     returnLocationId: "cliherrbb0002fy2kcjm3reys",
      //     checkoutDate: now,
      //     checkinDate: checkinDate,
      //     returnDate: checkinDate,
      //     taxIdList: ["cliheu0sw000kfy2ko1z2lwj0"],
      //     vehicleId: "clihewj50000ofy2k4xdfdptl",
      //     rate: { id: "clihetcq5000gfy2k5ukjy9mj", dailyRate: 10 },
      //     customerId: "cliheufmd000mfy2kratuug2i",
      //     odometerOut: 910,
      //   },
      // );
      return await RentalLogic.getById(ctx.user, "agreement", input);
    }),
  getAgreementSummary: protectedProcedure
    .input(IdInputSchema)
    .query(async ({ ctx, input }) => {
      return await CalculationLogic.getCalculationByRentalId(
        ctx.user,
        "agreement",
        input,
      );
    }),
  getAgreementNotes: protectedProcedure
    .input(IdInputSchema)
    .query(async ({ ctx, input }) => {
      return await NoteLogic.getNotesForRental(ctx.user, "agreement", input.id);
    }),
  createAgreement: protectedProcedure
    .input(CreateRentalSchema)
    .mutation(async ({ ctx, input }) => {
      return await RentalLogic.createRental(
        ctx.user,
        { type: "agreement", status: "on_rent" },
        input,
      );
    }),
  createAgreementNote: protectedProcedure
    .input(CreateNoteForRentalSchema)
    .mutation(async ({ ctx, input }) => {
      return await NoteLogic.createNoteForRental(ctx.user, "agreement", input);
    }),
  updateAgreement: protectedProcedure
    .input(UpdateRentalSchema)
    .mutation(async ({ ctx, input }) => {
      return await RentalLogic.updateById(ctx.user, "agreement", input);
    }),
  updateAgreementNote: protectedProcedure
    .input(UpdateNoteSchema)
    .mutation(async ({ ctx, input }) => {
      return await NoteLogic.updateNote(ctx.user, input);
    }),
  checkinAgreement: protectedProcedure
    .input(CheckInRentalSchema)
    .mutation(async ({ ctx, input }) => {
      return await RentalLogic.checkInAgreement(ctx.user, input);
    }),
  closeAgreement: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return await RentalLogic.closeAgreement(ctx.user, input);
    }),
  getReservations: protectedProcedure.query(async ({ ctx }) => {
    return await RentalLogic.getAll(ctx.user, "reservation");
  }),
  getReservation: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // const now = add(new Date(), { hours: 9 });
      // const checkinDate = add(now, { days: 3 });
      // await RentalLogic.createRental(
      //   ctx.user,
      //   { type: "reservation", status: "open" },
      //   {
      //     reservationId: null,
      //     checkoutLocationId: "cliherrbb0002fy2kcjm3reys",
      //     checkinLocationId: "cliherrbb0002fy2kcjm3reys",
      //     returnLocationId: "cliherrbb0002fy2kcjm3reys",
      //     checkoutDate: now,
      //     checkinDate: checkinDate,
      //     returnDate: checkinDate,
      //     taxIdList: ["cliheu0sw000kfy2ko1z2lwj0"],
      //     vehicleId: "clihewj50000ofy2k4xdfdptl",
      //     rate: { id: "clihetcq5000gfy2k5ukjy9mj", dailyRate: 12 },
      //     customerId: "cliheufmd000mfy2kratuug2i",
      //     odometerOut: 910,
      //   },
      // );
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
