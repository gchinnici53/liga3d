import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Calendario — Liga 3D" };

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

type TorneoCard = {
  id: number;
  nombre: string;
  lugar: string;
  fecha: Date;
  horario: string | null;
  direccion: string | null;
  afiche: string | null;
  maxInscriptos: number;
  _count: { inscripciones: number; resultados: number };
};

function estadoBoton(torneo: TorneoCard) {
  const ahora       = new Date();
  const fechaTorneo = new Date(torneo.fecha);

  if (ahora > fechaTorneo) {
    const href = torneo._count.resultados > 0 ? `/resultados/${torneo.id}` : undefined;
    return { label: "Ver resultados", href, variante: "resultados" as const };
  }

  const lunesAnterior = new Date(fechaTorneo);
  lunesAnterior.setDate(fechaTorneo.getDate() - ((fechaTorneo.getDay() + 6) % 7));
  lunesAnterior.setHours(23, 59, 59, 999);

  const dias       = Math.ceil((fechaTorneo.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24));
  const cupoLleno  = torneo._count.inscripciones >= torneo.maxInscriptos;
  const fechaCerrada = ahora > lunesAnterior;

  if (cupoLleno || fechaCerrada) return { label: "Inscripciones cerradas", variante: "cerrado" as const };
  if (dias <= 30) return { label: "Inscribirse", href: `/inscripcion/${torneo.id}`, variante: "inscripcion" as const };
  return { label: "Próximamente", variante: "proximamente" as const };
}

function contadorInscriptos(torneo: TorneoCard) {
  const ahora = new Date();
  const esPasado = ahora > new Date(torneo.fecha);
  if (esPasado) {
    return torneo._count.resultados > 0
      ? `${torneo._count.resultados} participantes`
      : "Sin resultados";
  }
  return `${torneo._count.inscripciones} inscriptos · cupo ${torneo.maxInscriptos}`;
}

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
      <p className="text-slate-500 text-sm mb-10">Todos los torneos de la liga</p>

      {temporadas.length === 0 && (
        <div className="text-center py-16 text-slate-400">No hay torneos programados.</div>
      )}

      <div className="space-y-16">
        {temporadas.map((temporada) => (
          <div key={temporada.id}>
            {/* Encabezado de temporada */}
            <div className="flex items-center gap-4 mb-8">
              <h2 className="font-horta text-2xl text-liga">{temporada.nombre}</h2>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                temporada.estado === "ACTIVA"
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-500"
              }`}>
                {temporada.estado === "ACTIVA" ? "En curso" : "Finalizada"}
              </span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {temporada.torneos.length === 0 ? (
              <p className="text-slate-400 text-sm">Sin torneos en esta temporada.</p>
            ) : (
              <div className="space-y-12">
                {temporada.torneos.map((torneo) => {
                  const fecha  = new Date(torneo.fecha);
                  const estado = estadoBoton(torneo);

                  return (
                    <div key={torneo.id} className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12 border-b border-slate-100 last:border-0">
                      {/* Columna izquierda: imagen + info */}
                      <div>
                        <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[4/3] flex items-center justify-center">
                          {torneo.afiche ? (
                            <Image
                              src={torneo.afiche}
                              alt={`Afiche ${torneo.nombre}`}
                              width={600}
                              height={450}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="text-center text-slate-300">
                              <p className="text-5xl mb-2">🏹</p>
                              <p className="text-sm">Sin afiche</p>
                            </div>
                          )}
                        </div>

                        <div className="mt-4">
                          <h3 className="text-xl font-bold text-slate-800">{torneo.nombre}</h3>
                          <p className="text-liga font-semibold text-lg mt-0.5">
                            {MESES[fecha.getMonth()]} {fecha.getDate()}
                            {torneo.horario ? ` — ${torneo.horario}` : ""}
                          </p>
                          {torneo.lugar && (
                            <p className="text-slate-500 text-sm mt-1">{torneo.lugar}</p>
                          )}
                          {torneo.direccion && (
                            <p className="text-slate-400 text-xs mt-0.5">{torneo.direccion}</p>
                          )}
                          <p className="text-xs text-slate-400 mt-1">{contadorInscriptos(torneo)}</p>
                        </div>
                      </div>

                      {/* Columna derecha: mapa + botón */}
                      <div className="flex flex-col gap-4">
                        <div className="rounded-2xl overflow-hidden border border-slate-200 flex-1 min-h-[280px]">
                          {torneo.direccion ? (
                            <iframe
                              src={`https://maps.google.com/maps?q=${encodeURIComponent(torneo.direccion)}&output=embed`}
                              className="w-full h-full min-h-[280px]"
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                            />
                          ) : (
                            <div className="w-full h-full min-h-[280px] flex items-center justify-center bg-slate-100 text-slate-300">
                              <p className="text-sm">Sin ubicación cargada</p>
                            </div>
                          )}
                        </div>

                        {estado.href ? (
                          <Link
                            href={estado.href}
                            className={[
                              "block text-center font-semibold py-3 rounded-xl transition-colors",
                              estado.variante === "inscripcion"
                                ? "bg-liga hover:bg-liga-dark text-white"
                                : "border border-slate-300 text-slate-700 hover:bg-slate-50",
                            ].join(" ")}
                          >
                            {estado.label}
                          </Link>
                        ) : (
                          <div className="text-center font-semibold py-3 rounded-xl bg-slate-100 text-slate-400">
                            {estado.label}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
