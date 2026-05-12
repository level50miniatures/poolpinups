"use server";
import { prisma } from "@/lib/prisma";

import { getSettings } from "./admin";

export async function login(email, password) {
  const settings = await getSettings();
  if (password !== settings.voterPassword) {
    return { error: "Contraseña incorrecta." };
  }

  let user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    user = await prisma.user.create({
      data: { email, passwordHash: password }
    });
  }
  
  return { success: true, email: user.email, id: user.id };
}
