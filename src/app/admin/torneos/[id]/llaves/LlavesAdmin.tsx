"use client";

import { useState, useTransition } from "react";
import { generarEliminatoria, registrarResultadoPartido, eliminarEliminatoria } from "./actions";
import { rondaNombre } from "@/lib/bracket";
import type { BracketData, PartidoLlave } from "@/lib/bracket";

type Categoria = { id: number; nombre: string };

type ElimInfo = {
  id: number;
  tamano: number;
  bracket: BracketData;
};

type Props = {
  torneoId: number;
  categorias: Categoria[];
  conteoPorCat: Record<number, number>;         // categoriaId → total de clasificados
  elimPorCat: Record<number, ElimInfo>;
};

const TAMANOS = [4, 8, 16, 24] as const;

// Mínimo de clasificados para habilitar cada tamaño de llave.
// Tamano 8 admite bye: con 5, 6 o 7 clasificados los seeds faltantes pasan directo.
const MINIMO_POR_TAMANO: Record<number, number> = { 4: 4, 8: 5, 16: 16, 24: 24 };

export default function LlavesAdmin({ torneoId, categorias, conteoPorCat, elimPorCat }: Props) {
  const [catActiva, setCatActiva] = useState(categorias[0]?.id ?? 0);
  const [tamanoSel, setTamanoSel] = useState<4 | 8 | 16 | 24>(8);
  const [isPending, start] = useTransition();
  const [msgError, setMsgError] = useState<string | null>(null);

  const cat       = categorias.find((c) => c.id === catActiva);
  const elim      = elimPorCat[catActiva];
  const clasificados = conteoPorCat[catActiva] ?? 0;

  function handleGenerar() {
    if (!cat) return;
    setMsgError(null);
    start(async () => {
      const res = await generarEliminatoria(torneoId, cat.id, tamanoSel);
      if (res.error) setMsgError(res.error);
    });
  }

  function handleGanador(matchId: string, ganadorId: number) {
    if (!elim) return;
    setMsgError(null);
    start(async () => {
      const res = await registrarResultadoPartido(elim.id, torneoId, matchId, ganadorId);
      if (res.error) setMsgError(res.error);
    });
  }

  function handleEliminar() {
    if (!cat) return;
    if (!confirm(`¿Resetear la llave de ${cat.nombre}? Se perderán todos los resultados del bracket.`)) return;
    start(async () => { await eliminarEliminatoria(torneoId, cat.id); });
  }

  return (
    <div>
      {/* Tabs categoría */}
      <div className="flex gap-1.5 flex-wrap mb-6">
        {categorias.map((c) => {
          const tieneElim = !!elimPorCat[c.id];
          return (
            <button
              key={c.id}
              onClick={() => { setCatActiva(c.id); setMsgError(null); }}
              className={[
                "px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors",
                c.id === catActiva ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200",
              ].join(" ")}
            >
              {c.nombre}
              {tieneElim && c.id !== catActiva && <span className="ml-1 text-xs opacity-60">●</span>}
            </button>
          );
        })}
      </div>

      {msgError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-4">
          {msgError}
        </div>
      )}

      {/* 3 o menos clasificados: no hay llave posible */}
      {clasificados <= 3 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-sm text-slate-500">
          Con 3 o menos clasificados no se arma llave en {cat?.nombre}. El oro queda para el mejor puntaje
          de la clasificación; plata y bronce siguen el orden de puntaje a continuación.
        </div>
      ) : !elim ? (
        /* Sin llave: formulario de generación */
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-semibold text-slate-800 mb-1">Generar llave — {cat?.nombre}</h2>
          <p className="text-sm text-slate-500 mb-4">
            {clasificados} arqueros clasificados en esta categoría. Seleccioná el tamaño del bracket:
          </p>
          <div className="flex flex-wrap gap-2 mb-5">
            {TAMANOS.map((t) => (
              <button
                key={t}
                onClick={() => setTamanoSel(t)}
                disabled={clasificados < MINIMO_POR_TAMANO[t]}
                className={[
                  "px-4 py-2 rounded-lg text-sm font-semibold border transition-colors",
                  tamanoSel === t
                    ? "bg-slate-800 text-white border-slate-800"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed",
                ].join(" ")}
              >
                {t === 4 ? "Semis (4)" : t === 8 ? "Cuartos (8)" : `Top ${t}`}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400 mb-4">
            {tamanoSel === 24
              ? "Seeds 1-8 ingresan en segunda ronda. Seeds 9-24 juegan primera ronda."
              : tamanoSel === 16
                ? "1 vs 16, 2 vs 15, 3 vs 14, 4 vs 13, 5 vs 12, 6 vs 11, 7 vs 10, 8 vs 9."
                : tamanoSel === 8
                  ? clasificados < 8
                    ? `1 vs 8, 2 vs 7, 3 vs 6, 4 vs 5. Con ${clasificados} clasificados, los seeds sin rival (bye) pasan directo de ronda.`
                    : "1 vs 8, 2 vs 7, 3 vs 6, 4 vs 5."
                  : "1 vs 4 y 2 vs 3. Ganadores: Final. Perdedores: Bronce."}
          </p>
          <button
            onClick={handleGenerar}
            disabled={isPending || clasificados < MINIMO_POR_TAMANO[tamanoSel]}
            className="bg-slate-800 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? "Generando..." : `Generar llave ${tamanoSel === 4 ? "Semis" : tamanoSel === 8 ? "Cuartos" : `Top ${tamanoSel}`}`}
          </button>
        </div>
      ) : (
        /* Bracket existente */
        <BracketDisplay
          bracket={elim.bracket}
          tamano={elim.tamano}
          onGanador={handleGanador}
          onReset={handleEliminar}
          isPending={isPending}
        />
      )}
    </div>
  );
}

// ── Componente de visualización del bracket ───────────────

function BracketDisplay({
  bracket, tamano, onGanador, onReset, isPending,
}: {
  bracket: BracketData;
  tamano: number;
  onGanador: (matchId: string, ganadorId: number) => void;
  onReset: () => void;
  isPending: boolean;
}) {
  const rondas = Array.from(new Set(bracket.map((p) => p.ronda))).sort((a, b) => a - b);
  const maxRonda = Math.max(...rondas);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Top {tamano} · {rondas.length} ronda(s)</p>
        <button
          onClick={onReset}
          disabled={isPending}
          className="text-xs text-red-600 hover:text-red-800 border border-red-200 rounded-lg px-2.5 py-1 hover:bg-red-50 transition-colors disabled:opacity-40"
        >
          Resetear llave
        </button>
      </div>

      {rondas.map((ronda) => {
        const partidos = bracket.filter((p) => p.ronda === ronda).sort((a, b) => a.num - b.num);
        // Separar final y bronce del resto
        const normales = partidos.filter((p) => p.tipo === "normal");
        const finalP   = partidos.find((p) => p.tipo === "final");
        const bronceP  = partidos.find((p) => p.tipo === "bronce");

        return (
          <div key={ronda} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-700">
                {rondaNombre(ronda, maxRonda, tamano)}
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {normales.map((p) => <PartidoRow key={p.id} partido={p} onGanador={onGanador} isPending={isPending} />)}
              {finalP  && <PartidoRow key={finalP.id}  partido={finalP}  onGanador={onGanador} isPending={isPending} label="🥇 Final" />}
              {bronceP && <PartidoRow key={bronceP.id} partido={bronceP} onGanador={onGanador} isPending={isPending} label="🥉 Bronce" />}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PartidoRow({
  partido, onGanador, isPending, label,
}: {
  partido: PartidoLlave;
  onGanador: (matchId: string, ganadorId: number) => void;
  isPending: boolean;
  label?: string;
}) {
  const { a1, a2, ganadorId } = partido;
  const listo = !!a1 && !!a2;
  const jugado = ganadorId !== null;

  function nombreCorto(c: NonNullable<typeof a1>) {
    return `${c.apellido}, ${c.nombre}`;
  }

  return (
    <div className="px-5 py-3 flex items-center gap-4 flex-wrap">
      {/* Label (Final / Bronce) */}
      {label && <span className="text-xs font-semibold text-slate-400 w-16 shrink-0">{label}</span>}

      {/* Arquero 1 */}
      <div className={["flex-1 min-w-[120px]", jugado && ganadorId === a1?.arqueroId ? "font-bold text-green-700" : "text-slate-700"].join(" ")}>
        {a1 ? (
          <span className="text-sm">
            <span className="text-xs text-slate-400 mr-1">{a1.seed}.</span>
            {nombreCorto(a1)}
            {jugado && ganadorId === a1.arqueroId && <span className="ml-1">🏆</span>}
          </span>
        ) : (
          <span className="text-sm text-slate-300 italic">Pendiente</span>
        )}
      </div>

      <span className="text-slate-300 text-sm font-bold">vs</span>

      {/* Arquero 2 */}
      <div className={["flex-1 min-w-[120px]", jugado && ganadorId === a2?.arqueroId ? "font-bold text-green-700" : "text-slate-700"].join(" ")}>
        {a2 ? (
          <span className="text-sm">
            <span className="text-xs text-slate-400 mr-1">{a2.seed}.</span>
            {nombreCorto(a2)}
            {jugado && ganadorId === a2.arqueroId && <span className="ml-1">🏆</span>}
          </span>
        ) : (
          <span className="text-sm text-slate-300 italic">Pendiente</span>
        )}
      </div>

      {/* Botones de resultado */}
      <div className="flex gap-2 shrink-0">
        {!listo ? (
          jugado
            ? <span className="text-xs text-slate-400 italic font-medium">Bye — pasa directo</span>
            : <span className="text-xs text-slate-300">—</span>
        ) : jugado ? (
          <button
            onClick={() => onGanador(partido.id, ganadorId === a1!.arqueroId ? a2!.arqueroId : a1!.arqueroId)}
            disabled={isPending}
            className="text-xs text-slate-400 hover:text-slate-600 border border-slate-200 rounded px-2 py-0.5 hover:bg-slate-50 transition-colors disabled:opacity-40"
          >
            Cambiar
          </button>
        ) : (
          <>
            <button
              onClick={() => onGanador(partido.id, a1!.arqueroId)}
              disabled={isPending}
              className="text-xs bg-green-700 text-white rounded px-2.5 py-1 hover:bg-green-800 disabled:opacity-40 transition-colors"
            >
              Gana {a1!.nombre.split(" ")[0]}
            </button>
            <button
              onClick={() => onGanador(partido.id, a2!.arqueroId)}
              disabled={isPending}
              className="text-xs bg-green-700 text-white rounded px-2.5 py-1 hover:bg-green-800 disabled:opacity-40 transition-colors"
            >
              Gana {a2!.nombre.split(" ")[0]}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
