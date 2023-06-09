import { authRouter } from "./router/auth";
import { companyRouter } from "./router/company";
import { customersRouter } from "./router/customer";
import { devRouter } from "./router/dev";
import { locationsRouter } from "./router/location";
import { ratesRouter } from "./router/rate";
import { rentalsRouter } from "./router/rentals";
import { statisticsRouter } from "./router/stats";
import { taxesRouter } from "./router/tax";
import { vehiclesRouter } from "./router/vehicle";
import { vehicleTypesRouter } from "./router/vehicleType";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  company: companyRouter,
  customer: customersRouter,
  location: locationsRouter,
  rate: ratesRouter,
  rental: rentalsRouter,
  stats: statisticsRouter,
  tax: taxesRouter,
  vehicle: vehiclesRouter,
  vehicleType: vehicleTypesRouter,
  dev: devRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
