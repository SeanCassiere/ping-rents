import { isBefore, isEqual } from "@acme/date-fns";

import { RateCalculationTypeEnum, RateSchema } from "./rate";
import { TaxCalculationTypeEnum } from "./tax";
import { z } from "./zod-project";

export const CreateRentalSchema = z
  .object({
    reservationId: z.string().nullable(),

    checkoutLocationId: z.string().min(1),
    checkoutDate: z.date(),

    checkinLocationId: z.string().min(1),
    checkinDate: z.date(),

    returnLocationId: z.string().min(1),
    returnDate: z.date(),

    rate: RateSchema.extend({ id: z.string() }),
    taxIdList: z.array(z.string().min(1)),

    vehicleId: z.string().min(1),
    customerId: z.string().min(1),

    odometerOut: z.number().min(0),
  })
  .superRefine((payload, ctx) => {
    if (
      isBefore(payload.checkinDate, payload.checkoutDate) ||
      isEqual(payload.checkinDate, payload.checkoutDate)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Must be after checkout date",
        path: ["checkinDate"],
      });
    }

    if (
      isBefore(payload.returnDate, payload.checkoutDate) ||
      isEqual(payload.returnDate, payload.checkoutDate)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Must be after checkout date",
        path: ["returnDate"],
      });
    }
  });
export type InputCreateRental = z.infer<typeof CreateRentalSchema>;

export const UpdateRentalSchema = z
  .object({
    id: z.string().min(1),

    checkoutDate: z.date(),
    checkinDate: z.date(),
    returnDate: z.date(),

    rate: RateSchema,

    vehicleId: z.string().min(1),
    customerId: z.string().min(1),

    odometerOut: z.number().min(0),
  })
  .superRefine((payload, ctx) => {
    if (
      isBefore(payload.checkinDate, payload.checkoutDate) ||
      isEqual(payload.checkinDate, payload.checkoutDate)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Must be after checkout date",
        path: ["checkinDate"],
      });
    }

    if (
      isBefore(payload.returnDate, payload.checkoutDate) ||
      isEqual(payload.returnDate, payload.checkoutDate)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Must be after checkout date",
        path: ["returnDate"],
      });
    }
  });

export type InputUpdateRental = z.infer<typeof UpdateRentalSchema>;

export const CheckInRentalSchema = z
  .object({
    id: z.string().min(1),

    checkoutDate: z.date(),
    checkinDate: z.date(),
    returnDate: z.date(),

    odometerOut: z.number().min(0),
    odometerIn: z.number().min(0),
  })
  .superRefine((payload, ctx) => {
    if (
      isBefore(payload.checkinDate, payload.checkoutDate) ||
      isEqual(payload.checkinDate, payload.checkoutDate)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Must be after checkout date",
        path: ["checkinDate"],
      });
    }

    if (
      isBefore(payload.returnDate, payload.checkoutDate) ||
      isEqual(payload.returnDate, payload.checkoutDate)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Must be after checkout date",
        path: ["returnDate"],
      });
    }

    if (payload.odometerIn < payload.odometerOut) {
      ctx.addIssue({
        code: "custom",
        message: "Must be greater than odometer out",
        path: ["odometerIn"],
      });
    }
  });

export type InputCheckInRental = z.infer<typeof CheckInRentalSchema>;

export const RentalCalculationSchema = z
  .object({
    checkoutDate: z.date(),
    checkinDate: z.date(),
    returnDate: z.date(),

    rate: RateSchema.extend({ calculationType: RateCalculationTypeEnum }),

    taxes: z.array(
      z.object({
        name: z.string(),
        calculationType: TaxCalculationTypeEnum,
        value: z.number(),
      }),
    ),

    amountPaid: z.number(),
    isCheckIn: z.boolean(),
  })
  .superRefine((payload, ctx) => {
    if (
      isBefore(payload.checkinDate, payload.checkoutDate) ||
      isEqual(payload.checkinDate, payload.checkoutDate)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Must be after checkout date",
        path: ["checkinDate"],
      });
    }

    if (
      isBefore(payload.returnDate, payload.checkoutDate) ||
      isEqual(payload.returnDate, payload.checkoutDate)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Must be after checkout date",
        path: ["returnDate"],
      });
    }
  });

export type InputRentalCalculation = z.infer<typeof RentalCalculationSchema>;
