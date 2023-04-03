import { LocationLogic } from "../logic/location";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const locationsRouter = createTRPCRouter({
  getLocations: protectedProcedure.query(async ({ ctx }) => {
    return await LocationLogic.getLocations(ctx.user);
  }),
});
