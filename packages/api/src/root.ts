import { authRouter } from "./router/auth";
import { locationsRouter } from "./router/location";
import { taxesRouter } from "./router/taxes";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  taxes: taxesRouter,
  locations: locationsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
