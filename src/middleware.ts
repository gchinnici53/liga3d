import { withAuth } from "next-auth/middleware";

const ROLES_ADMIN = ["ADMIN", "CARGA", "INVITADO"] as const;

export default withAuth({
  pages: { signIn: "/auth/login" },
  callbacks: {
    authorized({ token, req }) {
      const path = req.nextUrl.pathname;
      if (path.startsWith("/admin")) {
        return !!token && ROLES_ADMIN.includes(token.rol as typeof ROLES_ADMIN[number]);
      }
      if (path.startsWith("/mi-perfil")) return !!token;
      return true;
    },
  },
});

export const config = {
  matcher: ["/admin/:path*", "/mi-perfil/:path*"],
};
