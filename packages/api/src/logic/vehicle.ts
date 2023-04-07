import { Prisma, prisma } from "@acme/db";
import type {
  InputCreateVehicle,
  InputUpdateVehicle,
} from "@acme/validator/src/vehicle";

// https://github.com/amirhosseinkhodaei/CarCompaniesWithModels/blob/master/companyWithModel.json
import makesAndModelsDataset from "../static/cars_makes_and_models.json";
import type { AuthMetaUser } from "../trpc";

const unique_VIN_COMPANY_KEY_INDEX =
  "Unique constraint failed on the constraint: `Vehicle_vin_companyId_key`";
const unique_LICENSE_PLAY_COMPANY_KEY_INDEX =
  "Unique constraint failed on the constraint: `Vehicle_licensePlate_companyId_key`";

class VehicleController {
  public async getMakes(_: AuthMetaUser) {
    return makesAndModelsDataset
      .map((dataSet) => dataSet.company)
      .sort((a, b) => a.localeCompare(b));
  }

  public async getModels(_: AuthMetaUser, company: string): Promise<string[]> {
    const filtered: string[] = makesAndModelsDataset
      .filter((dataSet) => dataSet.company === company)
      .map((dataSet) => dataSet.model)
      .reduce((prev, curr) => {
        return [...prev, ...curr];
      }, [] as string[])
      .sort((a, b) => a.localeCompare(b));
    return filtered;
  }

  public async getAll(user: AuthMetaUser) {
    return prisma.vehicle.findMany({
      where: {
        companyId: user.companyId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        vehicleType: {
          select: {
            id: true,
            name: true,
          },
        },
        currentLocation: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  public async create(user: AuthMetaUser, payload: InputCreateVehicle) {
    const vehicle = await prisma.vehicle
      .create({
        data: {
          company: { connect: { id: user.companyId } },
          vehicleType: { connect: { id: payload.typeId } },
          currentLocation: { connect: { id: payload.currentLocationId } },
          make: payload.make,
          model: payload.model,
          year: payload.year,
          vin: payload.vin,
          licensePlate: payload.licensePlate,
          color: payload.color,
        },
        include: {
          vehicleType: {
            select: {
              id: true,
              name: true,
            },
          },
          currentLocation: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })
      .catch((err) => {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
          if (err.message.includes(unique_VIN_COMPANY_KEY_INDEX)) {
            throw new Error("VIN is already in use.");
          }
          if (err.message.includes(unique_LICENSE_PLAY_COMPANY_KEY_INDEX)) {
            throw new Error("License plate is already in use.");
          }
        } else {
          throw err;
        }
      });

    return vehicle;
  }

  public async getById(user: AuthMetaUser, { id }: { id: string }) {
    const vehicle = await prisma.vehicle.findFirst({
      where: { id, companyId: user.companyId },
      include: {
        vehicleType: {
          select: {
            id: true,
            name: true,
          },
        },
        currentLocation: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!vehicle) {
      throw new Error("Vehicle does not exist");
    }

    return vehicle;
  }

  public async updateById(_: AuthMetaUser, payload: InputUpdateVehicle) {
    const { id, ...input } = payload;
    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        vehicleType: { connect: { id: input.typeId } },
        currentLocation: { connect: { id: input.currentLocationId } },
        make: input.make,
        model: input.model,
        year: input.year,
        vin: input.vin,
        licensePlate: input.licensePlate,
        color: input.color,
      },
      include: {
        vehicleType: {
          select: {
            id: true,
            name: true,
          },
        },
        currentLocation: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return vehicle;
  }
}

export const VehicleLogic = new VehicleController();
