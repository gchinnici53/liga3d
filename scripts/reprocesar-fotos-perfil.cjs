// Reprocesa las fotos de perfil ya subidas: las redimensiona a 800px de
// lado mayor y las recomprime, manteniendo el mismo nombre de archivo (así
// las referencias en la base de datos no cambian). Correr una sola vez
// después de desplegar el procesamiento automático en el upload:
//   node scripts/reprocesar-fotos-perfil.cjs
const fs = require("fs/promises");
const path = require("path");
const sharp = require("sharp");

const DIR = path.join(__dirname, "..", "public", "uploads", "profiles");
const LADO_MAYOR = 800;
const CALIDAD = 82;
const UMBRAL_KB = 300; // no vale la pena tocar archivos ya livianos y chicos

async function main() {
  let archivos;
  try {
    archivos = await fs.readdir(DIR);
  } catch {
    console.log(`No existe ${DIR}, nada para procesar.`);
    return;
  }

  let procesados = 0, saltados = 0, errores = 0;

  for (const nombre of archivos) {
    const ruta = path.join(DIR, nombre);
    const stat = await fs.stat(ruta);
    if (!stat.isFile()) continue;

    try {
      const original = await fs.readFile(ruta);
      const metadata = await sharp(original).metadata();
      const pesoKB = stat.size / 1024;

      if ((metadata.width ?? 0) <= LADO_MAYOR && (metadata.height ?? 0) <= LADO_MAYOR && pesoKB <= UMBRAL_KB) {
        saltados++;
        continue;
      }

      let img = sharp(original)
        .rotate()
        .resize({ width: LADO_MAYOR, height: LADO_MAYOR, fit: "inside", withoutEnlargement: true });

      const formato = (metadata.format || "").toLowerCase();
      if (formato === "png") img = img.png({ compressionLevel: 9 });
      else if (formato === "webp") img = img.webp({ quality: CALIDAD });
      else img = img.jpeg({ quality: CALIDAD });

      const nuevo = await img.toBuffer();
      await fs.writeFile(ruta, nuevo);
      procesados++;
      console.log(`${nombre}: ${pesoKB.toFixed(0)}KB -> ${(nuevo.length / 1024).toFixed(0)}KB`);
    } catch (e) {
      errores++;
      console.error(`Error con ${nombre}:`, e.message);
    }
  }

  console.log(`\nListo. Procesadas: ${procesados}, ya livianas: ${saltados}, errores: ${errores}`);
}

main();
