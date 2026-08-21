import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const [proximoTorneo, temporadaActiva, totalArqueros] = await Promise.all([
    prisma.torneo.findFirst({
      where: { fecha: { gte: new Date() } },
      orderBy: { fecha: "asc" },
      include: { temporada: true, _count: { select: { inscripciones: true } } },
    }),
    prisma.temporada.findFirst({
      where: { estado: "ACTIVA" },
      orderBy: { anio: "desc" },
    }),
    prisma.arquero.count({ where: { activo: true } }),
  ]);

  // Calcular si las inscripciones están abiertas (misma lógica que CalendarioTabs)
  let inscripcionesAbiertas = false;
  if (proximoTorneo) {
    const ahora       = new Date();
    const fechaTorneo = new Date(proximoTorneo.fecha);
    const lunesAnterior = new Date(fechaTorneo);
    lunesAnterior.setUTCDate(fechaTorneo.getUTCDate() - ((fechaTorneo.getUTCDay() + 6) % 7));
    lunesAnterior.setUTCHours(23, 59, 59, 999);
    const dias      = Math.ceil((fechaTorneo.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24));
    const cupoLleno = proximoTorneo._count.inscripciones >= proximoTorneo.maxInscriptos;
    inscripcionesAbiertas = !cupoLleno && ahora <= lunesAnterior && dias <= 30;
  }
  const hayInscriptos = (proximoTorneo?._count.inscripciones ?? 0) > 0;

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
            {inscripcionesAbiertas ? (
              <Link
                href={`/inscripcion/${proximoTorneo!.id}`}
                className="bg-liga hover:bg-liga-dark text-white font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                Inscribirse al torneo
              </Link>
            ) : (
              <Link
                href="/calendario"
                className="bg-liga hover:bg-liga-dark text-white font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                Ver calendario
              </Link>
            )}
            {hayInscriptos ? (
              <Link
                href={`/inscriptos/${proximoTorneo!.id}`}
                className="border border-white/60 hover:border-white text-white font-semibold px-6 py-3 rounded-xl transition-colors hover:bg-white/10"
              >
                Ver inscriptos
              </Link>
            ) : (
              <Link
                href="/ranking"
                className="border border-white/60 hover:border-white text-white font-semibold px-6 py-3 rounded-xl transition-colors hover:bg-white/10"
              >
                Ver ranking
              </Link>
            )}
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
                      timeZone: "UTC",
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

      {/* Redes sociales */}
      <section className="border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-10 text-center">
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-7 font-semibold">
            Seguinos
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Instagram */}
            <a
              href="https://www.instagram.com/liga.3d"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-600 hover:bg-pink-50 hover:border-pink-300 hover:text-pink-700 transition-colors"
            >
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
              </svg>
              <span className="text-sm font-medium">@liga.3d</span>
            </a>

            {/* Facebook */}
            <a
              href="https://www.facebook.com/profile.php?id=100087042526337"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
            >
              <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
              <span className="text-sm font-medium">Facebook</span>
            </a>

            {/* WhatsApp */}
            <a
              href="https://chat.whatsapp.com/CeIZ9kGj9vG6Gjx7nxHSJf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-600 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-colors"
            >
              <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a6.96 6.96 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.135.561 4.13 1.541 5.854L.057 23.943a.5.5 0 0 0 .609.609l6.089-1.484A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.944 9.944 0 0 1-5.221-1.478l-.374-.222-3.876.945.979-3.773-.243-.386A9.96 9.96 0 0 1 2 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z" />
              </svg>
              <span className="text-sm font-medium">Grupo de difusión</span>
            </a>

            {/* Email */}
            <a
              href="mailto:liga3dmetro@gmail.com"
              className="flex items-center gap-2.5 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-600 hover:bg-slate-100 hover:border-slate-400 hover:text-slate-800 transition-colors"
            >
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m2 7 10 7 10-7" />
              </svg>
              <span className="text-sm font-medium">liga3dmetro@gmail.com</span>
            </a>
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

