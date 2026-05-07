import { prisma } from "@/lib/prisma";
import ImportarArquerosCliente from "./ImportarArquerosCliente";
import Link from "next/link";

export default async function ImportarArquerosPage() {
  const categorias = await prisma.categoria.findMany({
    where: { activa: true },
    orderBy: { nombre: "asc" },
    select: { id: true, nombre: true },
  });

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <Link href="/admin/arqueros" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
          ← Volver a arqueros
        </Link>
        <h1 className="text-2xl font-bold text-slate-800 mt-2">Importar desde Excel</h1>
        <p className="text-slate-500 text-sm mt-1">
          El archivo debe tener columnas: <strong>Nombre, Apellido, DNI, Fecha Nacimiento</strong> (obligatorias) y
          opcionalmente <em>email, tel, pais</em>.
        </p>
      </div>

      {categorias.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          Necesitás al menos una{" "}
          <Link href="/admin/categorias" className="underline font-medium">
            categoría
          </Link>{" "}
          antes de importar.
        </div>
      ) : (
        <ImportarArquerosCliente categorias={categorias} />
      )}
    </div>
  );
}
