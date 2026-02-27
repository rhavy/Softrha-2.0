import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/registro",
    "/conta-nao-verificada",
    "/projetos/:path*",
    "/orcamento/:path*",
  ],
};

export default async function proxy(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    console.log("[PROXY] Pathname:", pathname);

    // Rotas protegidas que requerem autenticação
    const protectedRoutes = ["/dashboard", "/projetos", "/orcamento"];

    // Rotas de auth que não devem ser acessadas se já estiver logado
    const authRoutes = ["/login", "/registro"];

    // Rota de aviso de conta não verificada
    const unverifiedRoute = "/conta-nao-verificada";

    const isProtectedRoute = protectedRoutes.some(route =>
      pathname.startsWith(route)
    );

    const isAuthRoute = authRoutes.includes(pathname);
    const isUnverifiedRoute = pathname.startsWith(unverifiedRoute);

    // Verifica se tem cookie de sessão
    const sessionCookie = request.cookies.get("better-auth.session_token");
    console.log("[PROXY] Session cookie:", sessionCookie ? "Presente" : "Ausente");

    // Se não estiver autenticado e tentar acessar rota protegida
    if (!sessionCookie && isProtectedRoute) {
      console.log("[PROXY] Não autenticado, redirecionando para login");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Se estiver autenticado (tem cookie) e tentar acessar rota de auth
    if (sessionCookie && isAuthRoute) {
      console.log("[PROXY] Autenticado em rota de auth, redirecionando para dashboard");
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Se estiver autenticado e email não verificado, verificar redirecionamento
    if (sessionCookie && isProtectedRoute && !isUnverifiedRoute) {
      console.log("[PROXY] Verificando emailVerified...");
      
      try {
        // Usar a API do Better Auth para validar sessão
        const { auth } = await import("@/lib/auth");
        
        const session = await auth.api.getSession({
          headers: {
            cookie: `better-auth.session_token=${sessionCookie.value}`,
          },
        });

        console.log("[PROXY] Session via Better Auth:", session?.user ? "Encontrada" : "Não encontrada");

        if (session?.user) {
          const prisma = (await import("@/lib/prisma")).prisma;
          
          console.log("[PROXY] User ID:", session.user.id);
          
          const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { emailVerified: true },
          });

          console.log("[PROXY] emailVerified:", user?.emailVerified);

          // Se email não verificado, redirecionar para página de aviso
          if (user?.emailVerified === false) {
            console.log("[PROXY] Email não verificado, REDIRECIONANDO para /conta-nao-verificada");
            return NextResponse.redirect(
              new URL("/conta-nao-verificada", request.url)
            );
          }
        } else {
          // Session não encontrada, mas tem cookie válido
          console.log("[PROXY] Session não encontrada, permitindo acesso (pode ser cache)");
        }
      } catch (error) {
        console.error("[PROXY] Erro ao verificar emailVerified:", error);
        // Em caso de erro, permite continuar
      }
    }

    console.log("[PROXY] Permitindo acesso");
    return NextResponse.next();
  } catch (error) {
    console.error("Erro no proxy:", error);
    return NextResponse.next();
  }
}
