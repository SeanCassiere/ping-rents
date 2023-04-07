import { prisma, type EnumRentalStatus } from "@acme/db";
import {
  type InputCreateRental,
  type InputUpdateRental,
} from "@acme/validator/src/rental";

import { type AuthMetaUser } from "../trpc";
import { RateLogic } from "./rate";
import { TaxLogic } from "./tax";
import { VehicleLogic } from "./vehicle";

type RentalType = "reservation" | "agreement";

type TaxType = NonNullable<Awaited<ReturnType<(typeof TaxLogic)["getById"]>>>;

class RentalController {
  async getAll(user: AuthMetaUser, type: RentalType) {
    return await prisma.rental.findMany({
      where: { type, companyId: user.companyId },
      orderBy: { createdAt: "desc" },
      include: {
        vehicleType: {
          select: { id: true, name: true },
        },
        vehicle: {
          select: {
            id: true,
            vin: true,
            licensePlate: true,
            make: true,
            model: true,
            year: true,
          },
        },
        customer: {
          select: { id: true, firstName: true, lastName: true },
        },
        checkoutLocation: {
          select: { id: true, name: true },
        },
        checkinLocation: {
          select: { id: true, name: true },
        },
        returnLocation: {
          select: { id: true, name: true },
        },
        reservation: {
          select: { id: true },
        },
        agreement: {
          select: { id: true },
        },
      },
    });
  }

  async createRental(
    user: AuthMetaUser,
    { type, status }: { type: RentalType; status: EnumRentalStatus },
    payload: InputCreateRental,
  ) {
    const rate = await RateLogic.getById(user, { id: payload.rate.id });
    const vehicle = await VehicleLogic.getById(user, { id: payload.vehicleId });

    if (rate.vehicleTypeId !== vehicle.vehicleTypeId) {
      throw new Error(
        "Rate vehicle-type and Vehicle vehicle-type do not match.",
      );
    }

    const taxesList: TaxType[] = [];
    for (const taxId of payload.taxIdList) {
      const tax = await TaxLogic.getById(user, { id: taxId });
      if (tax) {
        taxesList.push(tax);
      }
    }

    return await prisma.$transaction(async (tx) => {
      // set reservation status to checkout for agreement checkouts
      if (type === "agreement" && payload.reservationId) {
        const reservation = await tx.rental.findFirst({
          where: { id: payload.reservationId },
        });

        if (!reservation) {
          throw new Error("Reservation not found.");
        }

        if (reservation?.status === "checkout") {
          throw new Error("Reservation already checked out.");
        }

        await tx.rental.update({
          where: { id: reservation.id },
          data: { status: "checkout" },
        });
      }

      const rental = await tx.rental.create({
        data: {
          type,
          status,
          checkoutDate: payload.checkoutDate,
          checkinDate: payload.checkinDate,
          returnDate: payload.returnDate,

          company: { connect: { id: user.companyId } },

          ...(type === "agreement" && payload.reservationId
            ? { reservation: { connect: { id: payload.reservationId } } }
            : {}),

          checkoutLocation: { connect: { id: payload.checkoutLocationId } },
          checkinLocation: { connect: { id: payload.checkinLocationId } },
          returnLocation: { connect: { id: payload.returnLocationId } },
          vehicleType: { connect: { id: vehicle.vehicleTypeId } },
          vehicle: { connect: { id: payload.vehicleId } },
          customer: { connect: { id: payload.customerId } },
          rate: {
            create: {
              name: rate.name,
              dailyRate: payload.rate.dailyRate,
              calculationType: rate.calculationType,
              accessType: "rental",
              location: { connect: { id: payload.checkoutLocationId } },
              vehicleType: { connect: { id: rate.vehicleTypeId } },
              company: { connect: { id: user.companyId } },
              parent: { connect: { id: rate.id } },
            },
          },
          rentalTaxes: {
            create: taxesList.map((tax) => ({
              name: tax.name,
              value: tax.value,
              calculationType: tax.calculationType,
              location: { connect: { id: tax.locationId } },
              company: { connect: { id: user.companyId } },
              parent: { connect: { id: tax.id } },
              accessType: "rental",
            })),
          },
        },
      });

      return rental;
    });
  }

  async getById(user: AuthMetaUser, type: RentalType, payload: { id: string }) {
    return await prisma.rental.findFirstOrThrow({
      where: { id: payload.id, companyId: user.companyId, type },
      include: {
        vehicleType: {
          select: { id: true, name: true },
        },
        vehicle: {
          select: {
            id: true,
            vin: true,
            licensePlate: true,
            make: true,
            model: true,
            year: true,
          },
        },
        customer: {
          select: { id: true, firstName: true, lastName: true },
        },
        checkoutLocation: {
          select: { id: true, name: true },
        },
        checkinLocation: {
          select: { id: true, name: true },
        },
        returnLocation: {
          select: { id: true, name: true },
        },
        rentalTaxes: {
          select: {
            id: true,
            name: true,
            value: true,
            calculationType: true,
            parentId: true,
          },
        },
        rate: {
          select: {
            id: true,
            name: true,
            dailyRate: true,
            accessType: true,
            calculationType: true,
            parentId: true,
          },
        },
      },
    });
  }

  async updateById(
    user: AuthMetaUser,
    type: RentalType,
    payload: InputUpdateRental,
  ) {
    return await prisma.$transaction(async (tx) => {
      const rental = await tx.rental.findFirst({
        where: { companyId: user.companyId, id: payload.id },
        include: {
          rate: { select: { vehicleTypeId: true } },
        },
      });
      if (!rental) {
        throw new Error(`Rental not found for id: ${payload.id}`);
      }

      const vehicle = await tx.vehicle.findFirst({
        where: { companyId: user.companyId, id: payload.vehicleId },
      });
      if (!vehicle) {
        throw new Error(`Vehicle not found for id: ${payload.vehicleId}`);
      }

      if (rental.rate.vehicleTypeId !== vehicle.vehicleTypeId) {
        throw new Error(
          "Rate vehicle-type and Vehicle vehicle-type do not match.",
        );
      }

      return await tx.rental.update({
        where: { companyId_id: { companyId: user.companyId, id: payload.id } },
        data: {
          type,
          returnDate: payload.returnDate,
          checkoutDate: payload.checkoutDate,
          checkinDate: payload.checkinDate,
          rate: {
            update: {
              dailyRate: payload.rate.dailyRate,
            },
          },
          customer: { connect: { id: payload.customerId } },
          vehicle: { connect: { id: payload.vehicleId } },
        },
      });
    });
  }
}

export const RentalLogic = new RentalController();
