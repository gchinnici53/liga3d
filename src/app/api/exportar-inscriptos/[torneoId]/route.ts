import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET(_req: Request, { params }: { params: { torneoId: string } }) {
  const torneoId = Number(params.torneoId);
  if (isNaN(torneoId)) return new NextResponse("Not found", { status: 404 });

  const torneo = await prisma.torneo.findUnique({
    where: { id: torneoId },
    include: {
      inscripciones: {
        orderBy: [{ categoria: "asc" }, { apellido: "asc" }],
      },
    },
  });
  if (!torneo) return new NextResponse("Not found", { status: 404 });

  const filas = torneo.inscripciones.map((i, idx) => ({
    "#":               idx + 1,
    Apellido:          i.apellido,
    Nombre:            i.nombre,
    Categoría:         i.categoria,
    DNI:               i.dni ?? "",
    "F. Nacimiento":   i.fechaNacimiento
      ? new Date(i.fechaNacimiento).toLocaleDateString("es-AR")
      : "",
    Email:             i.email,
    Teléfono:          i.telefono ?? "",
    Club:              i.club ?? "",
    Inscripto:         new Date(i.createdAt).toLocaleDateString("es-AR"),
  }));

  const ws = XLSX.utils.json_to_sheet(filas);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Inscriptos");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  const nombre = torneo.nombre.replace(/[^a-z0-9]/gi, "_");

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="inscriptos_${nombre}.xlsx"`,
    },
  });
}
