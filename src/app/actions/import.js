"use server";
import { prisma } from "@/lib/prisma";
import { saveAsset } from "@/lib/storage";
import { revalidatePath } from "next/cache";

export async function importPools(formData) {
  try {
    const dataString = formData.get("data");
    if (!dataString) {
      return { error: "No se recibió el campo 'data' (pools.json) en la importación." };
    }
    const data = JSON.parse(dataString);

    if (!data.phases || !Array.isArray(data.phases) || data.phases.length === 0) {
      return { error: "El pools.json no contiene un array 'phases' con fases." };
    }

    const lastPhase = await prisma.phase.findFirst({ orderBy: { order: "desc" } });
    let phaseOrder = (lastPhase?.order ?? 0) + 1;

    let phasesCreated = 0;
    let optionsCreated = 0;
    let imagesWritten = 0;
    const missingImages = [];

    for (const phase of data.phases) {
      const newPhase = await prisma.phase.create({
        data: {
          name: phase.name || `Phase ${phaseOrder}`,
          title: phase.title || `Phase ${phaseOrder}`,
          eyebrow: phase.eyebrow || "",
          lore: phase.lore || "",
          status: "PENDING",
          order: phaseOrder++
        }
      });
      phasesCreated++;

      if (phase.options && Array.isArray(phase.options)) {
        for (let i = 0; i < phase.options.length; i++) {
          const option = phase.options[i];
          const slotId = `phase${newPhase.id}-${option.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

          await prisma.option.create({
            data: {
              phaseId: newPhase.id,
              title: option.title,
              kind: option.kind || "",
              lore: option.lore || "",
              flavor: option.flavor || "",
              slotId: slotId,
              order: i,
            }
          });
          optionsCreated++;

          if (option.imageFile) {
            const file = formData.get(`file_${option.imageFile}`);
            if (file && typeof file.arrayBuffer === "function") {
              const bytes = await file.arrayBuffer();
              const buffer = Buffer.from(bytes);
              const url = await saveAsset("images", `${slotId}.png`, buffer);
              await prisma.imageSlot.upsert({
                where: { id: slotId },
                update: { url },
                create: { id: slotId, url },
              });
              imagesWritten++;
            } else {
              missingImages.push(option.imageFile);
            }
          }
        }
      }
    }

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true, phasesCreated, optionsCreated, imagesWritten, missingImages };
  } catch (err) {
    console.error("[importPools] Error:", err);
    return { error: `${err?.code ? `[${err.code}] ` : ""}${err.message}` };
  }
}
