import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/auth/login" },
  callbacks: {
    authorized({ token, req }) {
      const path = req.nextUrl.pathname;
      if (path.startsWith("/admin")) return token?.rol === "ADMIN";
      if (path.startsWith("/mi-perfil")) return !!token;
      return true;
    },
  },
});

export const config = {
  matcher: ["/admin/:path*", "/mi-perfil/:path*"],
};
