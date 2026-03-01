import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/whatsapp/enviar
 * 
 * Envia mensagem de WhatsApp via servidor
 * Usando API externa (ex: Z-API, Evolution API, Twilio, etc)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, message } = body;

    if (!phone || !message) {
      return NextResponse.json(
        { error: "Telefone e mensagem são obrigatórios" },
        { status: 400 }
      );
    }

    // Remover caracteres não numéricos e adicionar código do país
    const phoneDigits = phone.replace(/\D/g, "");
    const fullPhone = phoneDigits.startsWith("55") ? phoneDigits : `55${phoneDigits}`;

    console.log("[WhatsApp] Enviando mensagem para:", fullPhone);
    console.log("[WhatsApp] Mensagem:", message);

    // Opção 1: Usando Z-API (serviço popular no Brasil)
    // Documentação: https://docs.z-api.io/
    const zApiToken = process.env.Z_API_TOKEN;
    const zApiSenderId = process.env.Z_API_SENDER_ID;

    if (zApiToken && zApiSenderId) {
      const response = await fetch(
        `https://api.z-api.io/instances/${zApiSenderId}/token/${zApiToken}/send-text-message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: fullPhone,
            message: message,
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        console.log("[WhatsApp] Mensagem enviada com sucesso via Z-API");
        return NextResponse.json({
          success: true,
          message: "Mensagem enviada com sucesso",
          data: result,
        });
      } else {
        console.error("[WhatsApp] Erro ao enviar via Z-API:", result);
      }
    }

    // Opção 2: Usando Evolution API (open source)
    // Documentação: https://doc.evolution-api.com/
    const evolutionApiUrl = process.env.EVOLUTION_API_URL;
    const evolutionApiKey = process.env.EVOLUTION_API_KEY;
    const evolutionInstance = process.env.EVOLUTION_INSTANCE;

    if (evolutionApiUrl && evolutionApiKey && evolutionInstance) {
      const response = await fetch(
        `${evolutionApiUrl}/message/sendText/${evolutionInstance}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: evolutionApiKey,
          },
          body: JSON.stringify({
            number: fullPhone,
            textMessage: {
              text: message,
            },
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        console.log("[WhatsApp] Mensagem enviada com sucesso via Evolution API");
        return NextResponse.json({
          success: true,
          message: "Mensagem enviada com sucesso",
          data: result,
        });
      } else {
        console.error("[WhatsApp] Erro ao enviar via Evolution API:", result);
      }
    }

    // Opção 3: Usando Twilio (serviço internacional)
    // Documentação: https://www.twilio.com/docs/whatsapp/api
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;

    if (twilioAccountSid && twilioAuthToken && twilioWhatsAppNumber) {
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString("base64")}`,
          },
          body: new URLSearchParams({
            From: `whatsapp:${twilioWhatsAppNumber}`,
            To: `whatsapp:+${fullPhone}`,
            Body: message,
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        console.log("[WhatsApp] Mensagem enviada com sucesso via Twilio");
        return NextResponse.json({
          success: true,
          message: "Mensagem enviada com sucesso",
          data: result,
        });
      } else {
        console.error("[WhatsApp] Erro ao enviar via Twilio:", result);
      }
    }

    // Se nenhum serviço estiver configurado, retornar erro
    console.error("[WhatsApp] Nenhum serviço de WhatsApp configurado");
    return NextResponse.json(
      { 
        error: "Serviço de WhatsApp não configurado",
        hint: "Configure Z_API_TOKEN, EVOLUTION_API_URL ou TWILIO_* no .env"
      },
      { status: 500 }
    );

  } catch (error) {
    console.error("[WhatsApp] Erro ao enviar mensagem:", error);
    return NextResponse.json(
      { error: "Erro ao enviar mensagem de WhatsApp" },
      { status: 500 }
    );
  }
}
