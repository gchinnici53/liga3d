import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session || session.user.rol !== "ADMIN") {
    throw new Error("No autorizado: se requiere rol ADMIN.");
  }
  return session;
}

export async function requireCargaOAdmin() {
  const session = await getSession();
  if (!session || !["ADMIN", "CARGA"].includes(session.user.rol)) {
    throw new Error("No autorizado.");
  }
  return session;
}
