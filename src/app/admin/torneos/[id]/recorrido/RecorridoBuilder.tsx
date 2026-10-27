"use client";

import { useMemo, useState, useTransition } from "react";
import { guardarRecorrido, type EstacionInput } from "./actions";

type DianaOpcion = {
  id: number;
  nombre: string;
  cantidadZonas: number;
  cantidad: number;
  zonas: { zonaVital: number; torneosUsada: number; vidaRestante: number | null }[];
};

type EstacionForm = {
  numero: number;
  dianaId: number | null;
  zonaVital: number | null;
  cantidadUsada: string;
  metros: string;
};

const TOTAL_ESTACIONES = 24;

type Props = {
  torneoId: number;
  dianas: DianaOpcion[];
  estacionesIniciales: { numero: number; dianaId: number; zonaVital: number; cantidadUsada: number; metros: number }[];
};

export default function RecorridoBuilder({ torneoId, dianas, estacionesIniciales }: Props) {
  const inicial = useMemo<EstacionForm[]>(() => {
    const porNumero = new Map(estacionesIniciales.map((e) => [e.numero, e]));
    return Array.from({ length: TOTAL_ESTACIONES }, (_, i) => {
      const numero = i + 1;
      const existente = porNumero.get(numero);
      return {
        numero,
        dianaId: existente?.dianaId ?? null,
        zonaVital: existente?.zonaVital ?? null,
        cantidadUsada: existente ? String(existente.cantidadUsada) : "1",
        metros: existente ? String(existente.metros) : "",
      };
    });
  }, [estacionesIniciales]);

  const [estaciones, setEstaciones] = useState<EstacionForm[]>(inicial);
  const [isPending, startTransition] = useTransition();
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string; advertencias?: string[] } | null>(null);

  const dianasPorId = useMemo(() => new Map(dianas.map((d) => [d.id, d])), [dianas]);

  // Cuántas dianas de cada tipo ya están asignadas en este recorrido (estado actual, sin guardar).
  const usadasPorDiana = useMemo(() => {
    const map = new Map<number, number>();
    for (const e of estaciones) {
      if (!e.dianaId) continue;
      const cant = Number(e.cantidadUsada) || 0;
      map.set(e.dianaId, (map.get(e.dianaId) ?? 0) + cant);
    }
    return map;
  }, [estaciones]);

  function disponibles(dianaId: number): number {
    const diana = dianasPorId.get(dianaId);
    if (!diana) return 0;
    return diana.cantidad - (usadasPorDiana.get(dianaId) ?? 0);
  }

  function actualizar(numero: number, cambios: Partial<EstacionForm>) {
    setEstaciones((prev) =>
      prev.map((e) => (e.numero === numero ? { ...e, ...cambios } : e))
    );
  }

  function handleDianaChange(numero: number, dianaIdStr: string) {
    const dianaId = dianaIdStr ? Number(dianaIdStr) : null;
    actualizar(numero, { dianaId, zonaVital: null });
  }

  function guardar() {
    const payload: EstacionInput[] = estaciones
      .filter((e) => e.dianaId && e.zonaVital && e.metros.trim() !== "" && e.cantidadUsada.trim() !== "")
      .map((e) => ({
        numero: e.numero,
        dianaId: e.dianaId!,
        zonaVital: e.zonaVital!,
        cantidadUsada: Number(e.cantidadUsada),
        metros: Number(e.metros),
      }));

    setMensaje(null);
    startTransition(async () => {
      const res = await guardarRecorrido(torneoId, payload);
      if (res.error) {
        setMensaje({ tipo: "error", texto: res.error });
      } else {
        setMensaje({
          tipo: "ok",
          texto: `Recorrido guardado (${res.guardadas}/${TOTAL_ESTACIONES} estaciones completas).`,
          advertencias: res.advertencias,
        });
      }
    });
  }

  const completas = estaciones.filter((e) => e.dianaId && e.zonaVital && e.metros.trim() !== "").length;
  const dianasConUso = dianas.filter((d) => (usadasPorDiana.get(d.id) ?? 0) > 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">{completas}/{TOTAL_ESTACIONES} estaciones completas</p>
        <button
          onClick={guardar}
          disabled={isPending}
          className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800 disabled:opacity-50 transition-colors"
        >
          {isPending ? "Guardando..." : "Guardar recorrido"}
        </button>
      </div>

      {mensaje && (
        <div className={[
          "mb-4 text-sm rounded-lg p-3 border",
          mensaje.tipo === "ok" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-600",
        ].join(" ")}>
          <p>{mensaje.texto}</p>
          {mensaje.advertencias && mensaje.advertencias.length > 0 && (
            <ul className="mt-2 list-disc list-inside text-amber-700">
              {mensaje.advertencias.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          )}
        </div>
      )}

      {dianasConUso.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {dianasConUso.map((d) => {
            const resto = disponibles(d.id);
            return (
              <span
                key={d.id}
                className={[
                  "px-2.5 py-1 rounded-full text-xs font-semibold",
                  resto < 0 ? "bg-red-100 text-red-700" : resto === 0 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600",
                ].join(" ")}
              >
                {d.nombre}: quedan {resto} de {d.cantidad}
              </span>
            );
          })}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide w-12">#</th>
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Diana</th>
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide w-20">Cant.</th>
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Zona vital</th>
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide w-28">Metros</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {estaciones.map((e) => {
                const diana = e.dianaId ? dianasPorId.get(e.dianaId) : null;
                const zonaInfo = diana?.zonas.find((z) => z.zonaVital === e.zonaVital);
                const resto = e.dianaId ? disponibles(e.dianaId) : null;
                return (
                  <tr key={e.numero} className="hover:bg-slate-50">
                    <td className="px-3 py-2 text-slate-400 font-semibold">{e.numero}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <select
                          value={e.dianaId ?? ""}
                          onChange={(ev) => handleDianaChange(e.numero, ev.target.value)}
                          className="border border-slate-300 rounded px-2 py-1 text-sm w-full max-w-[200px]"
                        >
                          <option value="">— Elegir diana —</option>
                          {dianas.map((d) => (
                            <option key={d.id} value={d.id}>{d.nombre}</option>
                          ))}
                        </select>
                        {resto != null && (
                          <span
                            className={[
                              "px-1.5 py-0.5 rounded text-xs font-semibold whitespace-nowrap",
                              resto < 0 ? "bg-red-100 text-red-700" : resto === 0 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500",
                            ].join(" ")}
                          >
                            quedan {resto}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min={1}
                        value={e.cantidadUsada}
                        onChange={(ev) => actualizar(e.numero, { cantidadUsada: ev.target.value })}
                        disabled={!diana}
                        className="border border-slate-300 rounded px-2 py-1 text-sm w-16 disabled:bg-slate-100"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <select
                          value={e.zonaVital ?? ""}
                          onChange={(ev) => actualizar(e.numero, { zonaVital: ev.target.value ? Number(ev.target.value) : null })}
                          disabled={!diana}
                          className="border border-slate-300 rounded px-2 py-1 text-sm disabled:bg-slate-100"
                        >
                          <option value="">—</option>
                          {diana &&
                            Array.from({ length: diana.cantidadZonas }, (_, i) => i + 1).map((z) => (
                              <option key={z} value={z}>Zona {z}</option>
                            ))}
                        </select>
                        {zonaInfo && (
                          <span
                            title="Usos previos de esta zona"
                            className={[
                              "px-1.5 py-0.5 rounded text-xs font-semibold whitespace-nowrap",
                              zonaInfo.vidaRestante != null && zonaInfo.vidaRestante <= 0
                                ? "bg-red-100 text-red-700"
                                : "bg-slate-100 text-slate-600",
                            ].join(" ")}
                          >
                            {zonaInfo.torneosUsada} torneo{zonaInfo.torneosUsada !== 1 ? "s" : ""}
                            {zonaInfo.vidaRestante != null ? ` · quedan ${zonaInfo.vidaRestante}` : ""}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min={1}
                        step="0.5"
                        value={e.metros}
                        onChange={(ev) => actualizar(e.numero, { metros: ev.target.value })}
                        className="border border-slate-300 rounded px-2 py-1 text-sm w-20"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
