import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reglamento — Liga 3D",
};

export default function ReglamentoPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Reglamento</h1>

      <div className="prose prose-slate max-w-none space-y-6 text-slate-600 leading-relaxed">
        <h2 className="text-xl font-bold text-slate-800 mt-2 mb-3">1. Sistema de competencia</h2>
        <p>
          La temporada se compone de torneos regulares y una final. Cada arquero
          acumula puntos según su posición en cada torneo.
        </p>

        <h2 className="text-xl font-bold text-slate-800 mt-10 mb-3">2. Puntuación por torneo</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-600">Posición</th>
                <th className="text-right px-4 py-2.5 font-semibold text-slate-600">Regular</th>
                <th className="text-right px-4 py-2.5 font-semibold text-slate-600">Final (×2)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                ["1° (Oro)",    18, 36],
                ["2° (Plata)",  16, 32],
                ["3° (Bronce)", 15, 30],
                ["4°", 12, 24],
                ["5°", 11, 22],
                ["6°", 10, 20],
                ["7°",  9, 18],
                ["8°",  8, 16],
                ["9° en adelante", 7, 14],
              ].map(([pos, reg, fin]) => (
                <tr key={String(pos)} className="hover:bg-slate-50">
                  <td className="px-4 py-2 text-slate-800 font-medium">{pos}</td>
                  <td className="px-4 py-2 text-right text-slate-700">{reg}</td>
                  <td className="px-4 py-2 text-right text-green-700 font-semibold">{fin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-xl font-bold text-slate-800 mt-10 mb-3">3. Cálculo de puntos de temporada</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            De los torneos regulares, solo cuentan los <strong>2 mejores puntajes</strong> del
            arquero en cada categoría.
          </li>
          <li>
            Se suma el puntaje del torneo final (si participó). Los puntos de
            la final se <strong>duplican</strong>.
          </li>
          <li>
            Total temporada = mejores 2 regulares + final.
          </li>
        </ul>

        <h2 className="text-xl font-bold text-slate-800 mt-10 mb-3">4. Campeón de temporada</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Requisito mínimo</strong>: haber competido en al menos 2
            torneos regulares y el torneo final en la misma categoría.
          </li>
          <li>
            El arquero con mayor total de temporada en cada categoría es
            proclamado campeón.
          </li>
          <li>
            Categorías con campeón: CM, CW, BM, BW, LM, LW, TM, TW.
          </li>
          <li>
            Las categorías ESC (Escuela) y JUN (Junior) no tienen campeón de temporada.
          </li>
        </ul>

        <h2 className="text-xl font-bold text-slate-800 mt-10 mb-3">5. Categorías</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>CM / CW</strong> — Compuesto Masculino / Femenino</li>
          <li><strong>BM / BW</strong> — Barebow Masculino / Femenino</li>
          <li><strong>LM / LW</strong> — Longbow Masculino / Femenino</li>
          <li><strong>TM / TW</strong> — Tradicional Masculino / Femenino</li>
          <li><strong>ESC</strong> — Escuela (categoría formativa, unisex)</li>
          <li><strong>JUN</strong> — Junior (juveniles, unisex)</li>
        </ul>

        <h2 className="text-xl font-bold text-slate-800 mt-10 mb-3">6. Formato de torneo</h2>
        <p>
          Cada torneo consta de dos rondas de tiro. La suma de ambas rondas
          determina el puntaje total. Luego se disputa la ronda de medallas
          para definir las posiciones del 1° al 4°.
        </p>
      </div>
    </div>
  );
}
