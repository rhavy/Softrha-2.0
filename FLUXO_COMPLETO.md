# 🚀 Fluxo Completo de Orçamentos e Projetos - Softrha 2.0

## Visão Geral

Este documento descreve o fluxo completo implementado para gestão de orçamentos e projetos na plataforma Softrha 2.0.

---

## 📋 Fluxo Principal

### 1. Cliente faz simulação e envia solicitação de orçamento

**Página:** `/orcamento`

**O que acontece:**
- Cliente preenche formulário com:
  - Tipo de projeto, complexidade, prazo
  - Funcionalidades e integrações
  - Dados pessoais (nome, email, telefone, CPF/CNPJ)
  
- **Verificação de cliente:**
  - Se cliente já existe (mesmo nome/email/telefone) → Reutiliza
  - Se cliente novo → Cria automaticamente
  
- **Orçamento criado:**
  - Vinculado ao cliente
  - Status: `pending`
  - Token de aprovação gerado

**APIs envolvidas:**
- `POST /api/clientes/verificar`
- `POST /api/orcamentos/criar`

---

### 2. Gestor analisa orçamento

**Página:** `/dashboard/orcamentos/[id]`

**Ações do Gestor:**

#### a) Aprovar orçamento
- Envia proposta por e-mail e/ou WhatsApp
- Cliente recebe link tokenizado de aprovação
- Link válido por 7 dias

**API:** `POST /api/orcamentos/[id]/enviar-proposta`

#### b) Alterar orçamento
- **Obrigatório:** Selecionar motivo (select)
  - `preco_incompativel`
  - `prazo_incompativel`
  - `escopo_alterado`
  - `cliente_desistiu`
  - `cliente_sem_resposta`
  - `erro_interno`
  - `outro`
- **Opcional:** Descrever motivo (textarea)

**API:** `PUT /api/orcamentos/[id]`

#### c) Excluir orçamento
- **Obrigatório:** Selecionar motivo (select)
- **Opcional:** Descrever motivo (textarea)
- Orçamento marcado como `rejected` antes de excluir

**API:** `DELETE /api/orcamentos/[id]`

---

### 3. Cliente aprova orçamento

**Página:** `/orcamento/aprovar/[token]`

**O que acontece:**
- Cliente clica no link recebido por e-mail/WhatsApp
- Token validado
- Status do orçamento muda para `user_approved`
- `userApprovedAt` registrado
- Redirecionado para página de agradecimento

**Página de agradecimento:** `/orcamento/obrigado`

**API:** `GET /api/orcamentos/aprovar/[token]`

---

### 4. Gestor cria contrato

**Página:** `/dashboard/orcamentos/[id]`

**O que acontece:**
- Gestor clica em "Criar Contrato"
- Contrato gerado automaticamente com dados do orçamento
- Enviado por e-mail e/ou WhatsApp para o cliente
- Status muda para `contract_sent`

**API:** `POST /api/orcamentos/[id]/contrato`

---

### 5. Cliente assina contrato

**Página:** `/contrato/assinatura/[id]`

**O que acontece:**
- Cliente acessa link do contrato
- Visualiza contrato na tela
- Faz upload do documento assinado (PDF)
- Preenche nome completo para assinatura
- Status muda para `signed_by_client`

**Página de agradecimento:** `/contrato/obrigado`

**API:** `POST /api/contratos/[id]/assinar`

---

### 6. Gestor inicia projeto e envia link de pagamento (25%)

**Página:** `/dashboard/orcamentos/[id]`

**O que acontece:**
- Gestor clica em "Iniciar Projeto"
- Projeto criado automaticamente com:
  - Dados do orçamento
  - Status: `planning` ou `waiting_payment`
  - Progresso: 0%
- Link de pagamento da entrada (25%) gerado
- Status do orçamento: `down_payment_sent`

**APIs:**
- `POST /api/orcamentos/[id]/iniciar-projeto`
- `POST /api/orcamentos/[id]/pagamento`

---

### 7. Cliente paga entrada (25%)

**O que acontece:**
- Cliente acessa link Stripe
- Realiza pagamento
- Webhook Stripe processa pagamento

**Webhook:** `POST /api/webhooks/stripe`

**Atualizações automáticas:**
- Pagamento: status → `paid`
- Orçamento: status → `down_payment_paid`
- Projeto: 
  - Status → `planning`
  - Contrato: status → `signed`
- E-mail de confirmação enviado

---

### 8. Projeto em desenvolvimento - Notificações de evolução

**Página do Projeto:** `/dashboard/projetos/[id]`

**O que acontece:**
- Gestor acompanha evolução do projeto
- Notifica cliente em marcos importantes:
  - 20% - Início do desenvolvimento
  - 50% - Metade do caminho
  - 70% - Quase concluído
  - 100% - Projeto concluído

**API:** `POST /api/projetos/[id]/notificar-evolucao`

**Status do projeto:**
- `planning` → Planejamento
- `development_20` → 20% concluído
- `development_50` → 50% concluído
- `development_70` → 70% concluído
- `development_100` → 100% concluído

---

### 9. Projeto 100% - Gestor envia link de pagamento final (75%)

**Página:** `/dashboard/projetos/[id]`

**O que acontece:**
- Projeto atinge 100% de progresso
- Status: `completed`
- Gestor clica em "Pagamento Final"
- Link de pagamento do saldo restante (75%) gerado
- Enviado por e-mail e/ou WhatsApp
- Status do orçamento: `final_payment_sent`
- Status do projeto: `waiting_final_payment`

**API:** `POST /api/projetos/[id]/pagamento-final`

---

### 10. Cliente paga valor final (75%)

**O que acontece:**
- Cliente acessa link Stripe
- Realiza pagamento final
- Webhook Stripe processa pagamento

**Webhook:** `POST /api/webhooks/stripe`

**Atualizações automáticas:**
- Pagamento: status → `paid`
- Projeto: 
  - Status → `completed`
  - Progresso → 100%
- Orçamento: status → `completed`
- E-mail de confirmação enviado com link para agendamento

---

### 11. Cliente agenda entrega

**Página:** `/projetos/[id]/agendar`

**O que acontece:**
- Cliente acessa link de agendamento
- Seleciona:
  - Data (dias úteis apenas)
  - Horário (9h-18h, de 30 em 30 min)
  - Tipo de entrega: Vídeo ou Áudio
  - Observações (opcional)
- Agendamento confirmado
- Status: `scheduled`

**Página de sucesso:** `/projetos/[id]/agendamento/sucesso`

**API:** `POST /api/projetos/[id]/agendamento`

---

### 12. Entrega do projeto

**O que acontece:**
- No dia/horário agendado:
  - **Vídeo:** Link da reunião enviado (Google Meet)
  - **Áudio:** Gestor liga para o cliente
- Projeto apresentado
- Acessos e documentação entregues
- Suporte pós-entrega iniciado

---

## 🗂️ Modelos de Dados (Prisma)

### Budget (Orçamento)
```prisma
model Budget {
  id                  String   @id @default(cuid())
  status              String   // pending, sent, accepted, rejected, user_approved, contract_sent, contract_signed, down_payment_sent, down_payment_paid, project_in_progress, final_payment_sent, final_payment_paid, completed
  changeReason        Select?  // motivo alteração
  changeDescription   String?
  deletionReason      Select?  // motivo exclusão
  deletionDescription String?
  approvalToken       String?  @unique
  approvalTokenExpires DateTime?
  userApprovedAt      DateTime?
  // ... outros campos
}
```

### Project
```prisma
model Project {
  id          String   @id @default(cuid())
  status      String   // planning, development_20, development_50, development_70, development_100, waiting_final_payment, completed
  progress    Int      // 0, 20, 50, 70, 100
  contract    Contract?
  schedule    Schedule?
  // ... outros campos
}
```

### Contract
```prisma
model Contract {
  id               String   @id @default(cuid())
  budgetId         String   @unique
  projectId        String?  @unique
  documentUrl      String?
  status           String   // pending, sent, signed_by_client, signed
  sentAt           DateTime?
  signedByClientAt DateTime?
  signedAt         DateTime?
  content          String?  @db.Text
}
```

### Schedule
```prisma
model Schedule {
  id              String   @id @default(cuid())
  projectId       String   @unique
  date            DateTime
  time            String   // HH:mm
  type            String   // video, audio
  status          String   // scheduled, completed, cancelled, rescheduled
  meetingLink     String?
  notes           String?
}
```

---

## 📧 Integrações

### E-mail (Resend)
- Envio de propostas
- Envio de contratos
- Notificações de evolução
- Confirmações de pagamento
- Confirmações de agendamento

### WhatsApp
- Links diretos para envio de mensagens
- URLs: `https://wa.me/55{numero}?text={mensagem}`

### Stripe
- Links de pagamento
- Webhooks para confirmação automática
- Pagamento de entrada (25%)
- Pagamento final (75%)

---

## 🔐 Segurança

- Tokens de aprovação únicos e com expiração (7 dias)
- Webhook Stripe com validação de assinatura
- Upload de contratos apenas em PDF
- APIs protegidas com autenticação (Better Auth)
- Páginas públicas apenas para aprovação/agendamento

---

## 📊 Status Flow

### Budget Status Flow
```
pending → sent → accepted → user_approved → contract_sent → contract_signed → down_payment_paid → project_in_progress → final_payment_paid → completed
```

### Project Status Flow
```
planning → development_20 → development_50 → development_70 → development_100 → waiting_final_payment → completed
```

---

## 🎯 Próximos Passos (Sugestões)

1. **Dashboard Analytics**
   - Gráficos de conversão (orçamentos → projetos)
   - Tempo médio por fase
   - Receita total por período

2. **Automações**
   - Lembretes automáticos de pagamento
   - Follow-up de orçamentos pendentes
   - NPS pós-entrega

3. **Documentação**
   - Upload de documentos do projeto
   - Base de conhecimento
   - FAQ para clientes

4. **Mobile**
   - App para acompanhamento de projetos
   - Notificações push

---

## 📝 Considerações Finais

Este fluxo cobre todo o ciclo de vida de um projeto, desde a simulação do orçamento até a entrega final. Todas as etapas são rastreáveis e notificam automaticamente o cliente, proporcionando uma experiência profissional e transparente.

**Tecnologias utilizadas:**
- Next.js 16
- Prisma ORM
- MySQL
- Stripe (pagamentos)
- Resend (e-mails)
- Better Auth (autenticação)
- shadcn/ui (componentes)
- Framer Motion (animações)
