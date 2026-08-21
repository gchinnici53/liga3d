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
