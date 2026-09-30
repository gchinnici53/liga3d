import { createHmac } from "crypto";

// Token firmado (sin expiración) que le da a quien lo tenga acceso a cargar
// los puntajes de UNA patrulla puntual, sin necesidad de login. Pensado para
// repartirse como QR en la scorecard del puesto B (el scorer de la patrulla).
const SECRET = process.env.NEXTAUTH_SECRET ?? "liga3d-otp-fallback";

export type PatrullaTokenPayload = { patrullaId: number };

export function crearTokenPatrulla(patrullaId: number): string {
  const json = JSON.stringify({ patrullaId } satisfies PatrullaTokenPayload);
  const b64  = Buffer.from(json).toString("base64url");
  const sig  = createHmac("sha256", SECRET).update(b64).digest("base64url");
  return `${b64}.${sig}`;
}

export function verificarTokenPatrulla(token: string): PatrullaTokenPayload | null {
  const dot = token.lastIndexOf(".");
  if (dot === -1) return null;
  const b64 = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = createHmac("sha256", SECRET).update(b64).digest("base64url");
  if (expected !== sig) return null;
  try {
    const p = JSON.parse(Buffer.from(b64, "base64url").toString("utf8")) as PatrullaTokenPayload;
    if (typeof p.patrullaId !== "number") return null;
    return p;
  } catch {
    return null;
  }
}
