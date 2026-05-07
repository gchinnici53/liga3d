import ImportarArquerosCliente from "./ImportarArquerosCliente";
import Link from "next/link";

export default function ImportarArquerosPage() {
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

      <ImportarArquerosCliente />
    </div>
  );
}
