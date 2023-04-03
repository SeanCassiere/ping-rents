import { z } from "./zod-project";

export const RegisterNewCompanyAndAccount = z.object({
  companyName: z.string(),
  accountName: z.string(),
  accountEmail: z.string().email(),
});
