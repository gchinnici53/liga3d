"use client";

type Punto = {
  label: string;  // nombre corto del torneo
  valor: number;  // puntajeTotal
  esFinal: boolean;
};

const ALTO  = 160;
const ANCHO = 48;
const GAP   = 12;

export default function GraficoResultados({ puntos }: { puntos: Punto[] }) {
  if (puntos.length < 3) return null;

  const maximo = Math.max(...puntos.map((p) => p.valor), 1);
  const total  = puntos.length;
  const svgW   = total * (ANCHO + GAP) - GAP;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-600 mb-4">Puntajes por torneo</h3>
      <div className="overflow-x-auto">
        <svg width={svgW} height={ALTO + 48} className="block min-w-full">
          {puntos.map((p, i) => {
            const barH  = Math.max(4, Math.round((p.valor / maximo) * ALTO));
            const x     = i * (ANCHO + GAP);
            const y     = ALTO - barH;
            const color = p.esFinal ? "#E8722A" : "#16a34a";

            return (
              <g key={i}>
                {/* Barra */}
                <rect x={x} y={y} width={ANCHO} height={barH} rx={6} fill={color} opacity={0.85} />

                {/* Valor encima */}
                <text
                  x={x + ANCHO / 2}
                  y={y - 5}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight="600"
                  fill={color}
                >
                  {p.valor}
                </text>

                {/* Etiqueta abajo */}
                <text
                  x={x + ANCHO / 2}
                  y={ALTO + 18}
                  textAnchor="middle"
                  fontSize={10}
                  fill="#94a3b8"
                >
                  {p.label}
                </text>
              </g>
            );
          })}

          {/* Línea base */}
          <line x1={0} y1={ALTO} x2={svgW} y2={ALTO} stroke="#e2e8f0" strokeWidth={1} />
        </svg>
      </div>

      {/* Leyenda */}
      <div className="flex gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-green-600 inline-block" />
          <span className="text-xs text-slate-400">Regular</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-liga inline-block" />
          <span className="text-xs text-slate-400">Final</span>
        </div>
      </div>
    </div>
  );
}
