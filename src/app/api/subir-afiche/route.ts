import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const formData  = await req.formData();
    const torneoId  = Number(formData.get("torneoId"));
    const afficheFile = formData.get("afiche") as File | null;

    if (!torneoId || isNaN(torneoId)) {
      return NextResponse.json({ error: "torneoId inválido" }, { status: 400 });
    }
    if (!afficheFile || afficheFile.size === 0) {
      return NextResponse.json({ error: "No se recibió ningún archivo." }, { status: 400 });
    }

    const ext      = afficheFile.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const filename = `afiche-${torneoId}-${Date.now()}.${ext}`;
    const root     = process.env.LIGA3D_ROOT ?? process.cwd();
    const dir      = path.join(root, "public", "uploads", "afiches");

    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), Buffer.from(await afficheFile.arrayBuffer()));

    const afiche = `/uploads/afiches/${filename}`;
    await prisma.torneo.update({ where: { id: torneoId }, data: { afiche } });

    revalidatePath(`/admin/torneos/${torneoId}`);
    revalidatePath("/calendario");

    return NextResponse.json({ afiche });
  } catch (e) {
    console.error("[subir-afiche] error:", e);
    return NextResponse.json({ error: "Error al guardar el afiche." }, { status: 500 });
  }
}
