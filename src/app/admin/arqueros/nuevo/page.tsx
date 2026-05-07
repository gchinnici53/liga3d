import { crearArquero } from "../actions";
import ArqueroForm from "@/components/forms/ArqueroForm";
import Link from "next/link";

export default function NuevoArqueroPage() {
  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <Link href="/admin/arqueros" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
          ← Volver a arqueros
        </Link>
        <h1 className="text-2xl font-bold text-slate-800 mt-2">Nuevo arquero</h1>
      </div>

      <ArqueroForm
        action={crearArquero}
        submitLabel="Crear arquero"
      />
    </div>
  );
}
