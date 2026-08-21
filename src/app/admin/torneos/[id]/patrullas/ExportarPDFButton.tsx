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

type TableCell =
  | string
  | number
  | {
      content: string | number;
      rowSpan?: number;
      colSpan?: number;
      styles?: Record<string, unknown>;
    };

export default function ExportarPDFButton({ patrullas, torneo }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function exportar() {
    setLoading(true);
    setError(null);
    try {
      const { jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF({ orientation: "landscape", format: "a4" });
      const W = doc.internal.pageSize.getWidth();

      // Título principal
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Distribucion de Blancos", W / 2, 18, { align: "center" });

      // Nombre del torneo
      doc.setFontSize(12);
      doc.text(torneo.nombre, W / 2, 27, { align: "center" });

      // Fecha, lugar y temporada
      const fecha = new Date(torneo.fecha).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "UTC",
      });
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      const subtitulo = fecha + (torneo.lugar ? ` — ${torneo.lugar}` : "");
      doc.text(subtitulo, W / 2, 34, { align: "center" });
      doc.text(torneo.temporada, W / 2, 40, { align: "center" });
      doc.setTextColor(0, 0, 0);

      // Construir filas de la tabla
      const body: TableCell[][] = [];

      // Fila "TURNO 1" como encabezado de sección
      body.push([
        {
          content: "TURNO 1",
          colSpan: 6,
          styles: {
            fillColor: [31, 78, 160],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            halign: "center",
            fontSize: 10,
            cellPadding: 3,
          },
        },
      ]);

      for (const p of patrullas) {
        const etiqueta = `${p.numero}${p.bis ? " bis" : ""}`;

        POSICIONES.forEach((pos, i) => {
          const m = p[pos];
          const row: TableCell[] = [];

          // Número de patrulla con rowSpan 4 (solo en la primera fila del grupo)
          if (i === 0) {
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

          row.push(pos); // columna posición

          if (m) {
            row.push(m.dni ?? "");
            row.push(`${m.apellido}, ${m.nombre}`);
            row.push(m.club ?? "");
            row.push(m.categoria);
          } else {
            row.push("", "", "", "");
          }

          body.push(row);
        });
      }

      autoTable(doc, {
        head: [
          [
            { content: "DIANAS", colSpan: 2, styles: { halign: "center" } },
            "DNI",
            "APELLIDO Y NOMBRE",
            "CLUB",
            "CATEGORÍA",
          ],
        ],
        body: body as Parameters<typeof autoTable>[1]["body"],
        startY: 45,
        styles: {
          fontSize: 8.5,
          cellPadding: { top: 2, bottom: 2, left: 2, right: 2 },
        },
        headStyles: {
          fillColor: [31, 78, 160],
          textColor: 255,
          fontStyle: "bold",
          halign: "center",
        },
        columnStyles: {
          0: { cellWidth: 16, halign: "center" },
          1: { cellWidth: 9, halign: "center" },
          2: { cellWidth: 30 },
          3: { cellWidth: 85 },
          4: { cellWidth: 78 },
          5: { cellWidth: 30, halign: "center" },
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
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
