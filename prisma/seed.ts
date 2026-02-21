import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seed do banco de dados iniciado...");

  // Senha simples (em produção use hash!)
  const hashedPassword = "admin123";

  // Criar usuário admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@softrha.com" },
    update: {},
    create: {
      email: "admin@softrha.com",
      name: "Admin SoftRha",
      password: hashedPassword,
      role: "admin",
      emailVerified: true,
    },
  });

  console.log(`✅ Admin criado: ${admin.email}`);

  // Criar usuário de exemplo
  const user = await prisma.user.upsert({
    where: { email: "usuario@softrha.com" },
    update: {},
    create: {
      email: "usuario@softrha.com",
      name: "Usuário Exemplo",
      password: hashedPassword,
      role: "user",
      emailVerified: true,
    },
  });

  console.log(`✅ Usuário criado: ${user.email}`);

  // Criar clientes de exemplo
  const client1 = await prisma.client.create({
    data: {
      firstName: "Tech",
      lastName: "Store",
      name: "Tech Store",
      documentType: "cnpj",
      document: "00.000.000/0001-00",
      emails: JSON.stringify([
        { id: "1", value: "contato@techstore.com", type: "trabalho", isPrimary: true }
      ]),
      phones: JSON.stringify([
        { id: "1", value: "(11) 99999-1111", type: "whatsapp", isPrimary: true }
      ]),
      address: "Rua das Tecnologias, 1000",
      number: "1000",
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
      zipCode: "01000-000",
      status: "active",
    },
  });

  console.log(`✅ Cliente criado: ${client1.name}`);

  // Criar mais clientes de exemplo
  const client2 = await prisma.client.create({
    data: {
      firstName: "Food",
      lastName: "Fast",
      name: "Food Fast",
      documentType: "cnpj",
      document: "11.111.111/0001-11",
      emails: JSON.stringify([
        { id: "1", value: "contato@foodfast.com", type: "trabalho", isPrimary: true }
      ]),
      phones: JSON.stringify([
        { id: "1", value: "(11) 99999-2222", type: "whatsapp", isPrimary: true }
      ]),
      address: "Av. dos Deliverys, 500",
      number: "500",
      neighborhood: "Centro",
      city: "Rio de Janeiro",
      state: "RJ",
      zipCode: "20000-000",
      status: "active",
    },
  });

  const client3 = await prisma.client.create({
    data: {
      firstName: "Consultoria",
      lastName: "ABC",
      name: "Consultoria ABC",
      documentType: "cnpj",
      document: "22.222.222/0001-22",
      emails: JSON.stringify([
        { id: "1", value: "contato@abc.com", type: "trabalho", isPrimary: true }
      ]),
      phones: JSON.stringify([
        { id: "1", value: "(11) 99999-3333", type: "whatsapp", isPrimary: true },
        { id: "2", value: "(11) 3333-3333", type: "convencional", isPrimary: false }
      ]),
      address: "Rua Empresarial, 200",
      number: "200",
      complement: "Sala 101",
      neighborhood: "Empresarial",
      city: "Belo Horizonte",
      state: "MG",
      zipCode: "30000-000",
      status: "active",
    },
  });

  console.log(`✅ Clientes adicionais criados`);

  // Criar projeto de exemplo
  const project = await prisma.project.create({
    data: {
      name: "E-commerce TechStore",
      description: "Loja virtual completa para venda de produtos de tecnologia",
      status: "development",
      type: "ecommerce",
      complexity: "complex",
      timeline: "normal",
      budget: 15000,
      clientId: client1.id,
      clientName: client1.name,
      tech: JSON.stringify(["Next.js", "TypeScript", "Stripe", "Prisma"]),
      progress: 65,
      createdById: user.id,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
    },
  });

  console.log(`✅ Projeto criado: ${project.name}`);

  // Criar tarefas de exemplo
  await prisma.task.createMany({
    data: [
      {
        title: "Configurar Next.js e TypeScript",
        description: "Setup inicial do projeto",
        status: "done",
        priority: "high",
        projectId: project.id,
        dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        completedAt: new Date(),
      },
      {
        title: "Implementar autenticação",
        description: "Better Auth com email e OAuth",
        status: "done",
        priority: "high",
        projectId: project.id,
        dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        completedAt: new Date(),
      },
      {
        title: "Criar catálogo de produtos",
        description: "Listagem, filtros e busca",
        status: "in_progress",
        priority: "high",
        projectId: project.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Integrar gateway de pagamento",
        description: "Stripe ou MercadoPago",
        status: "todo",
        priority: "medium",
        projectId: project.id,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Implementar carrinho de compras",
        description: "Adicionar, remover e editar quantidades",
        status: "todo",
        priority: "high",
        projectId: project.id,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log("✅ Tarefas criadas");

  // Criar milestones
  await prisma.milestone.createMany({
    data: [
      {
        title: "Setup e Autenticação",
        description: "Configuração do projeto e sistema de login",
        status: "completed",
        projectId: project.id,
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        completedAt: new Date(),
      },
      {
        title: "Catálogo e Busca",
        description: "Listagem de produtos com filtros",
        status: "in_progress",
        projectId: project.id,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Checkout e Pagamento",
        description: "Fluxo completo de compra",
        status: "pending",
        projectId: project.id,
        dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log("✅ Milestones criados");

  // Criar orçamento de exemplo
  await prisma.budget.create({
    data: {
      projectId: project.id,
      userId: user.id,
      status: "accepted",
      projectType: "ecommerce",
      complexity: "complex",
      timeline: "normal",
      features: ["responsive", "seo", "auth", "database", "payments", "analytics"],
      integrations: ["whatsapp", "google", "email", "payment"],
      pages: 8,
      estimatedMin: 12000,
      estimatedMax: 18000,
      finalValue: 15000,
      clientName: "Usuário Exemplo",
      clientEmail: "usuario@softrha.com",
      company: "TechStore Ltda",
      details: "Loja virtual para venda de produtos de informática e eletrônicos.",
    },
  });

  console.log("✅ Orçamento criado");

  // Criar mais orçamentos de exemplo
  const budget2 = await prisma.budget.create({
    data: {
      userId: user.id,
      status: "pending",
      projectType: "landing",
      complexity: "simple",
      timeline: "urgent",
      features: ["responsive", "seo", "contact-form"],
      integrations: ["whatsapp", "email"],
      pages: 3,
      estimatedMin: 2500,
      estimatedMax: 4000,
      finalValue: 3200,
      clientName: "Food Fast",
      clientEmail: "contato@foodfast.com",
      company: "Food Fast Delivery",
      details: "Landing page para campanha de delivery de lanches.",
    },
  });

  const budget3 = await prisma.budget.create({
    data: {
      userId: user.id,
      status: "sent",
      projectType: "dashboard",
      complexity: "complex",
      timeline: "normal",
      features: ["responsive", "auth", "database", "charts", "reports", "export"],
      integrations: ["api", "email", "google"],
      pages: 12,
      estimatedMin: 18000,
      estimatedMax: 25000,
      finalValue: 21500,
      clientName: "Consultoria ABC",
      clientEmail: "contato@abc.com",
      company: "Consultoria ABC Ltda",
      details: "Dashboard completo para gestão de indicadores e relatórios empresariais.",
    },
  });

  const budget4 = await prisma.budget.create({
    data: {
      userId: user.id,
      status: "accepted",
      projectType: "mobile",
      complexity: "complex",
      timeline: "flexible",
      features: ["responsive", "auth", "database", "payments", "notifications", "maps"],
      integrations: ["whatsapp", "payment", "maps", "push"],
      pages: 15,
      estimatedMin: 25000,
      estimatedMax: 35000,
      finalValue: 30000,
      clientName: "Tech Store",
      clientEmail: "contato@techstore.com",
      company: "Tech Store E-commerce",
      details: "Aplicativo móvel para iOS e Android com integração à loja virtual.",
    },
  });

  const budget5 = await prisma.budget.create({
    data: {
      userId: user.id,
      status: "rejected",
      projectType: "web",
      complexity: "medium",
      timeline: "normal",
      features: ["responsive", "seo", "auth", "database", "blog"],
      integrations: ["whatsapp", "email", "analytics"],
      pages: 6,
      estimatedMin: 8000,
      estimatedMax: 12000,
      finalValue: 10000,
      clientName: "Restaurante Sabor & Arte",
      clientEmail: "contato@saborarte.com",
      company: "Sabor & Arte Restaurante",
      details: "Site institucional para restaurante com cardápio online e sistema de reservas.",
    },
  });

  const budget6 = await prisma.budget.create({
    data: {
      userId: user.id,
      status: "pending",
      projectType: "ecommerce",
      complexity: "medium",
      timeline: "urgent",
      features: ["responsive", "seo", "auth", "database", "payments"],
      integrations: ["whatsapp", "payment", "email"],
      pages: 10,
      estimatedMin: 10000,
      estimatedMax: 15000,
      finalValue: 12500,
      clientName: "Moda & Estilo",
      clientEmail: "contato@modaestilo.com",
      company: "Moda & Estilo Ltda",
      details: "E-commerce de roupas e acessórios femininos.",
    },
  });

  const budget7 = await prisma.budget.create({
    data: {
      userId: user.id,
      status: "sent",
      projectType: "software",
      complexity: "complex",
      timeline: "flexible",
      features: ["responsive", "auth", "database", "api", "reports", "export", "integrations"],
      integrations: ["api", "email", "erp"],
      pages: 20,
      estimatedMin: 35000,
      estimatedMax: 50000,
      finalValue: 42000,
      clientName: "Logística Express",
      clientEmail: "ti@logisticaexpress.com",
      company: "Logística Express S.A.",
      details: "Sistema de gestão logística com integração a ERPs e rastreamento em tempo real.",
    },
  });

  const budget8 = await prisma.budget.create({
    data: {
      userId: user.id,
      status: "accepted",
      projectType: "landing",
      complexity: "simple",
      timeline: "normal",
      features: ["responsive", "seo", "contact-form", "analytics"],
      integrations: ["whatsapp", "email", "pixel"],
      pages: 2,
      estimatedMin: 2000,
      estimatedMax: 3500,
      finalValue: 2800,
      clientName: "Advocacia Silva & Associados",
      clientEmail: "contato@silvaadv.com",
      company: "Silva & Associados",
      details: "Landing page para campanha de marketing digital.",
    },
  });

  console.log("✅ Orçamentos adicionais criados");

  // Criar membros da equipe de exemplo
  await prisma.teamMember.createMany({
    data: [
      {
        name: "Ana Silva",
        role: "Desenvolvedora Frontend",
        email: "ana@softrha.com",
        phone: "(11) 99999-1111",
        status: "active",
        skills: JSON.stringify(["React", "TypeScript", "TailwindCSS"]),
        projects: 3,
      },
      {
        name: "Bruno Costa",
        role: "Desenvolvedor Backend",
        email: "bruno@softrha.com",
        phone: "(11) 99999-2222",
        status: "active",
        skills: JSON.stringify(["Node.js", "Python", "PostgreSQL"]),
        projects: 4,
      },
      {
        name: "Carla Mendes",
        role: "Designer UI/UX",
        email: "carla@softrha.com",
        phone: "(11) 99999-3333",
        status: "busy",
        skills: JSON.stringify(["Figma", "Adobe XD", "Design System"]),
        projects: 2,
      },
    ],
  });

  console.log("✅ Membros da equipe criados");

  // Criar documentos de exemplo
  await prisma.document.createMany({
    data: [
      {
        name: "Proposta Comercial - TechStore",
        type: "pdf",
        size: "2.4 MB",
        folder: "Propostas",
        author: "Ana Silva",
      },
      {
        name: "Wireframes - App Delivery",
        type: "image",
        size: "15.8 MB",
        folder: "Design",
        author: "Carla Mendes",
      },
      {
        name: "Cronograma Q1 2026",
        type: "sheet",
        size: "1.2 MB",
        folder: "Planejamento",
        author: "Elena Ferreira",
      },
    ],
  });

  console.log("✅ Documentos criados");

  // Criar eventos de exemplo
  await prisma.event.createMany({
    data: [
      {
        title: "Reunião de Kickoff - TechStore",
        type: "meeting",
        date: new Date("2026-02-20"),
        time: "09:00",
        location: "Google Meet",
        project: "E-commerce Platform",
        participants: JSON.stringify(["Ana", "Bruno", "Elena"]),
      },
      {
        title: "Review Sprint 4",
        type: "review",
        date: new Date("2026-02-20"),
        time: "14:00",
        location: "Sala de Reuniões",
        project: "App Delivery",
        participants: JSON.stringify(["Daniel", "Carla", "Elena"]),
      },
      {
        title: "Apresentação de Design",
        type: "presentation",
        date: new Date("2026-02-21"),
        time: "10:00",
        location: "Google Meet",
        project: "Dashboard Analytics",
        participants: JSON.stringify(["Carla", "Ana", "Bruno"]),
      },
    ],
  });

  console.log("✅ Eventos criados");

  // Criar atividades de exemplo
  await prisma.activity.createMany({
    data: [
      {
        type: "project_created",
        description: "Projeto E-commerce TechStore criado",
        userId: user.id,
        projectId: project.id,
      },
      {
        type: "task_completed",
        description: "Tarefa 'Configurar Next.js e TypeScript' concluída",
        userId: user.id,
        projectId: project.id,
      },
      {
        type: "budget_accepted",
        description: "Orçamento aprovado pelo cliente",
        userId: user.id,
        projectId: project.id,
      },
    ],
  });

  console.log("✅ Atividades criadas");

  // Criar notificações de exemplo
  console.log("\n📬 Criando notificações de exemplo...");
  
  await prisma.notification.createMany({
    data: [
      {
        userId: admin.id,
        title: "Bem-vindo ao SoftRha!",
        message: "Sua conta foi criada com sucesso. Explore o dashboard para começar a gerenciar seus projetos.",
        type: "success",
        category: "general",
        read: false,
        link: "/dashboard",
      },
      {
        userId: admin.id,
        title: "Novo Orçamento Recebido",
        message: "Tech Store solicitou um orçamento para desenvolvimento de E-commerce.",
        type: "info",
        category: "budget",
        read: false,
        link: "/dashboard/orcamentos",
      },
      {
        userId: admin.id,
        title: "Novo Cliente Cadastrado",
        message: "Tech Store foi cadastrado no sistema.",
        type: "success",
        category: "client",
        read: true,
        link: "/dashboard/clientes",
      },
      {
        userId: admin.id,
        title: "Projeto Criado",
        message: "E-commerce Platform foi criado para Tech Store.",
        type: "info",
        category: "project",
        read: true,
        link: "/dashboard/projetos",
      },
      {
        userId: admin.id,
        title: "Tarefa Concluída",
        message: "Ana Silva concluiu a tarefa 'Configurar banco de dados'.",
        type: "success",
        category: "task",
        read: false,
        link: "/dashboard/projetos",
      },
      {
        userId: admin.id,
        title: "Prazo Próximo",
        message: "O projeto E-commerce Platform vence em 5 dias.",
        type: "warning",
        category: "project",
        read: false,
        link: "/dashboard/projetos",
      },
      {
        userId: admin.id,
        title: "Orçamento Aceito",
        message: "Tech Store aceitou a proposta de R$ 15.000,00.",
        type: "success",
        category: "budget",
        read: false,
        link: "/dashboard/orcamentos",
      },
      {
        userId: admin.id,
        title: "Comentário Novo",
        message: "Bruno Costa comentou em 'API Integration'.",
        type: "info",
        category: "task",
        read: true,
        link: "/dashboard/projetos",
      },
    ],
  });

  console.log("✅ Notificações de exemplo criadas");

  console.log("\n🎉 Seed concluído com sucesso!");
  console.log("\n📧 Credenciais de teste:");
  console.log("   Admin: admin@softrha.com / admin123");
  console.log("   User:  usuario@softrha.com / admin123");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
