import { prisma } from "@acme/db";
import {
  type InputCreateNoteForRental,
  type InputUpdateNote,
} from "@acme/validator";

import { type AuthMetaUser } from "../trpc";

class NoteController {
  public async createNoteForRental(
    user: AuthMetaUser,
    type: "reservation" | "agreement",
    payload: InputCreateNoteForRental,
  ) {
    const note = await prisma.note.create({
      data: {
        content: payload.content,
        company: { connect: { id: user.companyId } },
        ...(type === "reservation"
          ? {
              reservation: { connect: { id: payload.rentalId } },
            }
          : {}),
        ...(type === "agreement"
          ? {
              agreement: { connect: { id: payload.rentalId } },
            }
          : {}),
      },
    });
    return {
      id: note.id,
      content: note.content,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  }

  public async getNotesForRental(
    user: AuthMetaUser,
    type: "reservation" | "agreement",
    referenceId: string,
  ) {
    const notes = await prisma.note.findMany({
      where: {
        companyId: user.companyId,
        ...(type === "reservation" ? { reservationId: referenceId } : {}),
        ...(type === "agreement" ? { agreementId: referenceId } : {}),
      },
    });
    return notes.map((note) => ({
      id: note.id,
      content: note.content,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    }));
  }

  public async updateNote(user: AuthMetaUser, payload: InputUpdateNote) {
    const note = await prisma.note.update({
      where: { companyId_id: { companyId: user.companyId, id: payload.id } },
      data: {
        content: payload.content,
      },
    });
    return {
      id: note.id,
      content: note.content,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  }
}

export const NoteLogic = new NoteController();
