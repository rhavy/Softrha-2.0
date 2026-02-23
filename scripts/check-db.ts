
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function check() {
    const budgetCount = await prisma.budget.count();
    const projectCount = await prisma.project.count();
    const paymentCount = await prisma.payment.count();
    const clientCount = await prisma.client.count();

    console.log("Budget count:", budgetCount);
    console.log("Project count:", projectCount);
    console.log("Payment count:", paymentCount);
    console.log("Client count:", clientCount);

    const budgets = await prisma.budget.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
    });
    console.log("Last 5 Budgets:", budgets.map(b => ({ id: b.id, status: b.status, projectId: b.projectId })));

    const payments = await prisma.payment.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
    });
    console.log("Last 5 Payments:", payments.map(p => ({ id: p.id, type: p.type, status: p.status, projectId: p.projectId })));

    const projects = await prisma.project.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
    });
    console.log("Last 5 Projects:", projects.map(p => ({ id: p.id, status: p.status, name: p.name })));
}

check()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
