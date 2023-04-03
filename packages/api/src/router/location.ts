import { LocationLogic } from "../logic/location";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const locationsRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await LocationLogic.getAll(ctx.user);
  }),
});
