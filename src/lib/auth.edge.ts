import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible auth config (NO Node.js imports).
 * Used by middleware only. Does not include providers with bcrypt/prisma.
 */
export const authEdgeConfig: NextAuthConfig = {
  trustHost: true,
  providers: [], // Providers are added in the full auth.config.ts
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnApp = nextUrl.pathname.startsWith("/dashboard") ||
        nextUrl.pathname.startsWith("/veiculos") ||
        nextUrl.pathname.startsWith("/clientes") ||
        nextUrl.pathname.startsWith("/contratos") ||
        nextUrl.pathname.startsWith("/cobrancas") ||
        nextUrl.pathname.startsWith("/receitas") ||
        nextUrl.pathname.startsWith("/despesas") ||
        nextUrl.pathname.startsWith("/manutencao") ||
        nextUrl.pathname.startsWith("/multas") ||
        nextUrl.pathname.startsWith("/relatorios") ||
        nextUrl.pathname.startsWith("/configuracoes");
      const isOnLogin = nextUrl.pathname === "/login";
      const isAdminRoute = nextUrl.pathname.startsWith("/configuracoes");

      if (isOnApp) {
        if (!isLoggedIn) return false;
        if (isAdminRoute && auth?.user?.role !== "ADMIN") {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      if (isOnLogin && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
  },
  session: {
    strategy: "jwt",
  },
} satisfies NextAuthConfig;
