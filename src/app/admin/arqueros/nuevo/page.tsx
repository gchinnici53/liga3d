import { prisma } from "@/lib/prisma";
import { crearArquero } from "../actions";
import ArqueroForm from "@/components/forms/ArqueroForm";
import Link from "next/link";

export default async function NuevoArqueroPage() {
  const categorias = await prisma.categoria.findMany({
    where: { activa: true },
    orderBy: { nombre: "asc" },
  });

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <Link href="/admin/arqueros" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
          ← Volver a arqueros
        </Link>
        <h1 className="text-2xl font-bold text-slate-800 mt-2">Nuevo arquero</h1>
      </div>

      {categorias.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          Primero necesitás crear al menos una{" "}
          <Link href="/admin/categorias" className="underline font-medium">
            categoría
          </Link>{" "}
          antes de agregar arqueros.
        </div>
      ) : (
        <ArqueroForm
          action={crearArquero}
          categorias={categorias}
          submitLabel="Crear arquero"
        />
      )}
    </div>
  );
}
