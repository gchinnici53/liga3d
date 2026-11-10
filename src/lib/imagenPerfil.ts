import sharp from "sharp";

const LADO_MAYOR = 800;
const CALIDAD_JPEG = 82;

// Redimensiona y comprime una foto de perfil: máximo 800px de lado mayor,
// JPEG calidad 82%. Corrige la orientación según los metadatos EXIF.
export async function procesarFotoPerfil(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .rotate()
    .resize({ width: LADO_MAYOR, height: LADO_MAYOR, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: CALIDAD_JPEG })
    .toBuffer();
}
