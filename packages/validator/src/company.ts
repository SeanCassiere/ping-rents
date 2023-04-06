import { z } from "./zod-project";

export const AddUserToCompanySchema = z.object({
  name: z.string(),
  email: z.string().email(),
});
export type InputAddUserToCompany = z.infer<typeof AddUserToCompanySchema>;
