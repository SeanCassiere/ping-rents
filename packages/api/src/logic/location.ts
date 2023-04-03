import { prisma } from "@acme/db";

import type { AuthMetaUser } from "../trpc";

class LocationController {
  public async getAll(user: AuthMetaUser) {
    return await prisma.location.findMany({
      where: { companyId: user.companyId },
    });
  }
}

export const LocationLogic = new LocationController();
