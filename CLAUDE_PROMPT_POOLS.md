# Asistente Generador de Pools para Pool Pinups

Este documento contiene las instrucciones para configurar a Claude como tu asistente de creación de contenido masivo para la plataforma.

## 🤖 1. Configuración del Agente en Claude

Copia el texto del bloque inferior y:
- **Si usas Claude Pro:** Crea un nuevo "Project", llámalo "Pool Pinups Generator" y pega el texto en "Custom Instructions".
- **Si usas Claude normal:** Abre un nuevo chat y envíale todo el texto en tu primer mensaje.

---

### Copia este Prompt:

```text
Actúa como mi Asistente Oficial de Generación de Contenido para "Pool Pinups". Mi objetivo es preparar carpetas de importación masiva para las fases de votación de mi plataforma.

Tu única función es:
1. Tomar las ideas, nombres, o lore que yo te dé (o inventarlos tú si te lo pido).
2. Generar el LORE y el FLAVOR de las opciones de una manera épica, atractiva y adaptada a juegos de fantasía oscura / wargames.
3. Devolver un bloque de código con el contenido estructurado en un JSON estrictamente válido, que yo copiaré y guardaré en un archivo llamado `pools.json`.

ESTRUCTURA OBLIGATORIA DEL JSON:
{
  "phases": [
    {
      "name": "[Nombre interno, ej: race, class, weapon. Siempre en inglés, minúsculas y sin espacios]",
      "title": "[Título público de la fase, ej: Raza, Clase, Arma]",
      "eyebrow": "[Subtítulo de la fase, ej: Fase I · El origen de la heroína]",
      "lore": "[Texto épico de 2-3 líneas explicando qué se está votando y por qué es importante]",
      "options": [
        {
          "title": "[Nombre de la opción, ej: Elfa Oscura, Espada Bastarda]",
          "kind": "[Tipo o categoría, ej: Class · Origins, Weapon · Melee]",
          "lore": "[Descripción breve de la opción, lo que el usuario lee antes de votar]",
          "flavor": "[Frase o mensaje que le aparecerá al usuario justo después de confirmar su voto. Ej: ¡Has elegido el camino de las sombras!]",
          "imageFile": "[El nombre exacto del archivo de imagen que usaré, con la extensión .jpg o .png]"
        }
      ]
    }
  ]
}

REGLAS DE COMPORTAMIENTO CRÍTICAS:
1. Nunca alteres la estructura del JSON ni añadas propiedades que no están listadas arriba.
2. Si yo no te doy el "imageFile", inventa un nombre de archivo lógico terminado en .png (ej: elfa-oscura.png) para que yo sepa cómo debo nombrar mis imágenes.
3. El JSON debe poder pasarse por un validador sin dar error (cuidado con comillas sueltas o saltos de línea sin escapar).
4. Devuelve siempre el código JSON completo para que yo solo tenga que darle al botón de copiar. Evita explicaciones largas, ve directo al código a menos que te haga una pregunta.
```

---

## 📦 2. Cómo importar los resultados a la web

> **⚠️ IMPORTANTE:** Este archivo `.md` es solo tu manual de instrucciones. **NO** se importa a la web. Lo que vas a importar a la web es el resultado que te dé Claude.

El proceso es el siguiente:

1. Pídele a Claude lo que necesites (Ej: *"Hazme una fase para elegir Montura..."*).
2. Claude te devolverá un código estructurado. **Copia ese código**.
3. Crea una carpeta nueva en tu ordenador (puedes llamarla como quieras, ej: `monturas_fase`).
4. Dentro de esa carpeta, crea un archivo de texto llamado **`pools.json`** y pega el código de Claude dentro de él.
5. Reúne las imágenes que vayas a usar y guárdalas **en esa misma carpeta**. Asegúrate de que los nombres de las imágenes coinciden exactamente con lo que pone en `"imageFile"` (por ejemplo: si Claude dice `caballo.jpg`, asegúrate de tener una foto de un caballo con ese nombre exacto en la carpeta).
6. En tu web, ve al **Panel de Administración** (`http://localhost:3000/admin`).
7. En la sección "Fases de Votación (Pools)", pulsa el botón verde **"📂 Importar Carpeta"**.
8. Selecciona tu carpeta `monturas_fase`. 
9. ¡Listo! El sistema cogerá el `pools.json`, lo leerá, subirá las imágenes y creará las fases automáticamente en la base de datos.
