import { z } from "./zod-project";

export const RegisterNewCompanyAndAccountSchema = z.object({
  companyName: z.string().min(1),
  accountName: z.string().min(1),
  accountEmail: z.string().email(),
});
export type InputRegisterNewCompanyAndAccount = z.infer<
  typeof RegisterNewCompanyAndAccountSchema
>;
