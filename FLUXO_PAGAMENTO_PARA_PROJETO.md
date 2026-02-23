# 🎯 Fluxo: Pagamento → Criação Automática de Projeto

## ✅ Implementação Completa e Funcional

---

## 📋 Fluxo Passo a Passo

### 1️⃣ Cliente Paga Entrada (25%)

**Ação:** Cliente acessa link de pagamento Stripe e realiza pagamento

**Dados do Pagamento:**
- Valor: 25% do valor total do projeto
- Tipo: `down_payment`
- Status: `pending` → `paid`

---

### 2️⃣ Webhook Stripe Recebe Evento

**Endpoint:** `POST /api/webhooks/stripe`

**Evento:** `checkout.session.completed`

**Processamento:**
```typescript
switch (event.type) {
  case "checkout.session.completed":
    // Extrai dados da sessão
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Busca pagamento pelo budgetId dos metadados
    const payment = await prisma.payment.findFirst({
      where: {
        budgetId: session.metadata.budgetId,
        type: "down_payment",
      },
      include: { budget: true },
    });
    
    // Processa pagamento de entrada
    await handleDownPayment(payment, budget);
}
```

---

### 3️⃣ Projeto Criado Automaticamente na Tabela `Project`

**Handler:** `handleDownPayment(payment, budget)`

**Dados Criados:**
```typescript
const project = await prisma.project.create({
  data: {
    // Nome do projeto
    name: `${budget.projectType} - ${budget.clientName}`,
    
    // Descrição
    description: budget.details || `Projeto criado após pagamento da entrada - ${budget.clientName}`,
    
    // Status inicial
    status: "planning",
    
    // Tipo, complexidade e prazo do orçamento
    type: budget.projectType,
    complexity: complexityMap[budget.complexity] || "medium",
    timeline: timelineMap[budget.timeline] || "normal",
    
    // Valor do projeto
    budget: budget.finalValue,
    
    // ✅ VINCULA AO CLIENTE
    clientId: client.id,  // Cliente criado/buscado anteriormente
    
    // Nome do cliente (campo legado)
    clientName: budget.clientName,
    
    // Usuário que criou (admin)
    createdById: adminUser?.id,
    
    // Progresso inicial
    progress: 0,
  },
});
```

**Projeto criado com sucesso! ✅**

---

### 4️⃣ Budget Atualizado com `projectId`

**Atualização do Orçamento:**
```typescript
// 1. Atualiza status para down_payment_paid
await prisma.budget.update({
  where: { id: budget.id },
  data: { status: "down_payment_paid" },
});

// 2. Vincula projectId ao orçamento
await prisma.budget.update({
  where: { id: budget.id },
  data: { projectId: project.id },
});
```

**Status do Budget:** `down_payment_paid` ✅

---

### 5️⃣ Contrato Atualizado (se existir)

```typescript
if (budget.contract) {
  await prisma.contract.update({
    where: { id: budget.contract.id },
    data: {
      projectId: project.id,
      status: "signed",
      signedAt: new Date(),
    },
  });
}
```

**Status do Contrato:** `signed` ✅

---

### 6️⃣ Botão "Ver Projeto" Aparece no Orçamento

**Página:** `/dashboard/orcamentos/[id]`

**Condição:**
```tsx
{budget.status === "down_payment_paid" && budget.projectId && (
  <Button 
    variant="outline" 
    size="sm" 
    onClick={() => router.push(`/dashboard/projetos/${budget.projectId}`)}
  >
    <FileText className="h-4 w-4 mr-1" />
    Ver Projeto
  </Button>
)}
```

**Botão aparece automaticamente! ✅**

---

### 7️⃣ Gestor Clica em "Ver Projeto"

**Redirecionamento:** `/dashboard/projetos/[id]`

**Dados do Projeto Carregados:**
```typescript
// API: GET /api/projetos/[id]
const project = await prisma.project.findUnique({
  where: { id },
  include: {
    client: {
      select: {
        name: true,
        emails: true,
        phones: true,
      },
    },
    createdBy: {
      select: {
        name: true,
        email: true,
      },
    },
  },
});
```

**Gestor vê:**
- ✅ Nome do projeto
- ✅ Status: `planning`
- ✅ Progresso: 0%
- ✅ Dados do cliente
- ✅ Valor do projeto
- ✅ Timeline

---

### 8️⃣ Polling Atualiza Página do Orçamento Automaticamente

**Implementado na página de orçamento:**
```typescript
useEffect(() => {
  fetchBudget();
  
  // Polling: atualiza a cada 5 segundos
  const intervalId = setInterval(() => {
    fetchBudget(false);
  }, 5000);
  
  return () => clearInterval(intervalId);
}, [params.id]);
```

**Quando pagamento é confirmado:**
```typescript
if (data.status === "down_payment_paid" && data.projectId) {
  toast({
    title: "Pagamento Confirmado!",
    description: "Projeto criado automaticamente. Clique em 'Ver Projeto' para acessar.",
  });
}
```

**Gestor recebe notificação automaticamente! ✅**

---

## 🗄️ Estrutura do Banco de Dados

### Tabela `Project`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | String | ID único do projeto (cuid) |
| `name` | String | Nome: `{tipo} - {cliente}` |
| `description` | String? | Descrição do projeto |
| `status` | String | `planning` (após pagamento) |
| `type` | String | Tipo: web, mobile, etc |
| `complexity` | String | simple, medium, complex |
| `timeline` | String | urgent, normal, flexible |
| `budget` | Float? | Valor total do projeto |
| `clientId` | String | ✅ **Vinculado ao cliente** |
| `clientName` | String? | Nome do cliente |
| `createdById` | String? | ID do usuário que criou |
| `progress` | Int | 0 (inicial) |
| `dueDate` | DateTime? | Data de entrega |
| `createdAt` | DateTime | Data de criação |
| `updatedAt` | DateTime | Data de atualização |

### Tabela `Budget`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | String | ID único do orçamento |
| `status` | String | `down_payment_paid` (após pagamento) |
| `projectId` | String? | ✅ **Vinculado ao projeto** |
| `clientName` | String | Nome do cliente |
| `finalValue` | Float? | Valor total |
| ... | ... | ... |

### Tabela `Client`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | String | ID único do cliente |
| `name` | String | Nome completo |
| `emails` | String | JSON com e-mails |
| `phones` | String | JSON com telefones |
| ... | ... | ... |

---

## 🔄 Fluxo Completo em Imagem

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE PAGA 25%                         │
│              (Link de pagamento Stripe)                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│               WEBHOOK STRIPE RECEBE EVENTO                  │
│         POST /api/webhooks/stripe                           │
│         Evento: checkout.session.completed                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│          HANDLE DOWN PAYMENT (25%)                          │
│  1. Atualiza pagamento → "paid"                             │
│  2. Atualiza orçamento → "down_payment_paid"                │
│  3. Busca/cria cliente                                      │
│  4. CRIA PROJETO NA TABELA PROJECT ✅                       │
│  5. Vincula projeto ao cliente (clientId)                   │
│  6. Atualiza orçamento com projectId                        │
│  7. Atualiza contrato → "signed"                            │
│  8. Envia e-mail de confirmação                             │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│          BOTÃO "VER PROJETO" APARECE                        │
│         Página: /dashboard/orcamentos/[id]                  │
│         Condição: status === "down_payment_paid"            │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│          GESTOR CLICA EM "VER PROJETO"                      │
│         Redireciona: /dashboard/projetos/[id]               │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│          PÁGINA DO PROJETO CARREGADA                        │
│  - Dados do projeto (tabela Project)                        │
│  - Dados do cliente (tabela Client)                         │
│  - Status: planning                                         │
│  - Progresso: 0%                                            │
│  - Botões: Notificar Evolução, etc.                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Status das Tabelas

### Após Pagamento de 25%

| Tabela | Status | projectId/budgetId |
|--------|--------|-------------------|
| `Payment` | `paid` | `budgetId` + `projectId` |
| `Budget` | `down_payment_paid` | `projectId` vinculado |
| `Project` | `planning` | `clientId` vinculado |
| `Contract` | `signed` | `projectId` vinculado |

---

## 🎯 Funcionalidades Implementadas

### ✅ Webhook Stripe
- [x] Recebe evento `checkout.session.completed`
- [x] Identifica tipo de pagamento (down_payment)
- [x] Processa pagamento automaticamente

### ✅ Criação de Projeto
- [x] Cria projeto na tabela `Project`
- [x] Vincula ao cliente (`clientId`)
- [x] Define status como `planning`
- [x] Progresso inicial: 0%
- [x] Copia dados do orçamento

### ✅ Atualização de Budget
- [x] Atualiza status para `down_payment_paid`
- [x] Vincula `projectId` ao orçamento

### ✅ Interface do Gestor
- [x] Botão "Ver Projeto" aparece automaticamente
- [x] Redireciona para `/dashboard/projetos/[id]`
- [x] Polling atualiza página automaticamente
- [x] Toast de notificação quando pagamento confirmado

### ✅ Página do Projeto
- [x] Carrega dados do projeto
- [x] Carrega dados do cliente
- [x] Mostra status e progresso
- [x] Permite gerenciar evolução

---

## 🧪 Testes

### Build do Projeto
```bash
npm run build
```
**Resultado:** ✅ **SUCESSO** - 0 erros

### Fluxo de Teste
1. ✅ Cliente paga 25% no Stripe
2. ✅ Webhook recebe evento
3. ✅ Projeto criado na tabela `Project`
4. ✅ Projeto vinculado ao cliente
5. ✅ Budget atualizado para `down_payment_paid`
6. ✅ Budget vinculado ao projeto
7. ✅ Botão "Ver Projeto" aparece
8. ✅ Gestor clica e acessa projeto
9. ✅ Página do projeto carrega dados corretamente

---

## 📝 Código Chave

### Webhook (Criação do Projeto)
```typescript
const project = await prisma.project.create({
  data: {
    name: `${budget.projectType} - ${budget.clientName}`,
    description: budget.details || `Projeto criado após pagamento da entrada`,
    status: "planning",
    type: budget.projectType,
    complexity: complexityMap[budget.complexity] || "medium",
    timeline: timelineMap[budget.timeline] || "normal",
    budget: budget.finalValue,
    clientId: client.id, // ✅ VINCULA AO CLIENTE
    clientName: budget.clientName,
    createdById: adminUser?.id,
    progress: 0,
  },
});
```

### Botão "Ver Projeto"
```tsx
{budget.status === "down_payment_paid" && budget.projectId && (
  <Button 
    variant="outline" 
    size="sm" 
    onClick={() => router.push(`/dashboard/projetos/${budget.projectId}`)}
  >
    <FileText className="h-4 w-4 mr-1" />
    Ver Projeto
  </Button>
)}
```

### Polling Automático
```typescript
useEffect(() => {
  fetchBudget();
  
  const intervalId = setInterval(() => {
    fetchBudget(false);
  }, 5000);
  
  return () => clearInterval(intervalId);
}, [params.id]);
```

---

## ✅ Conclusão

O fluxo está **100% implementado e funcional**:

1. ✅ **Cliente paga 25%** → Webhook Stripe processa
2. ✅ **Projeto criado automaticamente** na tabela `Project`
3. ✅ **Projeto vinculado ao cliente** (`clientId`)
4. ✅ **Budget atualizado** para `down_payment_paid`
5. ✅ **Botão "Ver Projeto" aparece** automaticamente
6. ✅ **Gestor acessa projeto** em `/dashboard/projetos/[id]`
7. ✅ **Dados completos** do projeto e cliente carregados

**Próximos passos do fluxo (já implementados):**
- Gestor notifica evolução (20%, 50%, 70%, 100%)
- Projeto 100% → Gestor envia pagamento final (75%)
- Cliente paga final → Projeto concluído
- Cliente agenda entrega
