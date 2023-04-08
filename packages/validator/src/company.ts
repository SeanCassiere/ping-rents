import { z } from "./zod-project";

export const AddUserToCompanySchema = z.object({
  name: z.string(),
  email: z.string().email(),
});
export type InputAddUserToCompany = z.infer<typeof AddUserToCompanySchema>;

export const UpdateUserInCompanySchema = AddUserToCompanySchema.extend({
  id: z.string().min(1),
}).omit({ email: true });
export type InputUpdateUserForCompany = z.infer<
  typeof UpdateUserInCompanySchema
>;

export const UpdateCompanyInformationSchema = z.object({
  name: z.string().min(1),
});
export type InputUpdateCompanyInformation = z.infer<
  typeof UpdateCompanyInformationSchema
>;
