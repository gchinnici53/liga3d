"use client";

import { useTransition, useState, useRef } from "react";
import { parseExcelArqueros, importarArqueros } from "../actions";
import type { ArqueroImportRow } from "@/types";

type Categoria = { id: number; nombre: string };

type Props = { categorias: Categoria[] };

type EstadoImport = "idle" | "preview" | "done";

export default function ImportarArquerosCliente({ categorias }: Props) {
  const [isPending, startTransition] = useTransition();
  const [estado, setEstado]         = useState<EstadoImport>("idle");
  const [filas, setFilas]           = useState<ArqueroImportRow[]>([]);
  const [errores, setErrores]       = useState<string[]>([]);
  const [resultado, setResultado]   = useState<{ creados: number; duplicados: number } | null>(null);
  const [sexo, setSexo]             = useState("MASCULINO");
  const [categoriaId, setCategoriaId] = useState(String(categorias[0]?.id ?? ""));
  const formRef = useRef<HTMLFormElement>(null);

  function handleParsear(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await parseExcelArqueros(formData);
      setFilas(res.filas);
      setErrores(res.errores);
      setEstado("preview");
    });
  }

  function handleImportar() {
    startTransition(async () => {
      const res = await importarArqueros(filas, sexo, Number(categoriaId));
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

  // ── Paso 3: resultado final ───────────────────────────────
  if (estado === "done" && resultado) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center max-w-sm mx-auto">
        <p className="text-4xl mb-4">✅</p>
        <h2 className="text-lg font-bold text-slate-800 mb-2">Importación completada</h2>
        <p className="text-slate-600 text-sm mb-1">
          <span className="font-semibold text-green-700">{resultado.creados}</span> arqueros creados
        </p>
        {resultado.duplicados > 0 && (
          <p className="text-slate-500 text-sm mb-4">
            {resultado.duplicados} omitidos (DNI ya existente)
          </p>
        )}
        <div className="flex gap-3 justify-center mt-6">
          <button
            onClick={reiniciar}
            className="border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm hover:bg-slate-50 transition-colors"
          >
            Importar otro archivo
          </button>
          <a
            href="/admin/arqueros"
            className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800 transition-colors"
          >
            Ver arqueros
          </a>
        </div>
      </div>
    );
  }

  // ── Paso 2: preview ───────────────────────────────────────
  if (estado === "preview") {
    return (
      <div className="space-y-4">
        {/* Errores de parseo */}
        {errores.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-red-700 mb-2">
              {errores.length} fila(s) con errores (serán omitidas):
            </p>
            <ul className="text-sm text-red-600 space-y-0.5 list-disc list-inside">
              {errores.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </div>
        )}

        {/* Configuración de importación */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">
            Configuración para las {filas.length} filas válidas
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Los arqueros importados usarán estos valores por defecto. Podés editarlos individualmente después.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">
                Sexo por defecto <span className="text-red-500">*</span>
              </label>
              <select
                value={sexo}
                onChange={(e) => setSexo(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="MASCULINO">Masculino</option>
                <option value="FEMENINO">Femenino</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">
                Categoría por defecto <span className="text-red-500">*</span>
              </label>
              <select
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tabla preview */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">
              Vista previa — {filas.length} arqueros
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Nombre</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">DNI</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">F. Nac.</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">País</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filas.map((fila, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-medium text-slate-800">
                      {fila.apellido}, {fila.nombre}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">{fila.dni}</td>
                    <td className="px-4 py-2.5 text-slate-600 hidden sm:table-cell">
                      {new Date(fila.fechaNacimientoISO).toLocaleDateString("es-AR")}
                    </td>
                    <td className="px-4 py-2.5 text-slate-500 hidden md:table-cell">{fila.email ?? "—"}</td>
                    <td className="px-4 py-2.5 text-slate-500 hidden md:table-cell">{fila.pais}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-3">
          <button
            onClick={handleImportar}
            disabled={isPending || filas.length === 0}
            className="bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? "Importando..." : `Confirmar importación (${filas.length})`}
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
        <label className="block text-sm font-medium text-slate-700 mb-3">
          Seleccioná el archivo Excel <span className="text-red-500">*</span>
        </label>
        <input
          name="archivo"
          type="file"
          accept=".xlsx,.xls"
          required
          className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
        />
        <p className="text-xs text-slate-400 mt-2">Formatos aceptados: .xlsx, .xls</p>
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
