"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getUserVotes(userId) {
  if (!userId) return {};
  const votes = await prisma.vote.findMany({ where: { userId } });
  const map = {};
  for (const v of votes) map[v.phaseId] = v.optionId;
  return map;
}

export async function castVote(userId, phaseId, optionId) {
  if (!userId) throw new Error("Debes iniciar sesión para votar.");

  const phase = await prisma.phase.findUnique({ where: { id: phaseId } });
  if (!phase) throw new Error("Fase no encontrada.");
  if (phase.status !== "ACTIVE") throw new Error("Esta fase no está abierta a votación.");
  if (phase.closesAt && new Date() >= phase.closesAt) {
    throw new Error("El tiempo de esta votación ha terminado.");
  }

  await prisma.vote.upsert({
    where: {
      userId_phaseId: {
        userId,
        phaseId
      }
    },
    update: {
      optionId
    },
    create: {
      userId,
      phaseId,
      optionId
    }
  });

  revalidatePath('/');
  return { success: true };
}

export async function removeVote(userId, phaseId) {
  if (!userId) throw new Error("Debes iniciar sesión para retirar tu voto.");

  const phase = await prisma.phase.findUnique({ where: { id: phaseId } });
  if (!phase) throw new Error("Fase no encontrada.");
  if (phase.status !== "ACTIVE") throw new Error("Esta fase ya no está abierta a votación.");
  if (phase.closesAt && new Date() >= phase.closesAt) {
    throw new Error("El tiempo de esta votación ha terminado.");
  }

  await prisma.vote.deleteMany({
    where: {
      userId,
      phaseId
    }
  });

  revalidatePath('/');
  return { success: true };
}
