import { z } from "./zod-project";

export const RegisterNewCompanyAndAccountSchema = z.object({
  companyName: z.string(),
  accountName: z.string(),
  accountEmail: z.string().email(),
});
export type InputRegisterNewCompanyAndAccount = z.infer<
  typeof RegisterNewCompanyAndAccountSchema
>;
