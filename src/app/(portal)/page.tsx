import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const [proximoTorneo, temporadaActiva, totalArqueros] = await Promise.all([
    prisma.torneo.findFirst({
      where: { fecha: { gte: new Date() } },
      orderBy: { fecha: "asc" },
      include: { temporada: true },
    }),
    prisma.temporada.findFirst({
      where: { estado: "ACTIVA" },
      orderBy: { anio: "desc" },
    }),
    prisma.arquero.count({ where: { activo: true } }),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24 text-center">
          <Image
            src="/img/Liga3dLOGOALTA.png"
            alt="Liga 3D Metropolitana"
            width={140}
            height={140}
            className="mx-auto mb-6 rounded-full"
          />
          <h1 className="font-horta text-5xl sm:text-7xl tracking-wide mb-4">
            Liga 3D Metropolitana
          </h1>
          <p className="text-slate-300 text-lg sm:text-xl max-w-2xl mx-auto mb-8">
            Competí en los mejores torneos de arquería 3D. Ranking, resultados y todo lo que necesitás para ser parte.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/calendario"
              className="bg-green-700 hover:bg-green-800 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Ver calendario
            </Link>
            <Link
              href="/ranking"
              className="border border-slate-600 hover:border-slate-400 text-slate-200 font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Ver ranking
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-slate-800">{totalArqueros}</p>
              <p className="text-sm text-slate-500 mt-1">Arqueros activos</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-800">{temporadaActiva?.nombre ?? "—"}</p>
              <p className="text-sm text-slate-500 mt-1">Temporada en curso</p>
            </div>
            <div>
              {proximoTorneo ? (
                <>
                  <p className="text-3xl font-bold text-slate-800">
                    {new Date(proximoTorneo.fecha).toLocaleDateString("es-AR", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">Próximo torneo: {proximoTorneo.nombre}</p>
                </>
              ) : (
                <>
                  <p className="text-3xl font-bold text-slate-800">—</p>
                  <p className="text-sm text-slate-500 mt-1">Próximo torneo</p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Secciones rápidas */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Tarjeta
            icono="📊"
            titulo="Ranking"
            descripcion="Consultá las posiciones por categoría de la temporada actual."
            href="/ranking"
          />
          <Tarjeta
            icono="📅"
            titulo="Calendario"
            descripcion="Fechas de torneos e inscripciones abiertas."
            href="/calendario"
          />
          <Tarjeta
            icono="🏆"
            titulo="Campeones"
            descripcion="Todos los campeones de cada temporada."
            href="/campeones"
          />
        </div>
      </section>
    </>
  );
}

function Tarjeta({
  icono,
  titulo,
  descripcion,
  href,
}: {
  icono: string;
  titulo: string;
  descripcion: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block bg-white border border-slate-200 rounded-xl p-6 hover:border-green-300 hover:shadow-md transition-all group"
    >
      <span className="text-3xl block mb-3">{icono}</span>
      <h3 className="font-bold text-slate-800 mb-1 group-hover:text-green-700 transition-colors">
        {titulo}
      </h3>
      <p className="text-sm text-slate-500">{descripcion}</p>
    </Link>
  );
}
