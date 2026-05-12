"use client";

import { useState, useEffect } from "react";
import { createPhase, deletePhase, addOption, deleteOption, updatePhaseStatus, uploadImage, saveSettings, deleteImage, updatePhase, updateOption, uploadFlipSound, deleteFlipSound, reorderPhase, reorderOption } from "../actions/admin";
import { importPools } from "../actions/import";
import { useImageUrl, ImageUrlProvider } from "../../lib/imageUrlContext";

function toLocalDateTimeInputValue(dateLike) {
  if (!dateLike) return "";
  const d = dateLike instanceof Date ? dateLike : new Date(dateLike);
  if (isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminClient({ initialPhases, initialSettings, initialImageUrls = {} }) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [timestamp, setTimestamp] = useState(0);
  useEffect(() => { setTimestamp(Date.now()); }, []);
  const [phases, setPhases] = useState(initialPhases);
  const [settings, setSettings] = useState(initialSettings || { kickstarterUrl: "" });
  const [isCreatingPhase, setIsCreatingPhase] = useState(false);
  const [newPhase, setNewPhase] = useState({ name: "", title: "", eyebrow: "", lore: "" });
  
  const [optionModal, setOptionModal] = useState(null); // phaseId to add option to
  const [newOption, setNewOption] = useState({ title: "", kind: "", lore: "", flavor: "", slotId: "" });
  const [editingPhase, setEditingPhase] = useState(null);
  const [editPhaseData, setEditPhaseData] = useState(null);
  const [editingOption, setEditingOption] = useState(null);
  const [editOptionData, setEditOptionData] = useState(null);

  const handleCreatePhase = async (e) => {
    e.preventDefault();
    await createPhase(newPhase);
    setNewPhase({ name: "", title: "", eyebrow: "", lore: "" });
    setIsCreatingPhase(false);
    window.location.reload(); // Quick refresh to get new data
  };

  const handleAddOption = async (e) => {
    e.preventDefault();
    await addOption(optionModal, newOption);
    setNewOption({ title: "", kind: "", lore: "", flavor: "", slotId: "" });
    setOptionModal(null);
    window.location.reload();
  };

  const handleImageUpload = async (e, filename) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecciona un archivo de imagen (PNG, JPG, etc).');
      return;
    }
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("filename", filename);
    
    try {
      await uploadImage(formData);
      setTimestamp(Date.now());
      // No alert needed to make it smoother
    } catch (err) {
      alert("Error al subir la imagen: " + err.message);
    }
  };

  const handleDeleteImage = async (filename) => {
    if (!confirm(`¿Seguro que quieres borrar la imagen ${filename}?`)) return;
    
    try {
      const res = await deleteImage(filename);
      if (res.error) throw new Error(res.error);
      setTimestamp(Date.now());
    } catch (err) {
      alert(err.message);
    }
  };

  const handleFolderImport = async (e) => {
    const input = e.target;
    const files = Array.from(input.files);
    if (!files.length) return;

    const jsonFile = files.find(f => f.name === 'pools.json');
    if (!jsonFile) {
      alert("No se ha encontrado el archivo 'pools.json' en la carpeta seleccionada.");
      input.value = "";
      return;
    }

    try {
      const text = await jsonFile.text();
      JSON.parse(text);

      const formData = new FormData();
      formData.append("data", text);

      let imageCount = 0;
      for (const file of files) {
        if (file.name !== 'pools.json') {
          formData.append(`file_${file.name}`, file);
          imageCount++;
        }
      }

      console.log(`[Importar Carpeta] Subiendo pools.json + ${imageCount} imágenes...`);
      const res = await importPools(formData);
      console.log("[Importar Carpeta] Respuesta del servidor:", res);

      if (!res) {
        throw new Error("El servidor no devolvió respuesta.");
      }
      if (res.error) {
        throw new Error(res.error);
      }
      if (!res.phasesCreated) {
        throw new Error("El servidor devolvió OK pero no creó ninguna fase. Revisa la terminal de 'next dev' para ver el error.");
      }

      const missingMsg = res.missingImages?.length
        ? `\n⚠ Imágenes no encontradas en la carpeta: ${res.missingImages.join(", ")}`
        : "";
      alert(`¡Importación completada!\nFases creadas: ${res.phasesCreated}\nOpciones creadas: ${res.optionsCreated}\nImágenes guardadas: ${res.imagesWritten}${missingMsg}`);
      window.location.reload();
    } catch (err) {
      console.error("[Importar Carpeta] Error:", err);
      alert("Error al importar la carpeta: " + err.message);
    } finally {
      input.value = "";
    }
  };

  const [soundUploading, setSoundUploading] = useState(false);

  const handleSoundUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('audio/')) {
      alert('Por favor selecciona un archivo de audio (MP3, WAV, OGG).');
      e.target.value = "";
      return;
    }
    setSoundUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadFlipSound(formData);
      if (res?.error) throw new Error(res.error);
      setSettings(prev => ({ ...prev, flipSoundUrl: res.url }));
      setTimestamp(Date.now());
    } catch (err) {
      alert("Error al subir el sonido: " + err.message);
    } finally {
      setSoundUploading(false);
      e.target.value = "";
    }
  };

  const handleSoundDelete = async () => {
    if (!confirm('¿Borrar el sonido de volteo?')) return;
    const res = await deleteFlipSound();
    if (res?.error) {
      alert("Error: " + res.error);
      return;
    }
    setSettings(prev => ({ ...prev, flipSoundUrl: null }));
  };

  const handleDownloadResults = () => {
    const lines = [];
    const now = new Date();

    lines.push(`# Pool Pinups — Estado del Concilio`);
    lines.push(``);
    lines.push(`Generado: ${now.toLocaleString()}`);
    lines.push(``);

    const sealed = phases.filter(p => p.status === 'SEALED');
    if (sealed.length > 0) {
      lines.push(`## Resumen ganadoras (para prompt de la pinup)`);
      lines.push(``);
      lines.push(`La heroína forjada por el consejo, fase a fase:`);
      lines.push(``);
      for (const p of sealed) {
        const sorted = [...p.options].sort((a, b) => (b.tally || 0) - (a.tally || 0));
        const winner = sorted[0];
        if (winner) {
          lines.push(`- **${p.title}**: ${winner.title}${winner.kind ? ` (${winner.kind})` : ''}`);
          if (winner.lore) lines.push(`  - ${winner.lore}`);
        }
      }
      lines.push(``);
    }

    lines.push(`## Detalle por fase`);
    lines.push(``);
    for (const p of phases) {
      const totalVotes = p.options.reduce((s, o) => s + (o.tally || 0), 0);
      lines.push(`### ${p.title} (interno: ${p.name})`);
      lines.push(``);
      lines.push(`- Estado: **${p.status}**`);
      if (p.eyebrow) lines.push(`- Eyebrow: ${p.eyebrow}`);
      if (p.closesAt) lines.push(`- Cierre: ${new Date(p.closesAt).toLocaleString()}`);
      lines.push(`- Total de votos: ${totalVotes}`);
      lines.push(``);
      if (p.lore) {
        lines.push(`Lore de la fase:`);
        lines.push(`> ${p.lore}`);
        lines.push(``);
      }

      if (!p.options || p.options.length === 0) {
        lines.push(`_Sin opciones._`);
        lines.push(``);
        continue;
      }

      const sorted = [...p.options].sort((a, b) => (b.tally || 0) - (a.tally || 0));
      const winner = sorted[0];

      if (p.status === 'SEALED' && winner) {
        lines.push(`🏆 **Ganadora: ${winner.title}**`);
        if (winner.kind) lines.push(`- Tipo: ${winner.kind}`);
        if (winner.lore) lines.push(`- Lore: ${winner.lore}`);
        if (winner.flavor) lines.push(`- Flavor: ${winner.flavor}`);
        if (winner.slotId) lines.push(`- Imagen: ${winner.slotId}.png`);
        lines.push(``);
      }

      lines.push(`Ranking:`);
      sorted.forEach((opt, i) => {
        const tally = opt.tally || 0;
        const pct = totalVotes > 0 ? ((tally / totalVotes) * 100).toFixed(1) : '0.0';
        const mark = i === 0 && p.status === 'SEALED' ? ' 🏆' : '';
        lines.push(`${i + 1}. ${opt.title} — ${tally} votos (${pct}%)${mark}`);
      });
      lines.push(``);
    }

    const content = lines.join('\n');
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const stamp = now.toISOString().slice(0, 16).replace(/[:T]/g, '-');
    link.download = `pool-pinups-resultados-${stamp}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveSettings = async () => {
    try {
      await saveSettings(settings);
      alert("Configuración guardada correctamente.");
    } catch (err) {
      alert("Error al guardar: " + err.message);
    }
  };

  const globalImages = [
    { id: "brand-logo", title: "Logo Principal" },
    { id: "login-logo", title: "Logo de Login" },
    { id: "hero-pinup", title: "Imagen Portada (Hero)" },
    { id: "winner-pinup", title: "Ganadora Anterior" },
    { id: "featured-mini", title: "Mini Last Reveal" },
  ];

  return (
    <ImageUrlProvider value={initialImageUrls}>
    <div className="space-y-8">
      {/* Global Settings */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Configuración Global</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Enlace del Kickstarter</label>
            <input 
              type="text" 
              value={settings.kickstarterUrl}
              onChange={e => setSettings({...settings, kickstarterUrl: e.target.value})}
              className="w-full border border-gray-300 rounded p-2 text-sm"
              placeholder="https://www.kickstarter.com/projects/..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña Panel Admin</label>
            <input 
              type="text" 
              value={settings.adminPassword || "admin"}
              onChange={e => setSettings({...settings, adminPassword: e.target.value})}
              className="w-full border border-gray-300 rounded p-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña Votantes</label>
            <input 
              type="text" 
              value={settings.voterPassword || "1234"}
              onChange={e => setSettings({...settings, voterPassword: e.target.value})}
              className="w-full border border-gray-300 rounded p-2 text-sm"
            />
          </div>
        </div>
        
        <div className="mb-8">
          <button 
            onClick={handleSaveSettings}
            className="bg-gray-800 text-white px-4 py-2 rounded text-sm hover:bg-gray-900"
          >
            Guardar Configuración
          </button>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Imágenes Principales de la Web</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {globalImages.map(img => (
              <ImageBox
                key={img.id}
                id={img.id}
                title={img.title}
                timestamp={timestamp}
                onUpload={(e) => handleImageUpload(e, `${img.id}.png`)}
                onDelete={() => handleDeleteImage(`${img.id}.png`)}
              />
            ))}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Textos de la Landing (Inicio)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Eyebrow (encima del título)</label>
              <input
                type="text"
                value={settings.heroEyebrow || ""}
                onChange={e => setSettings({ ...settings, heroEyebrow: e.target.value })}
                className="w-full border border-gray-300 rounded p-2 text-sm"
                placeholder="Chapter II · Anno Forge MMXXVI"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Texto bajo la imagen principal</label>
              <input
                type="text"
                value={settings.heroBanner || ""}
                onChange={e => setSettings({ ...settings, heroBanner: e.target.value })}
                className="w-full border border-gray-300 rounded p-2 text-sm"
                placeholder="La Tiefling · Ganadora Fase I"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Título principal (usa salto de línea para varias líneas)</label>
              <textarea
                value={settings.heroTitle || ""}
                onChange={e => setSettings({ ...settings, heroTitle: e.target.value })}
                className="w-full border border-gray-300 rounded p-2 text-sm font-mono"
                rows="3"
                placeholder={"Forge\nthe Next\nHeroine"}
              />
              <p className="text-[10px] text-gray-400 mt-1">La última línea se resalta en dorado.</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Lore / Descripción del proyecto</label>
              <textarea
                value={settings.heroLore || ""}
                onChange={e => setSettings({ ...settings, heroLore: e.target.value })}
                className="w-full border border-gray-300 rounded p-2 text-sm"
                rows="3"
                placeholder="Backers of the realm summon..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Botón principal (Kickstarter)</label>
              <input
                type="text"
                value={settings.heroPrimaryBtn || ""}
                onChange={e => setSettings({ ...settings, heroPrimaryBtn: e.target.value })}
                className="w-full border border-gray-300 rounded p-2 text-sm"
                placeholder="◆ Back on Kickstarter ↗"
              />
              <p className="text-[10px] text-gray-400 mt-1">Enlace al Kickstarter (URL en el campo de arriba).</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Botón secundario (Voto)</label>
              <input
                type="text"
                value={settings.heroSecondaryBtn || ""}
                onChange={e => setSettings({ ...settings, heroSecondaryBtn: e.target.value })}
                className="w-full border border-gray-300 rounded p-2 text-sm"
                placeholder="Join the Vote"
              />
              <p className="text-[10px] text-gray-400 mt-1">Navega a la pantalla de votación.</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Botón de la sección "Moon turns in"</label>
              <input
                type="text"
                value={settings.ctaButton || ""}
                onChange={e => setSettings({ ...settings, ctaButton: e.target.value })}
                className="w-full border border-gray-300 rounded p-2 text-sm"
                placeholder="Cast Your Voice"
              />
              <p className="text-[10px] text-gray-400 mt-1">Aparece bajo el contador grande de la fase activa más próxima a cerrar.</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Recuerda pulsar "Guardar Configuración" al terminar.</p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Encabezados de secciones de la Landing</h3>
          <p className="text-xs text-gray-500 mb-4">Cada bloque tiene un eyebrow (texto pequeño dorado) + título grande. El cuerpo se rellena con las fases reales de la BD.</p>

          <div className="space-y-5">
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              <p className="text-xs font-semibold text-gray-600 mb-2">📜 Sección "El proceso" (cards con cada fase)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input type="text" value={settings.processEyebrow || ""} onChange={e => setSettings({ ...settings, processEyebrow: e.target.value })} className="border border-gray-300 rounded p-2 text-sm" placeholder="Eyebrow (ej. The Rite of Forging)" />
                <input type="text" value={settings.processTitle || ""} onChange={e => setSettings({ ...settings, processTitle: e.target.value })} className="border border-gray-300 rounded p-2 text-sm" placeholder="Título (ej. Councils · One Heroine)" />
              </div>
              <textarea value={settings.processLore || ""} onChange={e => setSettings({ ...settings, processLore: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-sm mt-2" rows="2" placeholder="Lore / descripción de esta sección..." />
            </div>

            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              <p className="text-xs font-semibold text-gray-600 mb-2">🏛 Sección "Lo que el consejo ha decidido" (ledger de fases)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input type="text" value={settings.forgeLedgerEyebrow || ""} onChange={e => setSettings({ ...settings, forgeLedgerEyebrow: e.target.value })} className="border border-gray-300 rounded p-2 text-sm" placeholder="Eyebrow (ej. The Forge Ledger)" />
                <input type="text" value={settings.forgeLedgerTitle || ""} onChange={e => setSettings({ ...settings, forgeLedgerTitle: e.target.value })} className="border border-gray-300 rounded p-2 text-sm" placeholder="Título (ej. What the Council has Decreed)" />
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              <p className="text-xs font-semibold text-gray-600 mb-2">📊 Sección "Stats finales" (4 cards numéricas)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input type="text" value={settings.councilEyebrow || ""} onChange={e => setSettings({ ...settings, councilEyebrow: e.target.value })} className="border border-gray-300 rounded p-2 text-sm" placeholder="Eyebrow (ej. The Council)" />
                <input type="text" value={settings.councilTitle || ""} onChange={e => setSettings({ ...settings, councilTitle: e.target.value })} className="border border-gray-300 rounded p-2 text-sm" placeholder="Título (ej. Voices in the Hall)" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-start mb-3 flex-wrap gap-3">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Sección "Last Reveal" (Última figura)</h3>
              <p className="text-xs text-gray-500">Bloque promocional con la figura ya revelada/terminada.</p>
            </div>
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.lastRevealShow !== false}
                onChange={e => setSettings({ ...settings, lastRevealShow: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">{settings.lastRevealShow !== false ? "Mostrar en la landing" : "Oculta"}</span>
            </label>
          </div>
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${settings.lastRevealShow === false ? "opacity-40 pointer-events-none" : ""}`}>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Eyebrow de cabecera</label>
              <input
                type="text"
                value={settings.lastRevealEyebrow || ""}
                onChange={e => setSettings({ ...settings, lastRevealEyebrow: e.target.value })}
                className="w-full border border-gray-300 rounded p-2 text-sm"
                placeholder="The Last Reveal"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Título de cabecera</label>
              <input
                type="text"
                value={settings.lastRevealTitle || ""}
                onChange={e => setSettings({ ...settings, lastRevealTitle: e.target.value })}
                className="w-full border border-gray-300 rounded p-2 text-sm"
                placeholder="Sister of the Crimson Vow"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Lore de cabecera</label>
              <textarea
                value={settings.lastRevealLore || ""}
                onChange={e => setSettings({ ...settings, lastRevealLore: e.target.value })}
                className="w-full border border-gray-300 rounded p-2 text-sm"
                rows="2"
                placeholder="Phase I's heroine. Hand-painted, 75mm scale..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Etiqueta sobre la imagen</label>
              <input
                type="text"
                value={settings.lastRevealImageLabel || ""}
                onChange={e => setSettings({ ...settings, lastRevealImageLabel: e.target.value })}
                className="w-full border border-gray-300 rounded p-2 text-sm"
                placeholder="MINI · 75mm · cathedral light"
              />
              <p className="text-[10px] text-gray-400 mt-1">La imagen es <code>featured-mini.png</code> en la sección de imágenes principales (arriba).</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Eyebrow del card derecho</label>
              <input
                type="text"
                value={settings.lastRevealCardEyebrow || ""}
                onChange={e => setSettings({ ...settings, lastRevealCardEyebrow: e.target.value })}
                className="w-full border border-gray-300 rounded p-2 text-sm"
                placeholder="Phase I · Sealed Edition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Título del card (usa salto de línea)</label>
              <textarea
                value={settings.lastRevealCardTitle || ""}
                onChange={e => setSettings({ ...settings, lastRevealCardTitle: e.target.value })}
                className="w-full border border-gray-300 rounded p-2 text-sm font-mono"
                rows="3"
                placeholder={"The Sister\nof the\nCrimson Vow"}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Lore del card</label>
              <textarea
                value={settings.lastRevealCardLore || ""}
                onChange={e => setSettings({ ...settings, lastRevealCardLore: e.target.value })}
                className="w-full border border-gray-300 rounded p-2 text-sm"
                rows="3"
                placeholder="Forged in 8K resin..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Etiquetas mono (una por línea, máx. 3 visibles)</label>
              <textarea
                value={settings.lastRevealTags || ""}
                onChange={e => setSettings({ ...settings, lastRevealTags: e.target.value })}
                className="w-full border border-gray-300 rounded p-2 text-sm font-mono"
                rows="3"
                placeholder={"SCALE 75mm\nRESIN 8K\nSTL + PRESUPPORTED"}
              />
              <p className="text-[10px] text-gray-400 mt-1">Cada línea es una etiqueta dorada.</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Sonido al voltear cartas</h3>
          {settings.flipSoundUrl ? (
            <div className="flex items-center gap-3 mb-3">
              <audio
                src={settings.flipSoundUrl}
                controls
                className="flex-1 max-w-md"
              />
              <button
                onClick={handleSoundDelete}
                className="text-red-500 hover:text-red-700 text-sm font-medium"
              >
                Eliminar
              </button>
            </div>
          ) : (
            <p className="text-xs text-gray-400 mb-3">Aún no hay sonido configurado.</p>
          )}
          <label className="inline-block cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition">
            {soundUploading ? 'Subiendo...' : (settings.flipSoundUrl ? 'Cambiar archivo' : 'Subir archivo')}
            <input
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleSoundUpload}
              disabled={soundUploading}
            />
          </label>
          <p className="text-xs text-gray-500 mt-2">Formatos recomendados: MP3, WAV, OGG. Se reproduce al voltear cualquier carta de voto.</p>
        </div>
      </div>

      {/* Phases List */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Fases de Votación (Pools)</h2>
            <p className="text-sm text-gray-500 mt-1">Gestiona las fases manualmente o importa una carpeta completa generada por Claude.</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleDownloadResults}
              className="bg-amber-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-amber-700 transition"
              title="Descarga un .md con ganadoras, ranking de votos y lore de cada fase — listo para pegar en un prompt"
            >
              📊 Descargar Resultados
            </button>
            <button
              onClick={() => setShowPrompt(!showPrompt)}
              className="bg-purple-100 text-purple-700 border border-purple-200 px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-200 transition"
            >
              🤖 Ver Prompt para Claude
            </button>
            <label className="cursor-pointer bg-emerald-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-emerald-700 transition">
              📂 Importar Carpeta
              <input 
                type="file" 
                webkitdirectory="true"
                directory="true"
                multiple
                className="hidden" 
                onChange={handleFolderImport}
              />
            </label>
            <button 
              onClick={() => setIsCreatingPhase(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition"
            >
              + Añadir Manualmente
            </button>
          </div>
        </div>

        {showPrompt && (
          <div className="mb-6 bg-purple-50 border border-purple-200 rounded-lg p-5">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-purple-900">Plantilla de Skill para Claude</h3>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`Actúa como mi asistente de creación de contenido para Pool Pinups. Mi objetivo es crear una carpeta de importación masiva. 
Cuando te dé ideas, descripciones o nombres para nuevas Fases y Opciones de votación, tu trabajo es generar un bloque de código en formato JSON estrictamente válido que yo guardaré en un archivo llamado pools.json.

La estructura obligatoria del JSON debe ser esta:
{
  "phases": [
    {
      "name": "Phase I",
      "title": "Raza",
      "lore": "Texto épico explicando la fase...",
      "options": [
        {
          "title": "Elfa Oscura",
          "flavor": "Lore específico de esta opción...",
          "imageFile": "drow.jpg"
        },
        {
          "title": "Humana",
          "flavor": "Lore específico...",
          "imageFile": "humana.png"
        }
      ]
    }
  ]
}

Reglas importantes:
1. En imageFile debes poner el nombre exacto del archivo de imagen que voy a usar para esa opción (incluyendo la extensión .jpg o .png).
2. Devuélveme siempre el código JSON completo para que yo solo tenga que copiarlo y guardarlo.`);
                  alert("¡Prompt copiado al portapapeles!");
                }}
                className="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
              >
                📋 Copiar Texto
              </button>
            </div>
            <p className="text-sm text-purple-800 mb-3">
              Copia este texto y dáselo a Claude. Él te devolverá el código que debes guardar en un archivo llamado <strong>pools.json</strong> junto a tus imágenes.
            </p>
            <pre className="text-[10px] bg-white p-3 border border-purple-100 rounded text-purple-900 overflow-x-auto whitespace-pre-wrap">
{`Actúa como mi asistente de creación de contenido para Pool Pinups. Mi objetivo es crear una carpeta de importación masiva. 
Cuando te dé ideas, descripciones o nombres para nuevas Fases y Opciones de votación, tu trabajo es generar un bloque de código en formato JSON estrictamente válido que yo guardaré en un archivo llamado pools.json.

La estructura obligatoria del JSON debe ser esta:
{
  "phases": [
    {
      "name": "Phase I",
      "title": "Raza",
      "lore": "Texto épico explicando la fase...",
      "options": [
        {
          "title": "Elfa Oscura",
          "flavor": "Lore específico de esta opción...",
          "imageFile": "drow.jpg"
        }
      ]
    }
  ]
}

Reglas importantes:
1. En imageFile debes poner el nombre exacto del archivo de imagen que voy a usar para esa opción (incluyendo .jpg o .png).
2. Devuélveme siempre el código JSON completo para que yo solo tenga que copiarlo y guardarlo.`}
            </pre>
          </div>
        )}

        {isCreatingPhase && (
          <form onSubmit={handleCreatePhase} className="mb-8 bg-gray-50 p-4 rounded border border-gray-200">
            <h3 className="font-semibold text-gray-700 mb-4">Crear Nueva Fase</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Nombre Interno (ej. "race")</label>
                <input required value={newPhase.name} onChange={e => setNewPhase({...newPhase, name: e.target.value})} className="w-full border rounded p-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Título Público (ej. "Choose her Class")</label>
                <input required value={newPhase.title} onChange={e => setNewPhase({...newPhase, title: e.target.value})} className="w-full border rounded p-2 text-sm" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Subtítulo / Eyebrow (ej. "Phase II · The Council Convenes")</label>
                <input required value={newPhase.eyebrow} onChange={e => setNewPhase({...newPhase, eyebrow: e.target.value})} className="w-full border rounded p-2 text-sm" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Historia / Descripción (Lore)</label>
                <textarea required value={newPhase.lore} onChange={e => setNewPhase({...newPhase, lore: e.target.value})} className="w-full border rounded p-2 text-sm" rows="3" />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">Guardar Fase</button>
              <button type="button" onClick={() => setIsCreatingPhase(false)} className="bg-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-400">Cancelar</button>
            </div>
          </form>
        )}

        <div className="space-y-6">
          {phases.length === 0 && <p className="text-gray-500 italic text-sm">Aún no se han creado fases.</p>}
          {phases.map((phase, idx) => (
            <div key={phase.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-4 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200 gap-4">
                {editingPhase === phase.id ? (
                  <div className="w-full flex flex-col gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Título Público (h2 del hero, ej. "Race" / "Raza")</label>
                      <input className="border p-2 rounded text-sm w-full font-bold" value={editPhaseData.title} onChange={e=>setEditPhaseData({...editPhaseData, title: e.target.value})} placeholder="Race" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Nombre Interno (sin espacios, ej. "race")</label>
                      <input className="border p-2 rounded text-sm w-full" value={editPhaseData.name} onChange={e=>setEditPhaseData({...editPhaseData, name: e.target.value})} placeholder="race" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Eyebrow (texto pequeño sobre el título, ej. "Phase I · The Origin of the Heroine")</label>
                      <input className="border p-2 rounded text-sm w-full" value={editPhaseData.eyebrow} onChange={e=>setEditPhaseData({...editPhaseData, eyebrow: e.target.value})} placeholder="Phase I · The Origin of the Heroine" />
                      <p className="text-[10px] text-gray-400 mt-1">Aparece como pastilla "● [eyebrow]" en el hero de la landing y en la pantalla de votación.</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Lore / Descripción de la fase</label>
                      <textarea className="border p-2 rounded text-sm w-full" value={editPhaseData.lore} onChange={e=>setEditPhaseData({...editPhaseData, lore: e.target.value})} placeholder="Texto largo descriptivo..." rows="3" />
                    </div>
                    <div className="border rounded p-3 bg-amber-50 border-amber-200">
                      <label className="block text-xs font-medium text-amber-900 mb-1">Cierre de la votación (hora local)</label>
                      <div className="flex gap-2 items-center flex-wrap">
                        <input
                          type="datetime-local"
                          className="border p-2 rounded text-sm flex-1 min-w-[200px]"
                          value={editPhaseData.closesAt || ""}
                          onChange={e=>setEditPhaseData({...editPhaseData, closesAt: e.target.value})}
                        />
                        <button type="button" onClick={() => setEditPhaseData({...editPhaseData, closesAt: ""})} className="text-xs text-amber-800 underline">Sin límite</button>
                      </div>
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {[
                          { label: "+15 min", ms: 15 * 60_000 },
                          { label: "+1 h", ms: 60 * 60_000 },
                          { label: "+6 h", ms: 6 * 60 * 60_000 },
                          { label: "+24 h", ms: 24 * 60 * 60_000 },
                          { label: "+7 días", ms: 7 * 24 * 60 * 60_000 },
                        ].map(({ label, ms }) => (
                          <button
                            key={label}
                            type="button"
                            onClick={() => setEditPhaseData({ ...editPhaseData, closesAt: toLocalDateTimeInputValue(new Date(Date.now() + ms)) })}
                            className="text-xs bg-white border border-amber-300 px-2 py-1 rounded hover:bg-amber-100"
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-amber-700 mt-2">Cuando llegue esa hora, los votos quedarán bloqueados automáticamente. Deja vacío si no quieres límite de tiempo.</p>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button onClick={async () => { await updatePhase(phase.id, editPhaseData); setEditingPhase(null); window.location.reload(); }} className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700">Guardar</button>
                      <button onClick={() => setEditingPhase(null)} className="bg-gray-300 text-gray-800 px-4 py-1.5 rounded text-sm hover:bg-gray-400">Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded font-mono">Fase {idx + 1}</span>
                        <h3 className="font-bold text-lg text-gray-800">{phase.title}</h3>
                      </div>
                      <p className="text-xs text-gray-500 font-mono">Interno: {phase.name} · Estado: <span className="font-bold">{phase.status}</span></p>
                      {phase.closesAt && (
                        <p className="text-xs text-amber-700 font-mono mt-1">⏱ Cierra: {new Date(phase.closesAt).toLocaleString()}</p>
                      )}
                    </div>
                    <div className="flex gap-2 items-center">
                      <div className="flex flex-col -my-1">
                        <button
                          disabled={idx === 0}
                          onClick={async () => {
                            const res = await reorderPhase(phase.id, "up");
                            if (res?.error) { alert(res.error); return; }
                            window.location.reload();
                          }}
                          className="text-gray-500 hover:text-gray-800 disabled:opacity-20 disabled:cursor-not-allowed text-xs leading-none px-1"
                          title="Subir fase"
                        >▲</button>
                        <button
                          disabled={idx === phases.length - 1}
                          onClick={async () => {
                            const res = await reorderPhase(phase.id, "down");
                            if (res?.error) { alert(res.error); return; }
                            window.location.reload();
                          }}
                          className="text-gray-500 hover:text-gray-800 disabled:opacity-20 disabled:cursor-not-allowed text-xs leading-none px-1"
                          title="Bajar fase"
                        >▼</button>
                      </div>
                      <button
                        onClick={() => { setEditingPhase(phase.id); setEditPhaseData({ ...phase, closesAt: toLocalDateTimeInputValue(phase.closesAt) }); }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-2"
                      >
                        Editar
                      </button>
                      <select 
                        value={phase.status} 
                        onChange={async (e) => { await updatePhaseStatus(phase.id, e.target.value); window.location.reload(); }}
                        className="text-sm border border-gray-300 rounded p-1.5 bg-white"
                      >
                        <option value="PENDING">PENDING (Pendiente)</option>
                        <option value="ACTIVE">ACTIVE (Activa)</option>
                        <option value="SEALED">SEALED (Cerrada)</option>
                      </select>
                      <button
                        onClick={async () => {
                          if (!confirm('¿Eliminar fase, opciones y votos asociados?')) return;
                          const res = await deletePhase(phase.id);
                          if (res?.error) {
                            alert("Error al eliminar la fase: " + res.error);
                            return;
                          }
                          window.location.reload();
                        }}
                        className="text-red-500 hover:text-red-700 text-sm font-medium ml-2"
                      >
                        Eliminar
                      </button>
                    </div>
                  </>
                )}
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-700 text-sm">Opciones ({phase.options.length})</h4>
                  <button 
                    onClick={() => setOptionModal(phase.id)}
                    className="text-blue-600 text-sm hover:underline font-medium"
                  >
                    + Añadir Opción
                  </button>
                </div>

                {optionModal === phase.id && (
                  <form onSubmit={handleAddOption} className="mb-4 bg-blue-50 p-4 rounded border border-blue-100">
                    <h5 className="font-semibold text-blue-800 mb-3 text-sm">Añadir nueva opción a {phase.title}</h5>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Título (ej. "Warlock")</label>
                        <input required value={newOption.title} onChange={e => setNewOption({...newOption, title: e.target.value})} className="w-full border rounded p-1.5 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Tipo/Clase (ej. "Class · Pact")</label>
                        <input required value={newOption.kind} onChange={e => setNewOption({...newOption, kind: e.target.value})} className="w-full border rounded p-1.5 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">ID de Imagen / Slot ID (ej. "vote-warlock")</label>
                        <input required value={newOption.slotId} onChange={e => setNewOption({...newOption, slotId: e.target.value})} className="w-full border rounded p-1.5 text-sm" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Lore (Aparece en la parte frontal de la carta)</label>
                        <input required value={newOption.lore} onChange={e => setNewOption({...newOption, lore: e.target.value})} className="w-full border rounded p-1.5 text-sm" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Texto Adicional / Flavor (Aparece al confirmar el voto)</label>
                        <textarea required value={newOption.flavor} onChange={e => setNewOption({...newOption, flavor: e.target.value})} className="w-full border rounded p-1.5 text-sm" rows="2" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs hover:bg-blue-700">Añadir Opción</button>
                      <button type="button" onClick={() => setOptionModal(null)} className="text-gray-500 text-xs hover:underline">Cancelar</button>
                    </div>
                  </form>
                )}

                {phase.options.length === 0 ? (
                  <p className="text-xs text-gray-400">No hay opciones añadidas todavía.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {phase.options.map((opt, optIdx) => (
                      <div key={opt.id} className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
                        {editingOption === opt.id ? (
                          <div className="flex flex-col gap-2">
                            <input className="border p-1.5 rounded text-sm w-full font-bold" value={editOptionData.title} onChange={e=>setEditOptionData({...editOptionData, title: e.target.value})} placeholder="Título" />
                            <input className="border p-1.5 rounded text-sm w-full" value={editOptionData.kind} onChange={e=>setEditOptionData({...editOptionData, kind: e.target.value})} placeholder="Tipo/Clase" />
                            <input className="border p-1.5 rounded text-sm w-full" value={editOptionData.slotId} onChange={e=>setEditOptionData({...editOptionData, slotId: e.target.value})} placeholder="ID de Imagen" />
                            <input className="border p-1.5 rounded text-sm w-full" value={editOptionData.lore} onChange={e=>setEditOptionData({...editOptionData, lore: e.target.value})} placeholder="Lore (Frente)" />
                            <textarea className="border p-1.5 rounded text-sm w-full" value={editOptionData.flavor} onChange={e=>setEditOptionData({...editOptionData, flavor: e.target.value})} placeholder="Flavor (Reverso)" rows="2" />
                            <div className="flex gap-2 mt-1">
                              <button onClick={async () => { await updateOption(opt.id, editOptionData); setEditingOption(null); window.location.reload(); }} className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs hover:bg-blue-700">Guardar</button>
                              <button onClick={() => setEditingOption(null)} className="bg-gray-300 text-gray-800 px-3 py-1.5 rounded text-xs hover:bg-gray-400">Cancelar</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-4">
                            <OptionImageBox 
                              option={opt} 
                              timestamp={timestamp}
                              onUpload={(e) => handleImageUpload(e, `${opt.slotId}.png`)}
                              onDelete={() => handleDeleteImage(`${opt.slotId}.png`)}
                            />
                            <div className="flex-grow flex flex-col justify-between">
                              <div>
                                <div className="flex justify-between items-start">
                                  <div className="font-semibold text-sm text-gray-800">{opt.title}</div>
                                  <div className="flex gap-2 items-center">
                                    <button
                                      disabled={optIdx === 0}
                                      onClick={async () => {
                                        const res = await reorderOption(opt.id, "up");
                                        if (res?.error) { alert(res.error); return; }
                                        window.location.reload();
                                      }}
                                      className="text-gray-500 hover:text-gray-800 disabled:opacity-20 disabled:cursor-not-allowed text-xs leading-none"
                                      title="Subir opción"
                                    >▲</button>
                                    <button
                                      disabled={optIdx === phase.options.length - 1}
                                      onClick={async () => {
                                        const res = await reorderOption(opt.id, "down");
                                        if (res?.error) { alert(res.error); return; }
                                        window.location.reload();
                                      }}
                                      className="text-gray-500 hover:text-gray-800 disabled:opacity-20 disabled:cursor-not-allowed text-xs leading-none"
                                      title="Bajar opción"
                                    >▼</button>
                                    <button
                                      onClick={() => { setEditingOption(opt.id); setEditOptionData(opt); }}
                                      className="text-blue-500 hover:text-blue-700 text-xs font-medium"
                                    >
                                      Editar
                                    </button>
                                    <button
                                      onClick={async () => {
                                        if (!confirm('¿Eliminar esta opción y los votos asociados?')) return;
                                        const res = await deleteOption(opt.id);
                                        if (res?.error) {
                                          alert("Error al eliminar la opción: " + res.error);
                                          return;
                                        }
                                        window.location.reload();
                                      }}
                                      className="text-red-400 hover:text-red-600 text-xs"
                                      title="Eliminar opción"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                </div>
                                <div className="text-xs text-gray-400 mb-1">{opt.kind}</div>
                                <div className="text-xs text-gray-500 line-clamp-2 leading-tight">{opt.lore}</div>
                              </div>
                              <div className="text-[10px] text-blue-500 font-mono mt-2 bg-blue-50 inline-block px-1.5 py-0.5 rounded self-start">
                                ID: {opt.slotId}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </ImageUrlProvider>
  );
}

function ImageBox({ id, title, onUpload, onDelete, timestamp }) {
  const [error, setError] = useState(false);
  const registeredUrl = useImageUrl(id);
  const baseSrc = registeredUrl || `/images/${id}.png`;
  const src = baseSrc.includes("?") ? `${baseSrc}&v=${timestamp}` : `${baseSrc}?v=${timestamp}`;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded p-3 text-center relative group">
      <div className="h-24 bg-gray-100 rounded mb-2 overflow-hidden relative border border-gray-200">
        {!error ? (
          <>
            <img
              key={`${timestamp}-${id}`}
              src={src}
              alt={title}
              className="w-full h-full object-contain"
              onError={() => setError(true)}
              onLoad={() => setError(false)}
            />
            {/* Delete Cross */}
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-600 shadow-sm"
              title="Eliminar imagen"
            >
              ✕
            </button>
            {/* Upload Overlay */}
            <label className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center cursor-pointer opacity-0 transition group-hover:opacity-100 z-0">
              <span className="text-white text-[10px] font-bold px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded shadow">Cambiar</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { setError(false); onUpload(e); }} />
            </label>
          </>
        ) : (
          <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition">
            <span className="text-xl text-gray-400 mb-1">+</span>
            <span className="text-xs text-gray-500 font-medium">Subir</span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => { setError(false); onUpload(e); }} />
          </label>
        )}
      </div>
      <div className="text-xs font-semibold text-gray-800">{title}</div>
      <div className="text-[10px] text-gray-500 font-mono mt-1">{id}.png</div>
    </div>
  );
}

function OptionImageBox({ option, onUpload, onDelete, timestamp }) {
  const [error, setError] = useState(false);
  const registeredUrl = useImageUrl(option.slotId);
  const baseSrc = registeredUrl || `/images/${option.slotId}.png`;
  const src = baseSrc.includes("?") ? `${baseSrc}&v=${timestamp}` : `${baseSrc}?v=${timestamp}`;

  return (
    <div className="w-20 h-20 bg-gray-200 rounded overflow-hidden flex-shrink-0 relative group border border-gray-300">
      {!error ? (
        <>
          <img
            key={`${timestamp}-${option.id}`}
            src={src}
            alt={option.title}
            className="w-full h-full object-cover"
            onError={() => setError(true)}
            onLoad={() => setError(false)}
          />
          {/* Delete Cross */}
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[8px] opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-600 shadow-sm"
            title="Eliminar imagen"
          >
            ✕
          </button>
          {/* Upload Overlay */}
          <label className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center cursor-pointer opacity-0 transition group-hover:opacity-100 z-0">
            <span className="text-white text-[9px] font-bold px-1.5 py-0.5 bg-blue-600 hover:bg-blue-700 rounded shadow">Cambiar</span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => { setError(false); onUpload(e); }} />
          </label>
        </>
      ) : (
        <label className="absolute inset-0 flex items-center justify-center cursor-pointer bg-gray-100 hover:bg-gray-200 transition">
          <span className="text-[10px] text-gray-500 font-bold px-1 text-center">+ Imagen</span>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => { setError(false); onUpload(e); }} />
        </label>
      )}
    </div>
  );
}
