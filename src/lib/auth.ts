import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Rol } from "@/types";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { arquero: { select: { id: true, nombre: true } } },
        });

        if (!user) return null;

        const passwordValida = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!passwordValida) return null;

        return {
          id: String(user.id),
          email: user.email,
          rol: user.rol as Rol,
          arqueroId: user.arqueroId ?? undefined,
          nombre: user.arquero?.nombre ?? user.email,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.rol = user.rol;
        token.arqueroId = user.arqueroId;
        token.nombre = user.nombre;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.sub!,
        email: token.email!,
        rol: token.rol,
        arqueroId: token.arqueroId,
        nombre: token.nombre,
      };
      return session;
    },
  },
};
