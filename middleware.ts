import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/registro",
    "/conta-nao-verificada",
    "/projetos/:path*",
  ],
};

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Log simples para verificar se middleware está rodando
  const allCookies = request.cookies.getAll();
  console.log("[MW]", pathname, "cookies:", allCookies.map(c => c.name).join(","));

  // Rotas protegidas que requerem autenticação
  const protectedRoutes = ["/dashboard", "/projetos"];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Verifica cookie de sessão
  const sessionCookie = request.cookies.get("better-auth.session_token");

  if (!sessionCookie && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
