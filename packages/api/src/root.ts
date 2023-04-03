import { authRouter } from "./router/auth";
import { taxesRouter } from "./router/taxes";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  taxes: taxesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
