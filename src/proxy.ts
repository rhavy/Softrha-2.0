import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/registro"],
};

export default async function proxy(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // Rotas protegidas que requerem autenticação
    const protectedRoutes = ["/dashboard"];

    // Rotas de auth que não devem ser acessadas se já estiver logado
    const authRoutes = ["/login", "/registro"];

    const isProtectedRoute = protectedRoutes.some(route =>
      pathname.startsWith(route)
    );

    const isAuthRoute = authRoutes.includes(pathname);

    // Verifica se tem cookie de sessão
    const sessionCookie = request.cookies.get("better-auth.session_token");

    // Se não estiver autenticado e tentar acessar rota protegida
    if (!sessionCookie && isProtectedRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Se estiver autenticado (tem cookie) e tentar acessar rota de auth
    if (sessionCookie && isAuthRoute) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Erro no proxy:", error);
    return NextResponse.next();
  }
}
