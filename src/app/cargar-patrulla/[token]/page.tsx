import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { verificarTokenPatrulla } from "@/lib/patrullaToken";
import { matchArquero } from "./matchArquero";
import CargarPatrullaCliente from "./CargarPatrullaCliente";

type Props = { params: { token: string } };

const POSICIONES = ["A", "B", "C", "D"] as const;

export type MiembroCarga =
  | { posicion: string; ocupado: false }
  | {
      posicion: string;
      ocupado: true;
      inscripcionId: number;
      nombre: string;
      apellido: string;
      categoria: string;
      sinArquero: boolean; // true si no se pudo matchear con la ficha del arquero
      puntajeRonda1: number | null;
      puntajeRonda2: number | null;
    };

export default async function CargarPatrullaPage({ params }: Props) {
  const payload = verificarTokenPatrulla(params.token);
  if (!payload) notFound();

  const patrulla = await prisma.patrulla.findUnique({
    where: { id: payload.patrullaId },
    include: {
      torneo: { select: { nombre: true, fecha: true } },
      miembros: { include: { inscripcion: true } },
    },
  });
  if (!patrulla) notFound();

  const byPos = Object.fromEntries(patrulla.miembros.map((m) => [m.posicion, m]));

  const miembros: MiembroCarga[] = await Promise.all(
    POSICIONES.map(async (pos): Promise<MiembroCarga> => {
      const m = byPos[pos];
      if (!m) return { posicion: pos, ocupado: false };

      const insc = m.inscripcion;
      const arquero = await matchArquero({ dni: insc.dni, apellido: insc.apellido, nombre: insc.nombre });

      const resultado = arquero
        ? await prisma.resultado.findUnique({
            where: { arqueroId_torneoId: { arqueroId: arquero.id, torneoId: patrulla.torneoId } },
            select: { puntajeRonda1: true, puntajeRonda2: true },
          })
        : null;

      return {
        posicion: pos,
        ocupado: true,
        inscripcionId: insc.id,
        nombre: insc.nombre,
        apellido: insc.apellido,
        categoria: insc.categoria,
        sinArquero: !arquero,
        puntajeRonda1: resultado?.puntajeRonda1 ?? null,
        puntajeRonda2: resultado?.puntajeRonda2 ?? null,
      };
    })
  );

  const fecha = new Date(patrulla.torneo.fecha).toLocaleDateString("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC",
  });

  return (
    <CargarPatrullaCliente
      token={params.token}
      torneoNombre={patrulla.torneo.nombre}
      fecha={fecha}
      patrullaNumero={patrulla.numero}
      patrullaBis={patrulla.bis}
      estaca={patrulla.estaca}
      miembros={miembros}
    />
  );
}
