"use client";

import { useState, useTransition } from "react";
import { guardarResultadosManual } from "./actions";
import type { FilaManual, GuardarResult } from "./actions";
import type { InscriptoConMatch } from "./page";
import { calcularPuntosTemporada } from "@/lib/scoring";
import type { TipoTorneo } from "@/types/enums";

type Arquero = { id: number; nombre: string; apellido: string };
type Categoria = { id: number; nombre: string };

type Fila = {
  key: string;          // identificador único en la UI
  arqueroId: number | null;
  posicion: string;
  puntajeRonda1: string;
  puntajeRonda2: string;
  // label para mostrar qué inscripto pre-populó esta fila
  inscriptoLabel: string;
};

type Props = {
  torneoId: number;
  tipoTorneo: string;
  categorias: Categoria[];
  categoriasConInscriptos: string[];
  inscriptosPorCategoria: Record<string, InscriptoConMatch[]>;
  arqueros: Arquero[];
};

const ORDEN_CATEGORIAS = ["CM","CW","BM","BW","LM","LW","TM","TW","ESC","JUN"];

function filaVacia(key: string): Fila {
  return { key, arqueroId: null, posicion: "", puntajeRonda1: "", puntajeRonda2: "", inscriptoLabel: "" };
}

function filasDesdeInscriptos(inscriptos: InscriptoConMatch[]): Fila[] {
  return inscriptos.map((i, idx) => ({
    key:            `insc-${i.inscripcionId}-${idx}`,
    arqueroId:      i.arqueroId,
    posicion:       "",
    puntajeRonda1:  "",
    puntajeRonda2:  "",
    inscriptoLabel: `${i.apellido}, ${i.nombre}`,
  }));
}

export default function CargarManualCliente({
  torneoId,
  tipoTorneo,
  categorias,
  categoriasConInscriptos,
  inscriptosPorCategoria,
  arqueros,
}: Props) {
  // Ordenar tabs: primero las que tienen inscriptos, en orden de ORDEN_CATEGORIAS
  const tabsOrdenados = ORDEN_CATEGORIAS.filter((n) => categorias.some((c) => c.nombre === n));
  const [categoriaNombre, setCategoriaNombre] = useState<string>(
    tabsOrdenados.find((n) => categoriasConInscriptos.includes(n)) ?? tabsOrdenados[0] ?? ""
  );

  const categoriaActual = categorias.find((c) => c.nombre === categoriaNombre);

  // Filas por categoría — se inicializan al cambiar de tab
  const [filasPorCat, setFilasPorCat] = useState<Record<string, Fila[]>>(() => {
    const init: Record<string, Fila[]> = {};
    for (const cat of ORDEN_CATEGORIAS) {
      const inscriptos = inscriptosPorCategoria[cat] ?? [];
      init[cat] = inscriptos.length > 0
        ? filasDesdeInscriptos(inscriptos)
        : [filaVacia(`new-0`)];
    }
    return init;
  });

  const [resultado, setResultado]     = useState<GuardarResult | null>(null);
  const [guardadoCat, setGuardadoCat] = useState<string | null>(null);
  const [isPending, start]            = useTransition();

  const filas = filasPorCat[categoriaNombre] ?? [];

  function setFilas(fn: (prev: Fila[]) => Fila[]) {
    setFilasPorCat((prev) => ({ ...prev, [categoriaNombre]: fn(prev[categoriaNombre] ?? []) }));
    setResultado(null);
    setGuardadoCat(null);
  }

  function actualizarFila(key: string, campo: keyof Fila, valor: string | number | null) {
    setFilas((prev) =>
      prev.map((f) => (f.key === key ? { ...f, [campo]: valor } : f))
    );
  }

  function agregarFila() {
    const key = `new-${Date.now()}`;
    setFilas((prev) => [...prev, filaVacia(key)]);
  }

  function eliminarFila(key: string) {
    setFilas((prev) => prev.filter((f) => f.key !== key));
  }

  function asignarPosiciones() {
    setFilas((prev) => {
      const conPuntaje = prev
        .map((f) => ({
          ...f,
          total: (Number(f.puntajeRonda1) || 0) + (Number(f.puntajeRonda2) || 0),
        }))
        .sort((a, b) => b.total - a.total);

      return conPuntaje.map((f, idx) => ({
        ...f,
        posicion: f.total > 0 ? String(idx + 1) : f.posicion,
      }));
    });
  }

  function handleGuardar() {
    if (!categoriaActual) return;

    const validas: FilaManual[] = [];
    for (const f of filas) {
      if (!f.arqueroId || !f.posicion || !f.puntajeRonda1) continue;
      validas.push({
        arqueroId:     f.arqueroId,
        posicion:      Number(f.posicion),
        puntajeRonda1: Number(f.puntajeRonda1),
        puntajeRonda2: f.puntajeRonda2 ? Number(f.puntajeRonda2) : null,
      });
    }

    if (validas.length === 0) return;

    start(async () => {
      const res = await guardarResultadosManual(validas, torneoId, categoriaActual.id);
      setResultado(res);
      setGuardadoCat(categoriaNombre);
    });
  }

  // ── Helpers de visualización ──────────────────────────────
  const tipo = tipoTorneo as TipoTorneo;

  function previsualizarPts(posicion: string) {
    const n = Number(posicion);
    if (!n || n < 1) return "—";
    return `+${calcularPuntosTemporada(n, tipo)}`;
  }

  function totalFila(f: Fila) {
    const t = (Number(f.puntajeRonda1) || 0) + (Number(f.puntajeRonda2) || 0);
    return t > 0 ? t : "—";
  }

  const filasCompletas = filas.filter((f) => f.arqueroId && f.posicion && f.puntajeRonda1).length;
  const hayIncompletas = filas.some((f) => (f.arqueroId || f.puntajeRonda1) && (!f.arqueroId || !f.posicion || !f.puntajeRonda1));

  // Opciones de arqueros para el select (ordenados)
  const arqueroOptions = arqueros.map((a) => ({
    value: a.id,
    label: `${a.apellido}, ${a.nombre}`,
  }));

  return (
    <div>
      {/* Tabs de categoría */}
      <div className="flex gap-1.5 flex-wrap mb-6">
        {tabsOrdenados.map((nombre) => {
          const tieneInscriptos = categoriasConInscriptos.includes(nombre);
          const activa = nombre === categoriaNombre;
          return (
            <button
              key={nombre}
              onClick={() => {
                setCategoriaNombre(nombre);
                setResultado(null);
                setGuardadoCat(null);
              }}
              className={[
                "px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors",
                activa
                  ? "bg-slate-800 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200",
              ].join(" ")}
            >
              {nombre}
              {tieneInscriptos && !activa && (
                <span className="ml-1 text-xs opacity-60">●</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tabla de filas */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-4">
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between gap-2 flex-wrap">
          <h2 className="text-sm font-semibold text-slate-700">
            Categoría {categoriaNombre}
            {categoriasConInscriptos.includes(categoriaNombre) && (
              <span className="ml-2 text-xs font-normal text-slate-400">
                — pre-cargada con inscriptos
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={asignarPosiciones}
            className="text-xs text-blue-700 hover:text-blue-900 border border-blue-200 rounded-lg px-2.5 py-1 hover:bg-blue-50 transition-colors"
          >
            ↕ Ordenar por puntaje
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase w-8">Pos</th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase min-w-[200px]">Arquero</th>
                <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase w-24">Ronda 1</th>
                <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase w-24">Ronda 2</th>
                <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase w-16">Total</th>
                <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase w-16">Pts</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filas.map((fila) => (
                <tr key={fila.key} className="hover:bg-slate-50">
                  {/* Posición */}
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={1}
                      value={fila.posicion}
                      onChange={(e) => actualizarFila(fila.key, "posicion", e.target.value)}
                      placeholder="—"
                      className="w-12 border border-slate-200 rounded px-1.5 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-slate-300"
                    />
                  </td>

                  {/* Arquero select */}
                  <td className="px-3 py-2">
                    {fila.inscriptoLabel && (
                      <p className="text-xs text-slate-400 mb-0.5 truncate max-w-[220px]">
                        {fila.arqueroId ? "✓" : "⚠"} {fila.inscriptoLabel}
                      </p>
                    )}
                    <select
                      value={fila.arqueroId ?? ""}
                      onChange={(e) =>
                        actualizarFila(fila.key, "arqueroId", e.target.value ? Number(e.target.value) : null)
                      }
                      className="w-full border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white"
                    >
                      <option value="">— seleccionar arquero —</option>
                      {arqueroOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Ronda 1 */}
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      value={fila.puntajeRonda1}
                      onChange={(e) => actualizarFila(fila.key, "puntajeRonda1", e.target.value)}
                      placeholder="0"
                      className="w-20 border border-slate-200 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-slate-300 ml-auto block"
                    />
                  </td>

                  {/* Ronda 2 */}
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      value={fila.puntajeRonda2}
                      onChange={(e) => actualizarFila(fila.key, "puntajeRonda2", e.target.value)}
                      placeholder="—"
                      className="w-20 border border-slate-200 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-slate-300 ml-auto block"
                    />
                  </td>

                  {/* Total */}
                  <td className="px-3 py-2 text-right text-slate-600 font-medium">
                    {totalFila(fila)}
                  </td>

                  {/* Pts temporada */}
                  <td className="px-3 py-2 text-right font-semibold text-green-700 text-xs">
                    {previsualizarPts(fila.posicion)}
                  </td>

                  {/* Eliminar */}
                  <td className="px-2 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => eliminarFila(fila.key)}
                      className="text-slate-300 hover:text-red-500 transition-colors text-base leading-none"
                      title="Quitar fila"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Agregar fila */}
        <div className="px-4 py-3 border-t border-slate-100">
          <button
            type="button"
            onClick={agregarFila}
            className="text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            + Agregar arquero
          </button>
        </div>
      </div>

      {/* Advertencia filas incompletas */}
      {hayIncompletas && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700 mb-4">
          Hay filas con datos incompletos (sin arquero, puntaje o posición) que no se guardarán.
        </div>
      )}

      {/* Resultado del guardado */}
      {resultado && guardadoCat === categoriaNombre && (
        <div className={[
          "rounded-xl px-4 py-3 text-sm mb-4",
          resultado.errores.length > 0
            ? "bg-red-50 border border-red-200 text-red-700"
            : "bg-green-50 border border-green-200 text-green-700",
        ].join(" ")}>
          {resultado.creados > 0 && <p>✓ {resultado.creados} resultado(s) creado(s)</p>}
          {resultado.actualizados > 0 && <p>✓ {resultado.actualizados} resultado(s) actualizado(s)</p>}
          {resultado.errores.map((e, i) => <p key={i}>⚠ {e}</p>)}
        </div>
      )}

      {/* Acciones */}
      <div className="flex gap-3 items-center">
        <button
          type="button"
          onClick={handleGuardar}
          disabled={isPending || filasCompletas === 0}
          className="bg-slate-800 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? "Guardando..." : `Guardar ${categoriaNombre} (${filasCompletas} ${filasCompletas === 1 ? "resultado" : "resultados"})`}
        </button>
        <a
          href={`/admin/torneos/${torneoId}`}
          className="text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          Ver torneo →
        </a>
      </div>
    </div>
  );
}
