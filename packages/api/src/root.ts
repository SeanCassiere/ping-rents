import { agreementsRouter } from "./router/agreement";
import { authRouter } from "./router/auth";
import { companyRouter } from "./router/company";
import { customersRouter } from "./router/customer";
import { locationsRouter } from "./router/location";
import { ratesRouter } from "./router/rate";
import { reservationsRouter } from "./router/reservation";
import { taxesRouter } from "./router/tax";
import { vehiclesRouter } from "./router/vehicle";
import { vehicleTypesRouter } from "./router/vehicleType";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  agreements: agreementsRouter,
  company: companyRouter,
  customer: customersRouter,
  location: locationsRouter,
  rate: ratesRouter,
  reservation: reservationsRouter,
  tax: taxesRouter,
  vehicle: vehiclesRouter,
  vehicleType: vehicleTypesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
