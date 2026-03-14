import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/projetos/:path*",
  ],
};

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verifica cookie de sessão
  const sessionCookie = request.cookies.get("better-auth.session_token");

  // Rotas protegidas que requerem autenticação
  const protectedRoutes = ["/dashboard", "/projetos"];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (!sessionCookie && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
