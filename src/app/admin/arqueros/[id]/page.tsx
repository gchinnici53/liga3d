import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { nombreCompleto, mesNacimiento, etiquetaPosicion } from "@/lib/scoring";

type Props = { params: { id: string } };

export default async function DetalleArqueroPage({ params }: Props) {
  const id = Number(params.id);
  if (isNaN(id)) notFound();

  const arquero = await prisma.arquero.findUnique({
    where: { id },
    include: {
      categoria: true,
      resultados: {
        include: { torneo: { include: { temporada: true } }, categoria: true },
        orderBy: { torneo: { fecha: "desc" } },
      },
    },
  });

  if (!arquero) notFound();

  const fechaNac = new Date(arquero.fechaNacimiento);
  const meses = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

  return (
    <div className="p-6 max-w-3xl">
      {/* Navegación */}
      <Link href="/admin/arqueros" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
        ← Volver a arqueros
      </Link>

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mt-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {nombreCompleto(arquero.nombre, arquero.apellido)}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">{arquero.categoria.nombre}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/arqueros/${id}/editar`}
            className="border border-slate-300 bg-white text-slate-700 px-4 py-2 rounded-lg text-sm hover:bg-slate-50 transition-colors"
          >
            Editar
          </Link>
        </div>
      </div>

      {/* Datos personales */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Datos personales</h2>
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Campo titulo="DNI"         valor={arquero.dni} />
          <Campo titulo="Sexo"        valor={arquero.sexo === "MASCULINO" ? "Masculino" : "Femenino"} />
          <Campo titulo="País"        valor={arquero.pais} />
          <Campo titulo="Nacimiento"  valor={`${fechaNac.getDate()} ${meses[fechaNac.getMonth()]} ${fechaNac.getFullYear()}`} />
          <Campo titulo="Cumpleaños"  valor={`${meses[mesNacimiento(fechaNac) - 1]}`} />
          <Campo titulo="Estado">
            <Badge variante={arquero.activo ? "activo" : "inactivo"} />
          </Campo>
        </dl>
      </div>

      {/* Contacto */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Contacto</h2>
        <dl className="grid grid-cols-2 gap-4">
          <Campo titulo="Email"    valor={arquero.email    ?? "—"} />
          <Campo titulo="Teléfono" valor={arquero.telefono ?? "—"} />
        </dl>
      </div>

      {/* Historial de resultados */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-700">Historial de torneos</h2>
        </div>
        {arquero.resultados.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">Sin resultados aún.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Torneo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Categoría</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Puntaje</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Posición</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Pts temp.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {arquero.resultados.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{r.torneo.nombre}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(r.torneo.fecha).toLocaleDateString("es-AR")} · {r.torneo.temporada.nombre}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">{r.categoria.nombre}</td>
                  <td className="px-4 py-3 text-right text-slate-800">{r.puntajeTotal}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={r.esMedallista ? "font-semibold text-amber-600" : "text-slate-600"}>
                      {etiquetaPosicion(r.posicion)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-green-700">{r.puntosTemporada}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Campo({
  titulo,
  valor,
  children,
}: {
  titulo: string;
  valor?: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs text-slate-500 mb-0.5">{titulo}</dt>
      <dd className="text-sm font-medium text-slate-800">{children ?? valor}</dd>
    </div>
  );
}
