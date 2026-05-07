import type { DefaultSession, DefaultUser } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";
import type { Rol } from "@/types/enums";

declare module "next-auth" {
  interface User extends DefaultUser {
    rol: Rol;
    arqueroId?: number;
    nombre: string;
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      rol: Rol;
      arqueroId?: number;
      nombre: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    rol: Rol;
    arqueroId?: number;
    nombre: string;
  }
}
