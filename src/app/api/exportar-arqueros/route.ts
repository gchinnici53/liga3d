import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const buscar = searchParams.get("buscar") ?? "";
  const estado = searchParams.get("estado") ?? "";

  const arqueros = await prisma.arquero.findMany({
    where: {
      AND: [
        buscar
          ? {
              OR: [
                { nombre:   { contains: buscar } },
                { apellido: { contains: buscar } },
                { dni:      { contains: buscar } },
              ],
            }
          : {},
        estado === "activo"   ? { activo: true }  :
        estado === "inactivo" ? { activo: false }  : {},
      ],
    },
    orderBy: [{ apellido: "asc" }, { nombre: "asc" }],
  });

  const filas = arqueros.map((a, idx) => ({
    "#":        idx + 1,
    Apellido:   a.apellido,
    Nombre:     a.nombre,
    Email:      a.email ?? "",
  }));

  const ws = XLSX.utils.json_to_sheet(filas);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Arqueros");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="arqueros.xlsx"`,
    },
  });
}
