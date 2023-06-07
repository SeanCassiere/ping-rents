import { AuthService } from "@acme/auth";
import { RegisterNewCompanyAndAccountSchema } from "@acme/validator";

import { CustomerLogic } from "../logic/customer";
import { RateLogic } from "../logic/rate";
import { TaxLogic } from "../logic/tax";
import { VehicleLogic } from "../logic/vehicle";
import { VehicleTypeLogic } from "../logic/vehicleType";
import { createTRPCRouter, publicProcedure } from "../trpc";

const VehicleDetails = [
  {
    make: "BMW",
    model: "745 Series",
    licensePlate: "8BY-L605",
    vin: "WBAVB13506PT22180",
    odometer: 300,
    color: "Blue",
    year: "2005",
  },
  {
    make: "LAND ROVER",
    model: "DISCOVERY",
    licensePlate: "107-506L",
    vin: "1B7EZ64B7CD289921",
    odometer: 450,
    color: "Reed",
    year: "2009",
  },
  {
    make: "MAZDA",
    model: "MILLENIA",
    licensePlate: "8CP-P636",
    vin: "1FUJBGAN04HM86987",
    odometer: 210,
    color: "Green",
    year: "2015",
  },
] as const;
const Taxes = [{ name: "GST", value: 5.0 }] as const;
const Customers = [
  {
    firstName: "Terry",
    lastName: "Andrews",
    email: "terry.andrews@pingstash.com",
  },
  {
    firstName: "Belinda",
    lastName: "Johnson",
    email: "b.johnson@pingstash.com",
  },
  {
    firstName: "Aaron",
    lastName: "Rodgers",
    email: "a.rodgers@pingstash.com",
  },
];
const VehicleTypes = [{ name: "Sedan" }, { name: "Compact" }] as const; // do not increase this
const BaseRates = [
  { name: "base", dailyRate: 10 },
  { name: "base", dailyRate: 20 },
] as const;

export const devRouter = createTRPCRouter({
  seedForEmail: publicProcedure
    .input(RegisterNewCompanyAndAccountSchema)
    .mutation(async ({ input }) => {
      const start = new Date().getTime();
      let vehicleType1 = "";
      let vehicleType2 = "";

      try {
        const user = await AuthService.registerNewCompanyAndAccount(input);

        // create taxes
        for (const tax of Taxes) {
          await TaxLogic.create(user, {
            ...tax,
            locationId: user.locationId,
            calculationType: "percentage",
          });
        }

        // create vehicle types
        for (let index = 0; index < VehicleTypes.length; index++) {
          const vehicleType = VehicleTypes[index];
          const type = await VehicleTypeLogic.create(user, {
            name: vehicleType.name,
          });

          if (vehicleType1) {
            vehicleType2 = type.id;
          } else {
            vehicleType1 = type.id;
          }
        }

        // create base rates for the vehicle types
        for (let index = 0; index < BaseRates.length; index++) {
          const baseRate = BaseRates[index];
          const useVehicleType2 = index % 2 === 0;
          await RateLogic.createParent(user, {
            name: baseRate.name,
            dailyRate: baseRate.dailyRate,
            calculationType: "retail",
            vehicleTypeId: useVehicleType2 ? vehicleType2 : vehicleType1,
            locationId: user.locationId,
            accessType: "config",
          });
        }

        // create vehicles
        for (let index = 0; index < VehicleDetails.length; index++) {
          const vehicle = VehicleDetails[index];
          const useVehicleType2 = index % 2 === 0;
          await VehicleLogic.create(user, {
            make: vehicle.make,
            model: vehicle.model,
            licensePlate: vehicle.licensePlate,
            vin: vehicle.vin,
            currentOdometer: vehicle.odometer,
            year: vehicle.year,
            color: vehicle.color,
            currentLocationId: user.locationId,
            typeId: useVehicleType2 ? vehicleType2 : vehicleType1,
          });
        }

        // create customers
        for (const customer of Customers) {
          await CustomerLogic.create(user, customer);
        }
      } catch (error) {
        const end = new Date().getTime();
        return {
          success: false,
          message: error instanceof Error ? error.message : "Unknown error",
          time: end - start,
        };
      }

      const end = new Date().getTime();
      return { success: true, message: "Created!", time: end - start };
    }),
});
