import { Prisma, prisma } from "@acme/db";
import type {
  InputCreateVehicle,
  InputGetAllVehicles,
  InputUpdateVehicle,
} from "@acme/validator";

// https://github.com/amirhosseinkhodaei/CarCompaniesWithModels/blob/master/companyWithModel.json
import makesAndModelsDataset from "../static/cars_makes_and_models.json";
import type { AuthMetaUser } from "../trpc";

const unique_VIN_COMPANY_KEY_INDEX =
  "Unique constraint failed on the constraint: `Vehicle_vin_companyId_key`";
const unique_LICENSE_PLAY_COMPANY_KEY_INDEX =
  "Unique constraint failed on the constraint: `Vehicle_licensePlate_companyId_key`";

class VehicleController {
  /**
   *
   * @param user User context data from the request
   * @param makeId Make ID of the vehicle
   * @returns displayName of the make
   */
  private getDisplayMakeName(
    _: Omit<AuthMetaUser, "grantId">,
    makeId: string,
  ): string {
    return makeId;
  }

  /**
   *
   * @param user User context data from the request
   * @param makeId Make ID of the vehicle
   * @param modelId Model ID of the vehicle in relation to the make
   * @returns displayName of the model
   */
  private getDisplayModelName(
    _: Omit<AuthMetaUser, "grantId">,
    __: string,
    modelId: string,
  ): string {
    return modelId;
  }

  public async getMakes(_: AuthMetaUser) {
    return makesAndModelsDataset
      .map((dataSet) => dataSet.company)
      .sort((a, b) => a.localeCompare(b))
      .map((make) => ({ id: make, displayMake: make }));
  }

  public async getModels(_: AuthMetaUser, company: string) {
    const filtered = makesAndModelsDataset
      .filter((dataSet) => dataSet.company === company)
      .map((dataSet) => dataSet.model)
      .reduce((prev, curr) => {
        return [...prev, ...curr];
      }, [] as string[])
      .sort((a, b) => a.localeCompare(b))
      .map((model) => ({
        id: model,
        displayMake: company,
        displayModel: model,
      }));
    return filtered;
  }

  public async getAll(user: AuthMetaUser, payload: InputGetAllVehicles) {
    const vehicles = await prisma.vehicle.findMany({
      where: {
        companyId: user.companyId,
        ...(payload.status ? { status: payload.status } : {}),
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
    return vehicles.map((vehicle) => ({
      ...vehicle,
      displayMake: this.getDisplayMakeName(user, vehicle.make),
      displayModel: this.getDisplayModelName(user, vehicle.make, vehicle.model),
    }));
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
          currentOdometer: payload.currentOdometer,
          status: "available",
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

    return {
      ...vehicle,
      displayMake: this.getDisplayMakeName(user, payload.make),
      displayModel: this.getDisplayModelName(user, payload.make, payload.model),
    };
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

    return {
      ...vehicle,
      displayMake: this.getDisplayMakeName(user, vehicle.make),
      displayModel: this.getDisplayModelName(user, vehicle.make, vehicle.model),
    };
  }

  public async updateById(user: AuthMetaUser, payload: InputUpdateVehicle) {
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
        currentOdometer: input.currentOdometer,
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
    return {
      ...vehicle,
      displayMake: this.getDisplayMakeName(user, vehicle.make),
      displayModel: this.getDisplayModelName(user, vehicle.make, vehicle.model),
    };
  }
}

export const VehicleLogic = new VehicleController();
