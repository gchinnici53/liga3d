"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

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

type Temporada = {
  id: number;
  nombre: string;
  estado: string;
  torneos: TorneoCard[];
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

  const dias         = Math.ceil((fechaTorneo.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24));
  const cupoLleno    = torneo._count.inscripciones >= torneo.maxInscriptos;
  const fechaCerrada = ahora > lunesAnterior;

  if (cupoLleno || fechaCerrada) return { label: "Inscripciones cerradas", variante: "cerrado" as const };
  if (dias <= 30) return { label: "Inscribirse", href: `/inscripcion/${torneo.id}`, variante: "inscripcion" as const };
  return { label: "Próximamente", variante: "proximamente" as const };
}

function contadorInscriptos(torneo: TorneoCard) {
  const esPasado = new Date() > new Date(torneo.fecha);
  if (esPasado) return torneo._count.resultados > 0 ? `${torneo._count.resultados} participantes` : "Sin resultados";
  return `${torneo._count.inscripciones} inscriptos · cupo ${torneo.maxInscriptos}`;
}

export default function CalendarioTabs({ temporadas }: { temporadas: Temporada[] }) {
  const [activa, setActiva] = useState(temporadas[0]?.id ?? 0);
  const temporada = temporadas.find((t) => t.id === activa);

  return (
    <>
      {/* Tabs de temporada */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-10 scrollbar-hide">
        {temporadas.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiva(t.id)}
            className={[
              "px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors shrink-0",
              activa === t.id
                ? "bg-liga text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            ].join(" ")}
          >
            {t.nombre}
            {t.estado === "ACTIVA" && (
              <span className="ml-1.5 text-xs font-normal opacity-80">● En curso</span>
            )}
          </button>
        ))}
      </div>

      {/* Torneos de la temporada seleccionada */}
      {!temporada || temporada.torneos.length === 0 ? (
        <div className="text-center py-16 text-slate-400">Sin torneos en esta temporada.</div>
      ) : (
        <div className="space-y-12">
          {temporada.torneos.map((torneo) => {
            const fecha  = new Date(torneo.fecha);
            const estado = estadoBoton(torneo);

            return (
              <div key={torneo.id} className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12 border-b border-slate-100 last:border-0">
                {/* Izquierda: imagen + info */}
                <div>
                  <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[4/3] flex items-center justify-center">
                    {torneo.afiche ? (
                      <Image src={torneo.afiche} alt={torneo.nombre} width={600} height={450} className="w-full h-full object-contain" />
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
                    {torneo.lugar    && <p className="text-slate-500 text-sm mt-1">{torneo.lugar}</p>}
                    {torneo.direccion && <p className="text-slate-400 text-xs mt-0.5">{torneo.direccion}</p>}
                    <p className="text-xs text-slate-400 mt-1">{contadorInscriptos(torneo)}</p>
                  </div>
                </div>

                {/* Derecha: mapa + botón */}
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
    </>
  );
}
