import { prisma } from "./index";

const MainOfficeName = "Main Office";

const CompanyNames = ["New company 1"] as const;
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

async function createCompanySeedData(
  companyName: string,
): Promise<{ success: boolean }> {
  const result = await prisma.$transaction(async (tx) => {
    let companyId = "";
    let accountId = "";
    let locationId = "";
    let vehicleType1 = "";
    let vehicleType2 = "";

    // create a company
    const company = await tx.company.create({ data: { name: companyName } });
    companyId = company.id;

    const email = "sean.cassiere@gmail.com";
    // create the account
    const existingAccount = await tx.account.findFirst({ where: { email } });
    if (existingAccount) {
      accountId = existingAccount.id;
    } else {
      const newAccount = await tx.account.create({
        data: { email },
      });
      accountId = newAccount.id;
    }

    // create the connections between accounts and
    await tx.companyAccountConnection.create({
      data: {
        account: { connect: { id: accountId } },
        company: { connect: { id: companyId } },
        role: "admin",
        isOwner: true,
        name: "Sean Cassiere",
      },
    });

    // create the main office
    const mainOffice = await tx.location.create({
      data: {
        name: MainOfficeName,
        company: { connect: { id: companyId } },
      },
    });
    locationId = mainOffice.id;

    // create taxes for the location
    for (const tax of Taxes) {
      await tx.tax.create({
        data: {
          name: tax.name,
          value: tax.value,
          calculationType: "percentage",
          location: { connect: { id: locationId } },
          company: { connect: { id: companyId } },
          accessType: "config",
        },
      });
    }

    // create vehicle types for the location
    for (let index = 0; index < VehicleTypes.length; index++) {
      const vehicleType = VehicleTypes[index];
      const type = await tx.vehicleType.create({
        data: {
          name: vehicleType.name,
          company: { connect: { id: companyId } },
        },
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
      await tx.rate.create({
        data: {
          name: baseRate.name,
          dailyRate: baseRate.dailyRate,
          calculationType: "retail",
          vehicleType: {
            connect: { id: useVehicleType2 ? vehicleType2 : vehicleType1 },
          },
          location: { connect: { id: locationId } },
          company: { connect: { id: companyId } },
          accessType: "config",
        },
      });
    }

    // create vehicles
    for (let index = 0; index < VehicleDetails.length; index++) {
      const vehicle = VehicleDetails[index];
      const useVehicleType2 = index % 2 === 0;
      await tx.vehicle.create({
        data: {
          make: vehicle.make,
          model: vehicle.model,
          licensePlate: vehicle.licensePlate,
          vin: vehicle.vin,
          currentOdometer: vehicle.odometer,
          year: vehicle.year,
          color: vehicle.color,
          status: "available",
          company: { connect: { id: companyId } },
          vehicleType: {
            connect: { id: useVehicleType2 ? vehicleType2 : vehicleType1 },
          },
          currentLocation: { connect: { id: locationId } },
        },
      });
    }

    // create customers
    for (const customer of Customers) {
      await tx.customer.create({
        data: {
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          company: { connect: { id: companyId } },
        },
      });
    }

    return { success: true };
  });

  return result;
}

async function main() {
  const start = new Date();
  console.log("🙌🏼 Seeding database...");
  for (const name of CompanyNames) {
    await createCompanySeedData(name);
  }
  const end = new Date();
  console.log(
    `🎉 Seeding complete. Took ${end.getTime() - start.getTime()}ms ⌛️`,
  );
}

void main();
