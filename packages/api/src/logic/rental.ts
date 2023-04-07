import { prisma, type EnumRentalStatus } from "@acme/db";
import { type InputCreateRental } from "@acme/validator/src/rental";

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

    return await prisma.rental.create({
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
          createMany: {
            data: taxesList.map((tax) => ({
              name: tax.name,
              calculationType: tax.calculationType,
              value: tax.value,
            })),
          },
        },
      },
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
          select: { name: true, value: true, calculationType: true },
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
}

export const RentalLogic = new RentalController();
