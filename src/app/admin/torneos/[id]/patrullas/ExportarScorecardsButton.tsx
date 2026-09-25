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
const SPONSORS = ["sponsor_1.png", "sponsor_2.png", "sponsor_3.png", "sponsor_4.PNG", "sponsor_5.png"];

type Card = {
  apellido: string;
  nombre: string;
  categoria: string;
  numero: number;
  bis: boolean;
  posicion: string;
};

// Secuencia de 24 dianas empezando en el número de patrulla y dando la
// vuelta hasta cubrir 1-24 (ej. patrulla 2 → 2,3,...,24,1).
function secuenciaDianas(numeroPatrulla: number): number[] {
  return Array.from({ length: 24 }, (_, i) => ((numeroPatrulla - 1 + i) % 24) + 1);
}

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

export default function ExportarScorecardsButton({ patrullas, torneo }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  async function exportar() {
    setLoading(true);
    setError(null);
    try {
      const { jsPDF }               = await import("jspdf");
      const { default: autoTable }  = await import("jspdf-autotable");

      const cards: Card[] = [];
      for (const p of patrullas) {
        for (const pos of POSICIONES) {
          const m = p[pos];
          if (m) cards.push({ apellido: m.apellido, nombre: m.nombre, categoria: m.categoria, numero: p.numero, bis: p.bis, posicion: pos });
        }
      }
      if (cards.length === 0) {
        setError("No hay arqueros asignados a una patrulla todavía.");
        setLoading(false);
        return;
      }

      const [logoData, ...sponsorData] = await Promise.all([
        cargarImagenBase64("/img/Liga3dLOGOALTA.png"),
        ...SPONSORS.map((f) => cargarImagenBase64(`/img/${f}`)),
      ]);

      const fecha = new Date(torneo.fecha).toLocaleDateString("es-AR", {
        day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC",
      });

      const doc = new jsPDF({ orientation: "portrait", format: "a4" });
      const W = doc.internal.pageSize.getWidth();
      const H = doc.internal.pageSize.getHeight();

      const marginX  = 10;
      const marginTop = 8;
      const cardGap  = 8; // espacio entre las 2 tarjetas + línea de corte
      const cardH    = (H - marginTop * 2 - cardGap) / 2;

      const tableWidth = (W - marginX * 2 - 4) / 2; // 4mm de separación entre las 2 mitades
      const colWidths  = { diana: 9, val: 5.4, parc: 8, subt: 8, s11: 7, s10: 7 };

      const headRows: Parameters<typeof autoTable>[1]["head"] = [
        [
          { content: "",         rowSpan: 2, styles: { fillColor: [235, 238, 242] as [number, number, number] } },
          { content: "FLECHA 1", colSpan: 5, styles: { halign: "center" as const } },
          { content: "FLECHA 2", colSpan: 5, styles: { halign: "center" as const } },
          { content: "PARC.",   rowSpan: 2 },
          { content: "SUB.T.",  rowSpan: 2 },
          { content: "11'S",    rowSpan: 2 },
          { content: "10'S",    rowSpan: 2 },
        ],
        ["11", "10", "8", "5", "M", "11", "10", "8", "5", "M"],
      ];

      const columnStyles = {
        0: { cellWidth: colWidths.diana, fontStyle: "bold" as const, fillColor: [245, 246, 248] as [number, number, number] },
        1: { cellWidth: colWidths.val }, 2: { cellWidth: colWidths.val }, 3: { cellWidth: colWidths.val }, 4: { cellWidth: colWidths.val }, 5: { cellWidth: colWidths.val },
        6: { cellWidth: colWidths.val }, 7: { cellWidth: colWidths.val }, 8: { cellWidth: colWidths.val }, 9: { cellWidth: colWidths.val }, 10: { cellWidth: colWidths.val },
        11: { cellWidth: colWidths.parc }, 12: { cellWidth: colWidths.subt }, 13: { cellWidth: colWidths.s11 }, 14: { cellWidth: colWidths.s10 },
      };

      const filasCuerpo = (dianas: number[]) =>
        dianas.map((n) => [
          String(n), "11", "10", "8", "5", "M", "11", "10", "8", "5", "M", "", "", "", "",
        ]);

      const dibujarTarjeta = (card: Card, y: number) => {
        const logoSize = 16;
        if (logoData) doc.addImage(logoData, "PNG", marginX, y, logoSize, logoSize);

        const nombreIzq = `arquero: ${card.apellido}, ${card.nombre}`;
        doc.setFont("helvetica", "bold");
        let nombreIzqSize = 13;
        doc.setFontSize(nombreIzqSize);
        const anchoDisponibleIzq = tableWidth - logoSize - 2;
        while (nombreIzqSize > 7 && doc.getTextWidth(nombreIzq) > anchoDisponibleIzq) {
          nombreIzqSize -= 0.5;
          doc.setFontSize(nombreIzqSize);
        }
        doc.text(nombreIzq, marginX + logoSize + 4, y + 6.5);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.text(`CAT: ${card.categoria}      ${fecha}`, marginX + logoSize + 4, y + 13);
        doc.setTextColor(0, 0, 0);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.text(`${card.numero}${card.posicion}`, W - marginX, y + 11, { align: "right" });
        let bisOffset = 0;
        if (card.bis) {
          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.text("BIS", W - marginX, y + 15, { align: "right" });
          bisOffset = 3;
        }

        // El nombre se repite del lado derecho: la tarjeta se dobla al medio
        // (entre las dos tablas) y así se ve el nombre en ambas mitades.
        // Si el nombre es muy largo, se achica hasta que entre en el ancho
        // de la mitad derecha (para no invadir la tabla izquierda).
        const nombreDer = `${card.apellido}, ${card.nombre}`;
        doc.setFont("helvetica", "bold");
        let nombreDerSize = 10;
        doc.setFontSize(nombreDerSize);
        while (nombreDerSize > 6.5 && doc.getTextWidth(nombreDer) > tableWidth - 2) {
          nombreDerSize -= 0.5;
          doc.setFontSize(nombreDerSize);
        }
        doc.text(nombreDer, W - marginX, y + 15 + bisOffset, { align: "right" });

        const dianas   = secuenciaDianas(card.numero);
        const tableTop = y + logoSize + 4;
        const leftX    = marginX;
        const rightX   = marginX + tableWidth + 4;

        const tableBase = {
          head: headRows,
          startY: tableTop,
          styles: { fontSize: 7, cellPadding: { top: 1.5, bottom: 1.5, left: 0.5, right: 0.5 }, halign: "center" as const, valign: "middle" as const, lineColor: [180, 185, 195] as [number, number, number], lineWidth: 0.15 },
          headStyles: { fillColor: [31, 78, 160] as [number, number, number], textColor: 255, fontStyle: "bold" as const, fontSize: 7 },
          columnStyles,
        };

        autoTable(doc, {
          ...tableBase,
          body: filasCuerpo(dianas.slice(0, 12)) as Parameters<typeof autoTable>[1]["body"],
          margin: { left: leftX, right: W - leftX - tableWidth, top: 0, bottom: 0 },
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const leftFinalY = (doc as any).lastAutoTable.finalY as number;

        autoTable(doc, {
          ...tableBase,
          body: filasCuerpo(dianas.slice(12, 24)) as Parameters<typeof autoTable>[1]["body"],
          margin: { left: rightX, right: W - rightX - tableWidth, top: 0, bottom: 0 },
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rightFinalY = (doc as any).lastAutoTable.finalY as number;

        // Línea más gruesa separando FLECHA 1 de FLECHA 2, en ambas tablas
        const divOffset = colWidths.diana + colWidths.val * 5;
        doc.setDrawColor(60, 60, 60);
        doc.setLineWidth(0.5);
        doc.line(leftX + divOffset, tableTop, leftX + divOffset, leftFinalY);
        doc.line(rightX + divOffset, tableTop, rightX + divOffset, rightFinalY);
        doc.setLineWidth(0.2);

        // Sponsors bajo la tabla izquierda
        const sponsorImgs = sponsorData.filter((s): s is string => !!s);
        if (sponsorImgs.length > 0) {
          const sH = 9;
          const gap = 4;
          const totalW = sponsorImgs.length * sH * 1.6 + (sponsorImgs.length - 1) * gap;
          let sx = leftX + Math.max(0, (tableWidth - totalW) / 2);
          const sy = leftFinalY + 4;
          for (const img of sponsorImgs) {
            doc.addImage(img, "PNG", sx, sy, sH * 1.6, sH);
            sx += sH * 1.6 + gap;
          }
        }

        // Totales: 3 casilleros alineados debajo de sus columnas —
        // puntos (bajo PARC.+SUB.T. juntas, 3 cifras), cantidad de 11's y de 10's.
        const offParc  = colWidths.diana + colWidths.val * 10;
        const offSubt  = offParc + colWidths.parc;
        const offS11   = offSubt + colWidths.subt;
        const offS10   = offS11  + colWidths.s11;
        const anchoPts = colWidths.parc + colWidths.subt;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text("TOTALES", rightX, rightFinalY + 6.5);

        const boxY = rightFinalY + 3;
        const boxH = 7;
        doc.setDrawColor(130, 130, 130);
        doc.rect(rightX + offParc, boxY, anchoPts, boxH);
        doc.rect(rightX + offS11,  boxY, colWidths.s11, boxH);
        doc.rect(rightX + offS10,  boxY, colWidths.s10, boxH);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(5.5);
        doc.text("PTS",  rightX + offParc + anchoPts / 2, boxY - 1, { align: "center" });
        doc.text("11'S", rightX + offS11  + colWidths.s11 / 2, boxY - 1, { align: "center" });
        doc.text("10'S", rightX + offS10  + colWidths.s10 / 2, boxY - 1, { align: "center" });

        // Firmas
        const firmaY = boxY + boxH + 10;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text("Arquero", rightX, firmaY);
        doc.line(rightX + 14, firmaY, rightX + tableWidth * 0.45, firmaY);
        doc.text("Scorer", rightX + tableWidth * 0.5, firmaY);
        doc.line(rightX + tableWidth * 0.5 + 12, firmaY, rightX + tableWidth, firmaY);
      };

      for (let i = 0; i < cards.length; i += 2) {
        if (i > 0) doc.addPage();

        dibujarTarjeta(cards[i], marginTop);

        const midY = marginTop + cardH + cardGap / 2;
        doc.setDrawColor(190, 190, 190);
        doc.setLineDashPattern([2, 2], 0);
        doc.line(marginX, midY, W - marginX, midY);
        doc.setLineDashPattern([], 0);

        if (cards[i + 1]) {
          dibujarTarjeta(cards[i + 1], marginTop + cardH + cardGap);
        }
      }

      const nombre = torneo.nombre.replace(/[^a-zA-Z0-9]/g, "-");
      doc.save(`scorecards-${nombre}.pdf`);
    } catch (err) {
      console.error("Error generando scorecards:", err);
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
        className="shrink-0 bg-liga text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-liga-dark disabled:opacity-50 transition-colors"
      >
        {loading ? "Generando..." : "🎯 Scorecards PDF"}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
