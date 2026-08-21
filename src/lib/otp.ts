import { createHmac, randomInt } from "crypto";

const SECRET = process.env.NEXTAUTH_SECRET ?? "liga3d-otp-fallback";
const TTL_MS = 10 * 60 * 1000; // 10 minutos

export type OTPPayload = {
  arqueroId: number;
  email: string;   // email normalizado (lowercase)
  otp: string;
  exp: number;     // Unix ms
};

export function generarOTP(): string {
  return String(randomInt(100000, 999999));
}

export function firmarOTP(payload: OTPPayload): string {
  const json = JSON.stringify(payload);
  const b64  = Buffer.from(json).toString("base64url");
  const sig  = createHmac("sha256", SECRET).update(b64).digest("base64url");
  return `${b64}.${sig}`;
}

export function crearTokenOTP(arqueroId: number, email: string, otp: string): string {
  return firmarOTP({ arqueroId, email, otp, exp: Date.now() + TTL_MS });
}

export function verificarTokenOTP(token: string): OTPPayload | null {
  const dot = token.lastIndexOf(".");
  if (dot === -1) return null;
  const b64 = token.slice(0, dot);
  const sig  = token.slice(dot + 1);
  const expected = createHmac("sha256", SECRET).update(b64).digest("base64url");
  if (expected !== sig) return null;
  try {
    const p = JSON.parse(Buffer.from(b64, "base64url").toString("utf8")) as OTPPayload;
    if (Date.now() > p.exp) return null;
    return p;
  } catch {
    return null;
  }
}
