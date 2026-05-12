"use client";

import { useTransition, useState, useRef } from "react";
import { parseExcelResultados, importarResultados } from "./actions";
import type { FilaResultado } from "./actions";

type Estado = "idle" | "preview" | "done";

type Props = { torneoId: number; torneoNombre: string };

export default function ImportarResultadosCliente({ torneoId, torneoNombre }: Props) {
  const [isPending, startTransition] = useTransition();
  const [estado, setEstado]   = useState<Estado>("idle");
  const [filas, setFilas]     = useState<FilaResultado[]>([]);
  const [errores, setErrores] = useState<string[]>([]);
  const [resultado, setResultado] = useState<{ creados: number; omitidos: number } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const matcheadas  = filas.filter((f) => f.arqueroId !== null);
  const sinMatch    = filas.filter((f) => f.arqueroId === null);

  // Agrupar por categoría para el preview
  const porCategoria = filas.reduce<Record<string, FilaResultado[]>>((acc, f) => {
    if (!acc[f.categoria]) acc[f.categoria] = [];
    acc[f.categoria].push(f);
    return acc;
  }, {});

  function handleParsear(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await parseExcelResultados(formData, torneoId);
      setFilas(res.filas);
      setErrores(res.errores);
      setEstado("preview");
    });
  }

  function handleImportar() {
    startTransition(async () => {
      const res = await importarResultados(matcheadas, torneoId);
      setResultado(res);
      setEstado("done");
    });
  }

  function reiniciar() {
    setEstado("idle");
    setFilas([]);
    setErrores([]);
    setResultado(null);
    formRef.current?.reset();
  }

  // ── Paso 3: resultado ─────────────────────────────────────
  if (estado === "done" && resultado) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center max-w-sm mx-auto">
        <p className="text-4xl mb-4">✅</p>
        <h2 className="text-lg font-bold text-slate-800 mb-2">Importación completada</h2>
        <p className="text-slate-600 text-sm mb-1">
          <span className="font-semibold text-green-700">{resultado.creados}</span> resultados creados
        </p>
        {resultado.omitidos > 0 && (
          <p className="text-slate-500 text-sm">{resultado.omitidos} omitidos (sin match o duplicados)</p>
        )}
        <div className="flex gap-3 justify-center mt-6">
          <button onClick={reiniciar} className="border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm hover:bg-slate-50 transition-colors">
            Importar otro archivo
          </button>
          <a href={`/admin/torneos/${torneoId}`} className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800 transition-colors">
            Ver torneo
          </a>
        </div>
      </div>
    );
  }

  // ── Paso 2: preview ───────────────────────────────────────
  if (estado === "preview") {
    return (
      <div className="space-y-4">
        {/* Resumen */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Resumen del archivo</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-slate-800">{filas.length}</p>
              <p className="text-xs text-slate-500">filas totales</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700">{matcheadas.length}</p>
              <p className="text-xs text-slate-500">arqueros encontrados</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{sinMatch.length}</p>
              <p className="text-xs text-slate-500">no encontrados (se omiten)</p>
            </div>
          </div>
        </div>

        {/* Errores de parseo */}
        {errores.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-amber-700 mb-2">{errores.length} advertencia(s):</p>
            <ul className="text-sm text-amber-700 space-y-0.5 list-disc list-inside">
              {errores.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </div>
        )}

        {/* Tabla por categoría */}
        {Object.entries(porCategoria).map(([cat, rows]) => {
          const encontrados = rows.filter((r) => r.arqueroId !== null);
          const noEncontrados = rows.filter((r) => r.arqueroId === null);
          return (
            <div key={cat} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700">{cat}</h3>
                <span className="text-xs text-slate-500">
                  {encontrados.length}/{rows.length} encontrados
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase w-10">Pos</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Nombre Excel</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Match DB</th>
                      <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Puntaje</th>
                      <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Pts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.map((r, i) => (
                      <tr key={i} className={r.arqueroId ? "hover:bg-slate-50" : "bg-red-50"}>
                        <td className="px-3 py-2 font-semibold text-slate-600">{r.posicion}°</td>
                        <td className="px-3 py-2 text-slate-800">{r.apellido}, {r.nombre}</td>
                        <td className="px-3 py-2 hidden sm:table-cell">
                          {r.arqueroId
                            ? <span className="text-green-700 text-xs">✓ {r.arqueroNombreDb}</span>
                            : <span className="text-red-600 text-xs font-medium">No encontrado</span>
                          }
                        </td>
                        <td className="px-3 py-2 text-right text-slate-700">{r.puntajeRonda1}</td>
                        <td className="px-3 py-2 text-right font-semibold text-green-700">{r.puntosTemporada}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {noEncontrados.length > 0 && (
                <div className="px-5 py-2 bg-red-50 border-t border-red-100">
                  <p className="text-xs text-red-600">
                    {noEncontrados.length} arquero(s) no encontrados en la DB — serán omitidos:&nbsp;
                    {noEncontrados.map((r) => `${r.apellido} ${r.nombre}`).join(", ")}
                  </p>
                </div>
              )}
            </div>
          );
        })}

        {/* Acciones */}
        <div className="flex gap-3">
          <button
            onClick={handleImportar}
            disabled={isPending || matcheadas.length === 0}
            className="bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? "Importando..." : `Confirmar importación (${matcheadas.length} resultados)`}
          </button>
          <button
            onClick={reiniciar}
            disabled={isPending}
            className="border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm hover:bg-slate-50 transition-colors"
          >
            Cambiar archivo
          </button>
        </div>
      </div>
    );
  }

  // ── Paso 1: upload ────────────────────────────────────────
  return (
    <form ref={formRef} onSubmit={handleParsear} className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <p className="text-sm text-slate-600 mb-4">
          Subí el Excel del torneo <strong>{torneoNombre}</strong>. Debe tener una solapa por categoría
          (CM, CW, BM, BW, LM, LW, TM, TW, ESC, JUN) con columnas:
          <code className="mx-1 bg-slate-100 px-1 rounded text-xs">pos · Apellido · Nombre · Ronda 1 · Medalla</code>
        </p>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Archivo Excel <span className="text-red-500">*</span>
        </label>
        <input
          name="archivo"
          type="file"
          accept=".xlsx,.xls"
          required
          className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? "Procesando..." : "Procesar archivo →"}
      </button>
    </form>
  );
}
