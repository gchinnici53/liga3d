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
      {/* Hero con foto de fondo */}
      <section className="relative h-[70vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <Image
          src="/img/DSC_0296.JPG"
          alt="Arqueros de la Liga 3D"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center px-4">
          <h1 className="font-horta text-5xl sm:text-7xl md:text-8xl tracking-wide text-liga mb-4 drop-shadow-lg">
            Liga 3D Metropolitana
          </h1>
          <p className="text-white text-lg sm:text-xl max-w-2xl mx-auto mb-8 drop-shadow">
            Simplemente los mejores torneos de 3D del país
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/calendario"
              className="bg-liga hover:bg-liga-dark text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Ver calendario
            </Link>
            <Link
              href="/ranking"
              className="border border-white/60 hover:border-white text-white font-semibold px-6 py-3 rounded-xl transition-colors hover:bg-white/10"
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

      {/* Sponsors */}
      <section className="border-t border-slate-200 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <p className="text-xs text-slate-400 uppercase tracking-widest text-center mb-8 font-semibold">
            Nos acompañan
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            {[
              "sponsor_1.png",
              "sponsor_2.png",
              "sponsor_3.png",
              "sponsor_4.PNG",
              "sponsor_5.png",
            ].map((archivo) => (
              <div key={archivo} className="h-16 w-auto flex items-center grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all">
                <Image
                  src={`/img/${archivo}`}
                  alt={archivo.replace(/\.\w+$/, "").replace("_", " ")}
                  width={120}
                  height={64}
                  className="h-full w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

