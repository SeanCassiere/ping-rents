import { prisma } from "@acme/db";
import {
  type InputCreateNewRate,
  type InputUpdateRate,
} from "@acme/validator/src/rate";

import type { AuthMetaUser } from "../trpc";

type AccessType = "config" | "rental";

class RateController {
  public async getAll(
    user: AuthMetaUser,
    payload: { locationId: string; accessType: AccessType },
  ) {
    return await prisma.rate.findMany({
      where: {
        locationId: payload.locationId,
        companyId: user.companyId,
        accessType: payload.accessType,
      },
      orderBy: { createdAt: "asc" },
      include: {
        vehicleType: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  public async getById(user: AuthMetaUser, payload: { id: string }) {
    const { accessType, parentId, ...rate } =
      await prisma.rate.findFirstOrThrow({
        where: {
          id: payload.id,
          companyId: user.companyId,
        },
      });
    return rate;
  }

  public async createParent(
    user: AuthMetaUser,
    payload: InputCreateNewRate & { accessType: AccessType },
  ) {
    if (payload.accessType === "config") {
      const existingRate = await prisma.rate.findMany({
        where: {
          name: payload.name,
          companyId: user.companyId,
          vehicleTypeId: payload.vehicleTypeId,
        },
      });
      if (existingRate.length) {
        throw new Error("Rate already exists for this vehicle type.");
      }
    }

    return await prisma.rate.create({
      data: {
        name: payload.name,
        dailyRate: payload.dailyRate,
        calculationType: payload.calculationType,
        accessType: payload.accessType,
        location: { connect: { id: payload.locationId } },
        vehicleType: { connect: { id: payload.vehicleTypeId } },
        company: { connect: { id: user.companyId } },
      },
    });
  }

  public async createChild(
    user: Omit<AuthMetaUser, "userId">,
    payload: InputCreateNewRate & {
      accessType: Exclude<AccessType, "config">;
      parentId: string;
    },
  ) {
    return await prisma.rate.create({
      data: {
        name: payload.name,
        dailyRate: payload.dailyRate,
        calculationType: payload.calculationType,
        accessType: payload.accessType,
        location: { connect: { id: payload.locationId } },
        vehicleType: { connect: { id: payload.vehicleTypeId } },
        company: { connect: { id: user.companyId } },
        parent: { connect: { id: payload.parentId } },
      },
    });
  }

  public async updateById(user: AuthMetaUser, payload: InputUpdateRate) {
    return await prisma.rate.update({
      where: { companyId_id: { companyId: user.companyId, id: payload.id } },
      data: {
        name: payload.name,
        calculationType: payload.calculationType,
        dailyRate: payload.dailyRate,
      },
    });
  }
}

export const RateLogic = new RateController();
