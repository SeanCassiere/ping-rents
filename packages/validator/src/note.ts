import { z } from "./zod-project";

export const CreateNoteForRentalSchema = z.object({
  rentalId: z.string().min(1),
  content: z
    .string()
    .min(1, "Must be at least 1 character long")
    .max(255, "Cannot be longer than 255 characters"),
});
export type InputCreateNoteForRental = z.infer<
  typeof CreateNoteForRentalSchema
>;

export const UpdateNoteSchema = z.object({
  id: z.string().min(1),
  content: z
    .string()
    .min(1, "Must be at least 1 character long")
    .max(255, "Cannot be longer than 255 characters"),
});
export type InputUpdateNote = z.infer<typeof UpdateNoteSchema>;
