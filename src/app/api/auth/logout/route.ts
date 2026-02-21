import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Redirect para a página de login após logout
    // O Better Auth gerencia o logout via cookie
    const response = NextResponse.json({ success: true });
    
    // Limpar cookie de sessão
    response.cookies.delete("better-auth.session_token");
    
    return response;
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    return NextResponse.json(
      { error: "Erro ao fazer logout" },
      { status: 500 }
    );
  }
}
