import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { procesarFotoPerfil } from "@/lib/imagenPerfil";

export async function POST(req: NextRequest) {
  try {
    const formData  = await req.formData();
    const arqueroId = Number(formData.get("arqueroId"));
    const dni       = (formData.get("dni") as string | null)?.trim() ?? "";
    const fotoFile  = formData.get("foto") as File | null;

    if (!arqueroId || isNaN(arqueroId)) {
      return NextResponse.json({ error: "ID inválido." }, { status: 400 });
    }
    if (!fotoFile || fotoFile.size === 0) {
      return NextResponse.json({ error: "No se recibió ningún archivo." }, { status: 400 });
    }

    // Validar DNI
    const arquero = await prisma.arquero.findUnique({
      where: { id: arqueroId },
      select: { dni: true },
    });
    if (!arquero || arquero.dni !== dni) {
      return NextResponse.json({ error: "DNI incorrecto." }, { status: 403 });
    }

    const filename = `arquero-${arqueroId}-${Date.now()}.jpg`;
    const root     = process.env.LIGA3D_ROOT ?? process.cwd();
    const dir      = path.join(root, "public", "uploads", "profiles");

    let buffer: Buffer;
    try {
      buffer = await procesarFotoPerfil(Buffer.from(await fotoFile.arrayBuffer()));
    } catch {
      return NextResponse.json({ error: "El archivo no es una imagen válida." }, { status: 400 });
    }

    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), buffer);

    const foto = `/uploads/profiles/${filename}`;
    await prisma.arquero.update({ where: { id: arqueroId }, data: { foto } });

    revalidatePath(`/arqueros/${arqueroId}`);
    revalidatePath(`/arqueros`);

    return NextResponse.json({ foto });
  } catch (e) {
    console.error("[perfil/subir-foto]", e);
    return NextResponse.json({ error: "Error al guardar la foto." }, { status: 500 });
  }
}
