import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST  ?? "smtp.gmail.com",
  port:   Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const CATEGORIA_LABELS: Record<string, string> = {
  CM: "Compuesto Masculino", CW: "Compuesto Femenino",
  BM: "Barebow Masculino",   BW: "Barebow Femenino",
  LM: "Longbow Masculino",   LW: "Longbow Femenino",
  TM: "Tradicional Masculino", TW: "Tradicional Femenino",
  ESC: "Escuela", JUN: "Junior",
};

export interface DatosConfirmacionInscripcion {
  torneo: {
    nombre: string;
    fecha: Date;
    lugar: string;
    valor: number | null;
    notas: string | null;
  };
  arquero: {
    nombre: string;
    apellido: string;
    email: string;
    categoria: string;
    club: string | null;
  };
}

export async function enviarConfirmacionInscripcion(datos: DatosConfirmacionInscripcion): Promise<void> {
  const { torneo, arquero } = datos;
  const baseUrl  = process.env.NEXTAUTH_URL ?? "https://liga3d.appchinni.com";
  const categoria = CATEGORIA_LABELS[arquero.categoria] ?? arquero.categoria;

  const fechaFormateada = new Intl.DateTimeFormat("es-AR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date(torneo.fecha));

  const valorFormateado = torneo.valor != null
    ? new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 }).format(torneo.valor)
    : null;

  const sponsors = ["sponsor_1.png", "sponsor_2.png", "sponsor_3.png", "sponsor_4.PNG", "sponsor_5.png"];
  const sponsorTds = sponsors
    .map(s => `<td style="padding:0 10px"><img src="${baseUrl}/img/${s}" alt="Sponsor" style="height:36px;width:auto;opacity:0.65" /></td>`)
    .join("");

  const notasHtml = torneo.notas
    ? `<div style="margin-top:16px;padding:16px;background:#fef9c3;border:1px solid #fde68a;border-radius:8px;color:#713f12;font-size:14px;line-height:1.7">
        ${torneo.notas.replace(/\n/g, "<br>")}
       </div>`
    : "";

  const valorRow = valorFormateado
    ? `<tr><td style="padding:12px 16px;border-bottom:1px solid #e2e8f0">
         <span style="color:#64748b;font-size:12px">Valor de inscripción</span>
         <div style="color:#1e293b;font-weight:600;margin-top:2px">${valorFormateado}</div>
       </td></tr>`
    : "";

  const clubRow = arquero.club
    ? `<tr><td style="padding:12px 16px">
         <span style="color:#64748b;font-size:12px">Club</span>
         <div style="color:#1e293b;font-weight:600;margin-top:2px">${arquero.club}</div>
       </td></tr>`
    : "";

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1e293b">

      <div style="background:#1e3a5f;padding:28px 24px;text-align:center">
        <img src="${baseUrl}/img/Liga3dLOGOALTA.png" alt="Liga 3D Metropolitana" style="height:70px;width:auto" />
      </div>

      <div style="padding:32px 24px 24px;background:#ffffff">
        <h1 style="color:#1e3a5f;font-size:22px;margin:0 0 6px">¡Gracias por inscribirte!</h1>
        <p style="color:#64748b;margin:0;font-size:15px">Tu lugar en <strong style="color:#1e293b">${torneo.nombre}</strong> está reservado.</p>
      </div>

      <div style="padding:0 24px 24px;background:#ffffff">
        <table style="width:100%;border-collapse:collapse;background:#f8fafc;border-radius:10px;overflow:hidden">
          <tr><td style="padding:12px 16px;border-bottom:1px solid #e2e8f0">
            <span style="color:#64748b;font-size:12px">Fecha</span>
            <div style="color:#1e293b;font-weight:600;margin-top:2px;text-transform:capitalize">${fechaFormateada}</div>
          </td></tr>
          <tr><td style="padding:12px 16px;border-bottom:1px solid #e2e8f0">
            <span style="color:#64748b;font-size:12px">Lugar</span>
            <div style="color:#1e293b;font-weight:600;margin-top:2px">${torneo.lugar}</div>
          </td></tr>
          ${valorRow}
        </table>
        ${notasHtml}
      </div>

      <div style="padding:0 24px 32px;background:#ffffff">
        <h2 style="color:#1e3a5f;font-size:15px;margin:0 0 12px;font-weight:700">Tus datos</h2>
        <table style="width:100%;border-collapse:collapse;background:#f8fafc;border-radius:10px;overflow:hidden">
          <tr><td style="padding:12px 16px;border-bottom:1px solid #e2e8f0">
            <span style="color:#64748b;font-size:12px">Arquero</span>
            <div style="color:#1e293b;font-weight:600;margin-top:2px">${arquero.apellido}, ${arquero.nombre}</div>
          </td></tr>
          <tr><td style="padding:12px 16px${arquero.club ? ";border-bottom:1px solid #e2e8f0" : ""}">
            <span style="color:#64748b;font-size:12px">Categoría</span>
            <div style="color:#1e293b;font-weight:600;margin-top:2px">${categoria}</div>
          </td></tr>
          ${clubRow}
        </table>
      </div>

      <div style="background:#f8fafc;padding:24px;text-align:center;border-top:1px solid #e2e8f0">
        <p style="color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 16px;font-weight:600">Nos acompañan</p>
        <table style="margin:0 auto"><tr>${sponsorTds}</tr></table>
      </div>

      <div style="background:#1e3a5f;padding:16px 24px;text-align:center">
        <p style="color:#94a3b8;font-size:12px;margin:0">
          Liga 3D Metropolitana ·
          <a href="mailto:liga3dmetro@gmail.com" style="color:#94a3b8">liga3dmetro@gmail.com</a>
        </p>
      </div>

    </div>
  `;

  await transporter.sendMail({
    from:    `"Liga 3D Metropolitana" <${process.env.SMTP_USER}>`,
    to:      arquero.email,
    subject: `Inscripción confirmada — ${torneo.nombre}`,
    text:    `Hola ${arquero.nombre},\n\nTu inscripción en ${torneo.nombre} fue recibida.\n\nFecha: ${fechaFormateada}\nLugar: ${torneo.lugar}${valorFormateado ? `\nValor: ${valorFormateado}` : ""}${torneo.notas ? `\n\n${torneo.notas}` : ""}\n\nCategoría: ${categoria}${arquero.club ? `\nClub: ${arquero.club}` : ""}\n\nLiga 3D Metropolitana`,
    html,
  });
}

export async function enviarCodigoVerificacion(
  to:     string,
  codigo: string,
  nombre: string
): Promise<void> {
  await transporter.sendMail({
    from:    `"Liga 3D Metropolitana" <${process.env.SMTP_USER}>`,
    to,
    subject: `Tu código de verificación — Liga 3D`,
    text:
      `Hola ${nombre},\n\n` +
      `Tu código de verificación es: ${codigo}\n\n` +
      `Válido por 10 minutos.\n\n` +
      `Liga 3D Metropolitana`,
    html: `
      <div style="font-family:sans-serif;max-width:420px;margin:0 auto;padding:24px;color:#1e293b">
        <h2 style="color:#1e3a5f;margin-bottom:4px">Liga 3D Metropolitana</h2>
        <p style="margin-top:0;color:#64748b;font-size:14px">Verificación de identidad</p>
        <p>Hola <strong>${nombre}</strong>,</p>
        <p>Usá este código para continuar con la edición de tu perfil:</p>
        <div style="font-size:36px;font-weight:700;letter-spacing:10px;color:#1e3a5f;
                    padding:20px;background:#f1f5f9;border-radius:12px;
                    text-align:center;margin:20px 0;">
          ${codigo}
        </div>
        <p style="color:#64748b;font-size:13px">Este código expira en <strong>10 minutos</strong>.</p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0">
        <p style="color:#94a3b8;font-size:11px">
          Si no solicitaste este código, ignorá este mensaje.
        </p>
      </div>
    `,
  });
}
