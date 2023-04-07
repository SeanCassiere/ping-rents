import { isBefore, isEqual } from "@acme/date-fns";

import { RateSchema } from "./rate";
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

export type InputCheckInRental = z.infer<typeof CheckInRentalSchema>;
