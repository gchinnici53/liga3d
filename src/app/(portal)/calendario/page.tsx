import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import CalendarioTabs from "./CalendarioTabs";

export const metadata: Metadata = { title: "Calendario — Liga 3D" };

export default async function CalendarioPage() {
  const temporadas = await prisma.temporada.findMany({
    orderBy: { anio: "desc" },
    include: {
      torneos: {
        orderBy: { fecha: "asc" },
        include: {
          _count: { select: { inscripciones: true, resultados: true } },
        },
      },
    },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="font-horta text-4xl text-slate-800 mb-2">Calendario</h1>
      <p className="text-slate-500 text-sm mb-8">Todos los torneos de la liga</p>
      <CalendarioTabs temporadas={temporadas} />
    </div>
  );
}
