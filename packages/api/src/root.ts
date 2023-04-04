import { authRouter } from "./router/auth";
import { customersRouter } from "./router/customer";
import { locationsRouter } from "./router/location";
import { taxesRouter } from "./router/taxes";
import { vehicleTypesRouter } from "./router/vehicleTypes";
import { vehiclesRouter } from "./router/vehicles";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  customers: customersRouter,
  locations: locationsRouter,
  taxes: taxesRouter,
  vehicles: vehiclesRouter,
  vehicleTypes: vehicleTypesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
