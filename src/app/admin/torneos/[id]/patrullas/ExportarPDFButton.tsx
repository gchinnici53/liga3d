"use client";

import { useState } from "react";

type MiembroExport = {
  nombre: string;
  apellido: string;
  dni: string | null;
  club: string | null;
  categoria: string;
} | null;

type PatrullaExport = {
  id: number;
  numero: number;
  bis: boolean;
  estaca: string;
  A: MiembroExport;
  B: MiembroExport;
  C: MiembroExport;
  D: MiembroExport;
};

type TorneoInfo = {
  nombre: string;
  fecha: string;
  lugar: string | null;
  temporada: string;
};

type Props = {
  patrullas: PatrullaExport[];
  torneo: TorneoInfo;
};

const POSICIONES = ["A", "B", "C", "D"] as const;

// RGB para cada color de estaca
const ESTACA_RGB: Record<string, [number, number, number]> = {
  ROJA:     [200,  60,  60],
  AMARILLA: [210, 155,  10],
  AZUL:     [ 40, 100, 190],
};

type TableCell =
  | string
  | number
  | {
      content: string | number;
      rowSpan?: number;
      colSpan?: number;
      styles?: Record<string, unknown>;
    };

async function cargarImagenBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export default function ExportarPDFButton({ patrullas, torneo }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  async function exportar() {
    setLoading(true);
    setError(null);
    try {
      const { jsPDF }           = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF({ orientation: "landscape", format: "a4" });
      const W   = doc.internal.pageSize.getWidth();

      // ── Logo ────────────────────────────────────────────────
      const logoData = await cargarImagenBase64("/img/Liga3dLOGOALTA.png");
      if (logoData) {
        // Logo cuadrado de 24 × 24 mm a la izquierda
        doc.addImage(logoData, "PNG", 10, 6, 24, 24);
      }

      // ── Encabezado de texto ──────────────────────────────────
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Distribucion de Blancos", W / 2, 15, { align: "center" });

      doc.setFontSize(12);
      doc.text(torneo.nombre, W / 2, 23, { align: "center" });

      const fecha = new Date(torneo.fecha).toLocaleDateString("es-AR", {
        day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC",
      });
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(fecha + (torneo.lugar ? ` — ${torneo.lugar}` : ""), W / 2, 30, { align: "center" });
      doc.text(torneo.temporada, W / 2, 35.5, { align: "center" });
      doc.setTextColor(0, 0, 0);

      // ── Filas de la tabla ────────────────────────────────────
      const body: TableCell[][] = [];

      for (let pi = 0; pi < patrullas.length; pi++) {
        const p        = patrullas[pi];
        const etiqueta = `${p.numero}${p.bis ? " bis" : ""}`;
        const estacaRgb = ESTACA_RGB[p.estaca] ?? [100, 100, 100];

        // Separador fino entre patrullas (excepto antes de la primera)
        if (pi > 0) {
          body.push([
            {
              content: "",
              colSpan: 7,
              styles: { fillColor: [210, 215, 225], minCellHeight: 1.2, cellPadding: 0 },
            },
          ]);
        }

        POSICIONES.forEach((pos, i) => {
          const m   = p[pos];
          const row: TableCell[] = [];

          if (i === 0) {
            // Número de patrulla (rowSpan 4)
            row.push({
              content: etiqueta,
              rowSpan: 4,
              styles: {
                valign: "middle",
                halign: "center",
                fontStyle: "bold",
                fontSize: 13,
              },
            });
          }

          row.push(pos);

          if (m) {
            row.push(m.dni ?? "");
            row.push(`${m.apellido}, ${m.nombre}`);
            row.push(m.club ?? "");
            row.push(m.categoria);
          } else {
            row.push("", "", "", "");
          }

          if (i === 0) {
            // Celda de ESTACA con color (rowSpan 4)
            row.push({
              content: p.estaca,
              rowSpan: 4,
              styles: {
                valign:    "middle",
                halign:    "center",
                fontStyle: "bold",
                fontSize:  9,
                fillColor: estacaRgb,
                textColor: [255, 255, 255],
              },
            });
          }

          body.push(row);
        });
      }

      autoTable(doc, {
        // Dos filas en el header: TURNO arriba, nombres de columnas abajo
        head: [
          [
            {
              content: "TURNO 1",
              colSpan: 7,
              styles: {
                fillColor:  [31, 78, 160],
                textColor:  [255, 255, 255],
                fontStyle:  "bold",
                halign:     "center",
                fontSize:   11,
                cellPadding: 4,
              },
            },
          ],
          [
            { content: "DIANAS", colSpan: 2, styles: { halign: "center" } },
            "DNI",
            "APELLIDO Y NOMBRE",
            "CLUB",
            "CATEGORÍA",
            "ESTACA",
          ],
        ],
        body: body as Parameters<typeof autoTable>[1]["body"],
        startY: 40,
        styles: {
          fontSize: 8.5,
          cellPadding: { top: 2, bottom: 2, left: 2, right: 2 },
        },
        headStyles: {
          fillColor: [31, 78, 160],
          textColor: 255,
          fontStyle: "bold",
          halign:    "center",
        },
        columnStyles: {
          0: { cellWidth: 16, halign: "center" },
          1: { cellWidth:  9, halign: "center" },
          2: { cellWidth: 28 },
          3: { cellWidth: 83 },
          4: { cellWidth: 75 },
          5: { cellWidth: 28, halign: "center" },
          6: { cellWidth: 22, halign: "center" },
        },
        // Sin alternancia para que los separadores de color se vean bien
        alternateRowStyles: {},
        margin: { top: 10, left: 10, right: 10, bottom: 10 },
      });

      const filename = `patrullas-${torneo.nombre.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error("Error generando PDF:", err);
      setError("No se pudo generar el PDF.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={exportar}
        disabled={loading}
        className="shrink-0 bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 disabled:opacity-50 transition-colors"
      >
        {loading ? "Generando PDF..." : "⬇ Exportar PDF"}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
