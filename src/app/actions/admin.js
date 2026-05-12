"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPhases() {
  const phases = await prisma.phase.findMany({
    orderBy: { order: 'asc' },
    include: {
      options: {
        orderBy: [{ order: 'asc' }, { id: 'asc' }],
        include: {
          _count: {
            select: { votes: true }
          }
        }
      }
    }
  });

  return phases.map(p => ({
    ...p,
    options: p.options.map(o => ({
      ...o,
      tally: o._count.votes
    }))
  }));
}

export async function createPhase(data) {
  const count = await prisma.phase.count();
  await prisma.phase.create({
    data: {
      order: count + 1,
      name: data.name,
      title: data.title,
      eyebrow: data.eyebrow,
      lore: data.lore,
      status: "PENDING"
    }
  });
  revalidatePath('/admin');
  revalidatePath('/');
}

export async function updatePhaseStatus(id, status) {
  await prisma.phase.update({
    where: { id },
    data: { status }
  });
  revalidatePath('/admin');
  revalidatePath('/');
}

export async function deletePhase(id) {
  try {
    await prisma.$transaction([
      prisma.vote.deleteMany({ where: { phaseId: id } }),
      prisma.option.deleteMany({ where: { phaseId: id } }),
      prisma.phase.delete({ where: { id } }),
    ]);
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    console.error("[deletePhase] Error:", err);
    return { error: `${err?.code ? `[${err.code}] ` : ""}${err.message}` };
  }
}

export async function updatePhase(id, data) {
  let closesAt = undefined;
  if (data.closesAt === null || data.closesAt === "") {
    closesAt = null;
  } else if (typeof data.closesAt === "string") {
    const parsed = new Date(data.closesAt);
    closesAt = isNaN(parsed.getTime()) ? null : parsed;
  } else if (data.closesAt instanceof Date) {
    closesAt = data.closesAt;
  }

  await prisma.phase.update({
    where: { id },
    data: {
      name: data.name,
      title: data.title,
      eyebrow: data.eyebrow,
      lore: data.lore,
      ...(closesAt !== undefined ? { closesAt } : {}),
    }
  });
  revalidatePath('/admin');
  revalidatePath('/');
}

export async function addOption(phaseId, data) {
  const last = await prisma.option.findFirst({
    where: { phaseId },
    orderBy: { order: 'desc' }
  });
  const nextOrder = (last?.order ?? -1) + 1;
  await prisma.option.create({
    data: {
      phaseId,
      slotId: data.slotId,
      title: data.title,
      kind: data.kind,
      lore: data.lore,
      flavor: data.flavor,
      order: nextOrder,
    }
  });
  revalidatePath('/admin');
  revalidatePath('/');
}

export async function reorderPhase(id, direction) {
  try {
    const current = await prisma.phase.findUnique({ where: { id } });
    if (!current) return { error: "Fase no encontrada." };

    const neighbor = await prisma.phase.findFirst({
      where: direction === "up"
        ? { order: { lt: current.order } }
        : { order: { gt: current.order } },
      orderBy: { order: direction === "up" ? "desc" : "asc" }
    });
    if (!neighbor) return { success: true };

    const SENTINEL = -1000000;
    await prisma.$transaction([
      prisma.phase.update({ where: { id: current.id }, data: { order: SENTINEL } }),
      prisma.phase.update({ where: { id: neighbor.id }, data: { order: current.order } }),
      prisma.phase.update({ where: { id: current.id }, data: { order: neighbor.order } }),
    ]);

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    console.error("[reorderPhase] Error:", err);
    return { error: err.message };
  }
}

export async function reorderOption(id, direction) {
  try {
    const current = await prisma.option.findUnique({ where: { id } });
    if (!current) return { error: "Opción no encontrada." };

    const siblings = await prisma.option.findMany({
      where: { phaseId: current.phaseId },
      orderBy: [{ order: 'asc' }, { id: 'asc' }]
    });

    const idx = siblings.findIndex(o => o.id === id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= siblings.length) return { success: true };

    // Normalize: write back 0..N-1 with the swap applied. Avoids stale order values.
    const reordered = [...siblings];
    [reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]];

    await prisma.$transaction(
      reordered.map((opt, i) =>
        prisma.option.update({ where: { id: opt.id }, data: { order: i } })
      )
    );

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    console.error("[reorderOption] Error:", err);
    return { error: err.message };
  }
}

export async function deleteOption(id) {
  try {
    await prisma.$transaction([
      prisma.vote.deleteMany({ where: { optionId: id } }),
      prisma.option.delete({ where: { id } }),
    ]);
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    console.error("[deleteOption] Error:", err);
    return { error: `${err?.code ? `[${err.code}] ` : ""}${err.message}` };
  }
}

export async function updateOption(id, data) {
  await prisma.option.update({
    where: { id },
    data: {
      title: data.title,
      kind: data.kind,
      slotId: data.slotId,
      lore: data.lore,
      flavor: data.flavor,
    }
  });
  revalidatePath('/admin');
  revalidatePath('/');
}

import { saveAsset, deleteAsset } from "@/lib/storage";
import { cookies } from "next/headers";

// Strip extension from a filename to derive the ImageSlot.id key.
// "hero-pinup.png" -> "hero-pinup", "phase-abc-aasimar.png" -> "phase-abc-aasimar"
function slotIdFromFilename(filename) {
  return filename.replace(/\.[^.]+$/, "");
}

export async function uploadImage(formData) {
  const file = formData.get("file");
  const filename = formData.get("filename");

  if (!file || !filename) {
    throw new Error("Missing file or filename");
  }

  const slotId = slotIdFromFilename(filename);

  // Delete previous asset (if any) before saving the new one.
  const existing = await prisma.imageSlot.findUnique({ where: { id: slotId } });
  if (existing?.url) {
    await deleteAsset(existing.url);
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const url = await saveAsset("images", filename, buffer);

  await prisma.imageSlot.upsert({
    where: { id: slotId },
    update: { url },
    create: { id: slotId, url },
  });

  revalidatePath('/admin');
  revalidatePath('/');
  return { success: true, url };
}

export async function deleteImage(filename) {
  try {
    const slotId = slotIdFromFilename(filename);
    const existing = await prisma.imageSlot.findUnique({ where: { id: slotId } });
    if (existing?.url) {
      await deleteAsset(existing.url);
      await prisma.imageSlot.delete({ where: { id: slotId } });
    }
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    return { error: "No se pudo borrar la imagen: " + err.message };
  }
}

export async function getImageUrls() {
  const rows = await prisma.imageSlot.findMany();
  return Object.fromEntries(rows.map(r => [r.id, r.url]));
}

const DEFAULT_SETTINGS = {
  kickstarterUrl: "https://www.kickstarter.com/projects/your-handle/pool-pinups",
  adminPassword: "admin",
  voterPassword: "1234",
  flipSoundUrl: null,
  heroEyebrow: "Chapter II · Anno Forge MMXXVI",
  heroTitle: "Forge\nthe Next\nHeroine",
  heroLore: "Backers of the realm summon the next fantasy pinup, vote by vote — race, blade, vow, and pose — until she is sealed in resin and shipped to your shelf.",
  heroBanner: "The Heroine · Direct to Kickstarter",
  heroPrimaryBtn: "◆ Back on Kickstarter ↗",
  heroSecondaryBtn: "Join the Vote",
  ctaButton: "Cast Your Voice",
  lastRevealShow: true,
  lastRevealEyebrow: "The Last Reveal",
  lastRevealTitle: "Sister of the Crimson Vow",
  lastRevealLore: "Phase I's heroine. Hand-painted, 75mm scale, photographed under cathedral light. The same fate awaits the heroine you forge today.",
  lastRevealImageLabel: "MINI · 75mm · cathedral light",
  lastRevealCardEyebrow: "Phase I · Sealed Edition",
  lastRevealCardTitle: "The Sister\nof the\nCrimson Vow",
  lastRevealCardLore: "Forged in 8K resin. Distributed to 3,847 backers across nine moons. She watches you from the shelf with patient, ember-lit eyes.",
  lastRevealTags: "SCALE 75mm\nRESIN 8K\nSTL + PRESUPPORTED",
  processEyebrow: "The Rite of Forging",
  processTitle: "Councils · One Heroine",
  processLore: "Each phase asks the realm a single question. When the moon turns, the votes are sealed and her form is carved one step closer to flesh.",
  forgeLedgerEyebrow: "The Forge Ledger",
  forgeLedgerTitle: "What the Council has Decreed",
  councilEyebrow: "The Council",
  councilTitle: "Voices in the Hall"
};

export async function getSettings() {
  try {
    const rows = await prisma.setting.findMany();
    const stored = {};
    for (const row of rows) {
      try {
        stored[row.key] = JSON.parse(row.value);
      } catch {
        stored[row.key] = row.value; // legacy plain-string fallback
      }
    }
    return { ...DEFAULT_SETTINGS, ...stored };
  } catch (err) {
    console.error("[getSettings] Error:", err);
    return { ...DEFAULT_SETTINGS };
  }
}

export async function adminLogin(password) {
  const settings = await getSettings();
  if (password === settings.adminPassword) {
    const cookieStore = await cookies();
    cookieStore.set('admin_token', 'true', { path: '/' });
    return { success: true };
  }
  return { error: "Contraseña incorrecta." };
}

export async function saveSettings(settings) {
  await Promise.all(
    Object.entries(settings).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value: JSON.stringify(value) },
        create: { key, value: JSON.stringify(value) },
      })
    )
  );
  revalidatePath('/admin');
  revalidatePath('/');
  return { success: true };
}

export async function uploadFlipSound(formData) {
  try {
    const file = formData.get("file");
    if (!file || typeof file.arrayBuffer !== "function") {
      return { error: "No se recibió ningún archivo válido." };
    }

    const originalName = file.name || "flip-card.mp3";
    const extRaw = originalName.split(".").pop() || "mp3";
    const ext = extRaw.toLowerCase().replace(/[^a-z0-9]/g, "") || "mp3";
    const filename = `flip-card.${ext}`;

    const settings = await getSettings();
    const previousUrl = settings.flipSoundUrl;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const url = await saveAsset("sounds", filename, buffer);

    if (previousUrl && previousUrl !== url) {
      await deleteAsset(previousUrl);
    }

    await prisma.setting.upsert({
      where: { key: "flipSoundUrl" },
      update: { value: JSON.stringify(url) },
      create: { key: "flipSoundUrl", value: JSON.stringify(url) },
    });

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true, url };
  } catch (err) {
    console.error("[uploadFlipSound] Error:", err);
    return { error: err.message };
  }
}

export async function deleteFlipSound() {
  try {
    const settings = await getSettings();
    if (settings.flipSoundUrl) {
      await deleteAsset(settings.flipSoundUrl);
    }
    await prisma.setting.upsert({
      where: { key: "flipSoundUrl" },
      update: { value: JSON.stringify(null) },
      create: { key: "flipSoundUrl", value: JSON.stringify(null) },
    });
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    console.error("[deleteFlipSound] Error:", err);
    return { error: err.message };
  }
}
