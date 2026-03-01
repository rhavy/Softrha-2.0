import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, period, phone, name } = body;

    if (!date || !period) {
      return NextResponse.json(
        { error: "Data e período são obrigatórios" },
        { status: 400 }
      );
    }

    if (!["manha", "tarde"].includes(period)) {
      return NextResponse.json(
        { error: "Período inválido. Use 'manha' ou 'tarde'." },
        { status: 400 }
      );
    }

    // Validar nome se fornecido
    if (name && name.trim().length < 2) {
      return NextResponse.json(
        { error: "Nome deve ter pelo menos 2 caracteres." },
        { status: 400 }
      );
    }

    // Validar telefone se fornecido
    if (phone) {
      const phoneDigits = phone.replace(/\D/g, "");
      // WhatsApp brasileiro: 10 ou 11 dígitos (fixo ou celular)
      if (phoneDigits.length !== 10 && phoneDigits.length !== 11) {
        return NextResponse.json(
          { error: "WhatsApp inválido. Use o formato (11) 99999-9999 ou (11) 9999-9999." },
          { status: 400 }
        );
      }
    }

    // Definir horário baseado no período
    const time = period === "manha" ? "09:00" : "14:00";

    // Parse da data - corrigir fuso horário
    // A data pode vir como ISO string completa ou YYYY-MM-DD
    const inputDate = new Date(date);
    const year = inputDate.getFullYear();
    const month = inputDate.getMonth(); // 0-11
    const day = inputDate.getDate();

    // Criar data no timezone UTC para evitar problemas de fuso
    // Usamos UTC para garantir que a data seja salva exatamente como selecionada
    const scheduleDate = new Date(Date.UTC(year, month, day, period === "manha" ? 9 : 14, 0, 0));

    console.log("[Agendamento] Data recebida:", date);
    console.log("[Agendamento] Data criada (UTC):", scheduleDate.toISOString());
    console.log("[Agendamento] Período:", period, "Horário:", time);

    // Verificar se a data é válida
    if (isNaN(scheduleDate.getTime())) {
      return NextResponse.json(
        { error: "Data inválida." },
        { status: 400 }
      );
    }

    // Verificar se já existe agendamento nesta data
    const existingSchedule = await prisma.schedule.findFirst({
      where: {
        date: scheduleDate,
        status: "scheduled",
      },
    });

    if (existingSchedule) {
      return NextResponse.json(
        { error: "Este horário já está agendado. Por favor, escolha outra data." },
        { status: 400 }
      );
    }

    // Criar um projeto "placeholder" para o agendamento
    const client = await prisma.client.findFirst();

    // Criar data formatada para o nome do projeto
    const dateFormatted = new Date(year, month - 1, day).toLocaleDateString("pt-BR");

    if (!client) {
      // Criar um cliente padrão se não existir
      const newClient = await prisma.client.create({
        data: {
          firstName: "Cliente",
          lastName: "Agendamento",
          name: "Cliente Agendamento",
          documentType: "cpf",
          document: "00000000000",
        },
      });

      const project = await prisma.project.create({
        data: {
          name: `Reunião Agendada - ${dateFormatted}`,
          description: "Projeto criado automaticamente para agendamento de reunião",
          type: "web",
          complexity: "medium",
          timeline: "normal",
          clientId: newClient.id,
          status: "planning",
        },
      });

      const schedule = await prisma.schedule.create({
        data: {
          projectId: project.id,
          date: scheduleDate,
          time,
          type: "video",
          status: "scheduled",
          meetingLink: null,
          notes: [
            `Agendamento via formulário de contato`,
            `Período: ${period === "manha" ? "Manhã" : "Tarde"}`,
            name ? `Nome: ${name}` : null,
            phone ? `WhatsApp: ${phone}` : null,
          ].filter(Boolean).join(" - "),
          // Salvar dados estruturados no campo history (JSON)
          history: {
            name: name || null,
            phone: phone || null,
            period: period,
            source: "contato",
            createdAt: new Date().toISOString(),
          },
        },
      });

      // Enviar confirmação de WhatsApp automaticamente (servidor)
      if (phone && name) {
        const meetingType = period === "manha" ? "Manhã (9h-12h)" : "Tarde (14h-18h)";
        const selectedDateFormatted = new Date(year, month, day).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });

        const whatsappMessage = `Olá ${name}! 👋\n\nSeu agendamento de reunião foi confirmado!\n\n📅 Data: ${selectedDateFormatted}\n⏰ Período: ${meetingType}\n\nNossa equipe entrará em contato no horário agendado.\n\nAtenciosamente,\nEquipe Softrha`;

        // Enviar WhatsApp via servidor (fire and forget - não bloqueia a resposta)
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        fetch(`${appUrl}/api/whatsapp/enviar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: phone,
            message: whatsappMessage,
          }),
        }).catch(err => console.error("[WhatsApp] Erro ao enviar confirmação:", err));

        console.log("[Agendamento] Confirmação de WhatsApp será enviada para:", phone);
      }

      return NextResponse.json({
        success: true,
        message: "Agendamento realizado com sucesso! Confirmação enviada no WhatsApp.",
        schedule,
      });
    }

    // Criar projeto para o agendamento
    const project = await prisma.project.create({
      data: {
        name: `Reunião Agendada - ${dateFormatted}`,
        description: "Projeto criado automaticamente para agendamento de reunião",
        type: "web",
        complexity: "medium",
        timeline: "normal",
        clientId: client.id,
        status: "planning",
      },
    });

    // Criar agendamento
    const schedule = await prisma.schedule.create({
      data: {
        projectId: project.id,
        date: scheduleDate,
        time,
        type: "video",
        status: "scheduled",
        meetingLink: null,
        notes: [
          `Agendamento via formulário de contato`,
          `Período: ${period === "manha" ? "Manhã" : "Tarde"}`,
          name ? `Nome: ${name}` : null,
          phone ? `WhatsApp: ${phone}` : null,
        ].filter(Boolean).join(" - "),
        // Salvar dados estruturados no campo history (JSON)
        history: {
          name: name || null,
          phone: phone || null,
          period: period,
          source: "contato",
          createdAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Agendamento realizado com sucesso!",
      schedule,
    });
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
    return NextResponse.json(
      { error: "Erro ao criar agendamento. Tente novamente." },
      { status: 500 }
    );
  }
}
