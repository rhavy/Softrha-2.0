import { NextRequest, NextResponse } from "next/server";

// Endpoint de teste para verificar se o webhook está acessível
export async function POST(request: NextRequest) {
  const body = await request.json();
  
  console.log("========================================");
  console.log("[TESTE WEBHOOK] Evento recebido!");
  console.log("[TESTE WEBHOOK] Tipo:", body.type);
  console.log("[TESTE WEBHOOK] Dados:", JSON.stringify(body, null, 2));
  console.log("========================================");
  
  return NextResponse.json({ 
    received: true, 
    type: body.type,
    timestamp: new Date().toISOString()
  });
}

export async function GET() {
  return NextResponse.json({ 
    status: "ok", 
    message: "Webhook endpoint is accessible",
    timestamp: new Date().toISOString()
  });
}
