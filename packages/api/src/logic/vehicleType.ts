import { prisma } from "@acme/db";
import type {
  InputCreateVehicleType,
  InputUpdateVehicleType,
} from "@acme/validator/src/vehicleType";

import type { AuthMetaUser } from "../trpc";

class VehicleTypeController {
  public async getAll(user: AuthMetaUser) {
    return await prisma.vehicleType.findMany({
      where: { companyId: user.companyId },
    });
  }

  public async create(user: AuthMetaUser, payload: InputCreateVehicleType) {
    const vehicleType = await prisma.vehicleType.create({
      data: {
        name: payload.name,
        company: { connect: { id: user.companyId } },
      },
    });
    return vehicleType;
  }

  public async updateById(user: AuthMetaUser, payload: InputUpdateVehicleType) {
    const updated = await prisma.vehicleType.update({
      where: {
        companyId_id: {
          companyId: user.companyId,
          id: payload.vehicleTypeId,
        },
      },
      data: {
        name: payload.name,
      },
    });

    return updated;
  }
}

export const VehicleTypeLogic = new VehicleTypeController();
