# 🚀 Fluxo de Pagamento e Projetos - Implementação Completa

## Visão Geral

Este documento descreve o fluxo completo de pagamento e gerenciamento de projetos implementado no sistema Softrha 2.0.

---

## 📋 Fluxo Completo Implementado

### 1. Cliente faz simulação e envia solicitação de orçamento
**Página:** `/orcamento`
- Cliente preenche formulário
- Sistema verifica/cria cliente automaticamente
- Orçamento criado com status `pending`

---

### 2. Gestor analisa orçamento
**Página:** `/dashboard/orcamentos/[id]`
- **Aprovar:** Envia proposta com link de aprovação
- **Alterar:** Seleciona motivo obrigatório + descrição opcional
- **Excluir:** Seleciona motivo obrigatório + descrição opcional

---

### 3. Cliente aprova orçamento
**Página:** `/orcamento/aprovar/[token]`
- Token validado
- Status muda para `user_approved`
- Redirecionado para página de agradecimento

---

### 4. Gestor cria contrato
**Página:** `/dashboard/orcamentos/[id]/contrato`
- Contrato gerado automaticamente
- Enviado para o cliente
- Status muda para `contract_sent`

---

### 5. Cliente assina contrato
**Página:** `/contrato/assinatura/[id]`
- Cliente visualiza contrato
- Faz upload do documento assinado (PDF)
- Status muda para `contract_signed`

---

### 6. Gestor envia link de pagamento da entrada (25%)
**Página:** `/dashboard/orcamentos/[id]`

**Ações:**
1. Gestor clica em "Enviar Link Pagamento (25%)"
2. Link de pagamento Stripe é gerado
3. Status do orçamento: `down_payment_sent`
4. Link enviado por e-mail e/ou WhatsApp

**API:** `POST /api/orcamentos/[id]/pagamento`

---

### 7. ⭐ Cliente paga entrada (25%) → Projeto criado automaticamente

**Fluxo Automático via Webhook:**

1. **Cliente acessa link Stripe** → Realiza pagamento
2. **Webhook Stripe** (`POST /api/webhooks/stripe`) recebe evento `checkout.session.completed`
3. **Sistema automaticamente:**
   - ✅ Atualiza pagamento para `paid`
   - ✅ Atualiza orçamento para `down_payment_paid`
   - ✅ **Cria projeto automaticamente** com:
     - Nome: `{tipo} - {cliente}`
     - Status: `planning`
     - Progresso: 0%
     - Cliente vinculado
   - ✅ Atualiza contrato para `signed`
   - ✅ Envia e-mail de confirmação para o cliente

**Status após pagamento:**
- Orçamento: `down_payment_paid`
- Projeto: `planning`
- Pagamento: `paid`

---

### 8. ⭐ Status: "down_payment_paid" → Botão "Ver Projeto" aparece

**Página do Orçamento:** `/dashboard/orcamentos/[id]`

Quando o status é `down_payment_paid` e o projeto foi criado:
- ✅ Botão **"Ver Projeto"** aparece automaticamente
- ✅ Redireciona para `/dashboard/projetos/[id]`

**Página do Projeto (Gestor):** `/dashboard/projetos/[id]`

O gestor pode:
- ✅ Ver detalhes completos do projeto
- ✅ Gerenciar evolução (notificar 20%, 50%, 70%, 100%)
- ✅ Enviar pagamento final quando projeto estiver 100%

---

### 9. ⭐ Gestor gerencia evolução do projeto (20%, 50%, 70%, 100%)

**Página:** `/dashboard/projetos/[id]`

**Botão:** "Notificar Evolução"

**Ao notificar:**
- Gestor seleciona porcentagem (20%, 50%, 70%, 100%)
- Sistema atualiza status do projeto:
  - 20% → `development_20`
  - 50% → `development_50`
  - 70% → `development_70`
  - 100% → `development_100`
- ✅ Cliente recebe e-mail automático com atualização
- ✅ Progresso atualizado no banco de dados

**API:** `POST /api/projetos/[id]/notificar-evolucao`

---

### 10. ⭐ Projeto 100% → Gestor envia pagamento final (75%)

**Quando:** Projeto atinge 100% de progresso

**Página:** `/dashboard/projetos/[id]`

**Botão:** "Enviar Pagamento Final (75%)"

**Ações do Gestor:**
1. Clica em "Enviar Pagamento Final (75%)"
2. Seleciona envio por e-mail e/ou WhatsApp
3. Link de pagamento Stripe é gerado
4. Status do projeto: `waiting_final_payment`
5. Status do orçamento: `final_payment_sent`

**API:** `POST /api/projetos/[id]/pagamento-final`

---

### 11. ⭐ Cliente paga valor final (75%) → Projeto concluído

**Fluxo Automático via Webhook:**

1. **Cliente acessa link Stripe** → Realiza pagamento final
2. **Webhook Stripe** recebe evento `checkout.session.completed`
3. **Sistema automaticamente:**
   - ✅ Atualiza pagamento para `paid`
   - ✅ Atualiza projeto para `completed`
   - ✅ Atualiza progresso para 100%
   - ✅ Atualiza orçamento para `completed`
   - ✅ Envia e-mail de confirmação com link para agendamento

**Status após pagamento:**
- Projeto: `completed`
- Orçamento: `completed`
- Pagamento: `paid`

---

### 12. ⭐ Projeto concluído → Cliente agenda entrega

**Página do Cliente:** `/projetos/[id]/agendar`

**O cliente pode:**
- ✅ Selecionar data (dias úteis apenas)
- ✅ Selecionar horário (9h-18h, de 30 em 30 min)
- ✅ Escolher tipo de entrega:
  - 📹 **Vídeo:** Google Meet/Zoom
  - 📞 **Áudio:** Telefone/WhatsApp
- ✅ Adicionar observações

**Página de Sucesso:** `/projetos/[id]/agendar/obrigado`

**API:** `POST /api/projetos/[id]/agendar`

---

## 🗂️ Status Flow

### Budget Status Flow
```
pending 
  → sent 
  → accepted 
  → user_approved 
  → contract_sent 
  → contract_signed 
  → down_payment_sent 
  → down_payment_paid ⭐ (projeto criado automaticamente)
  → final_payment_sent 
  → final_payment_paid 
  → completed
```

### Project Status Flow
```
waiting_payment 
  → planning ⭐ (após pagamento de 25%)
  → development_20 ⭐ (notificação 20%)
  → development_50 ⭐ (notificação 50%)
  → development_70 ⭐ (notificação 70%)
  → development_100 ⭐ (notificação 100%)
  → waiting_final_payment ⭐ (aguardando 75%)
  → completed ⭐ (após pagamento final)
```

---

## 📄 Páginas Implementadas

### Área do Gestor (Dashboard)
- ✅ `/dashboard/orcamentos/[id]` - Detalhes do orçamento
- ✅ `/dashboard/orcamentos/[id]/contrato` - Criar contrato
- ✅ `/dashboard/projetos/[id]` - Detalhes do projeto
  - Botão "Notificar Evolução" (20%, 50%, 70%, 100%)
  - Botão "Enviar Pagamento Final (75%)"
  - Botão "Agendar Entrega" (quando completed)

### Área do Cliente (Público)
- ✅ `/orcamento` - Simulador de orçamento
- ✅ `/orcamento/aprovar/[token]` - Aprovar orçamento
- ✅ `/orcamento/obrigado` - Agradecimento após aprovação
- ✅ `/contrato/assinatura/[id]` - Assinar contrato
- ✅ `/projetos/[id]` - **NOVO** - Acompanhamento do projeto
- ✅ `/projetos/[id]/agendar` - **NOVO** - Agendar entrega
- ✅ `/projetos/[id]/agendar/obrigado` - **NOVO** - Confirmação de agendamento
- ✅ `/projetos/[id]/pagamento-final` - **NOVO** - Pagamento final

---

## 🔌 APIs Implementadas

### Webhooks
- ✅ `POST /api/webhooks/stripe` - Webhook Stripe (pagamentos)

### Orçamentos
- ✅ `GET /api/orcamentos/[id]` - Buscar orçamento
- ✅ `PUT /api/orcamentos/[id]` - Atualizar orçamento
- ✅ `DELETE /api/orcamentos/[id]` - Excluir orçamento
- ✅ `POST /api/orcamentos/[id]/pagamento` - Gerar link pagamento (25%)
- ✅ `POST /api/orcamentos/[id]/aprovar` - Aprovar orçamento
- ✅ `POST /api/orcamentos/[id]/contrato` - Criar contrato

### Projetos
- ✅ `GET /api/projetos/[id]` - Buscar projeto
- ✅ `POST /api/projetos/[id]/notificar-evolucao` - Notificar evolução
- ✅ `POST /api/projetos/[id]/pagamento-final` - Enviar pagamento final (75%)
- ✅ `POST /api/projetos/[id]/agendar` - Criar agendamento
- ✅ `GET /api/projetos/[id]/agendamento` - Buscar agendamento

---

## 🎯 Funcionalidades Chave

### 1. Criação Automática de Projeto
- ✅ Após pagamento de 25% via Stripe
- ✅ Webhook processa automaticamente
- ✅ Projeto criado com status `planning`
- ✅ Cliente e orçamento vinculados

### 2. Botão "Ver Projeto"
- ✅ Aparece quando status = `down_payment_paid`
- ✅ Redireciona para `/dashboard/projetos/[id]`
- ✅ Gestor pode gerenciar evolução

### 3. Notificação de Evolução
- ✅ Gestor notifica 20%, 50%, 70%, 100%
- ✅ E-mail automático para cliente
- ✅ Status atualizado automaticamente

### 4. Pagamento Final (75%)
- ✅ Projeto 100% → botão liberado
- ✅ Link Stripe gerado automaticamente
- ✅ Webhook confirma pagamento
- ✅ Projeto marcado como `completed`

### 5. Agendamento de Entrega
- ✅ Cliente agenda após projeto concluído
- ✅ Data, horário, tipo (vídeo/áudio)
- ✅ Confirmação por e-mail
- ✅ Página de sucesso personalizada

---

## 🔧 Configuração Necessária

### Variáveis de Ambiente (.env)
```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# E-mail (Resend)
RESEND_API_KEY=re_...
EMAIL_FROM=Softrha <noreply@softrha.com>

# URL da Aplicação
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Stripe Webhook
**Desenvolvimento:**
```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**Produção:**
1. Acesse https://dashboard.stripe.com/test/webhooks
2. Adicione endpoint: `https://seu-domínio.com/api/webhooks/stripe`
3. Eventos: `checkout.session.completed`
4. Copie o signing secret para `STRIPE_WEBHOOK_SECRET`

---

## 📊 Banco de Dados

### Modelos Principais

**Project:**
```prisma
model Project {
  id          String   @id @default(cuid())
  status      String   @default("waiting_payment")
  progress    Int      @default(0)
  // ... campos
}
```

**Budget:**
```prisma
model Budget {
  id           String   @id @default(cuid())
  status       String   @default("pending")
  projectId    String?
  // ... campos
}
```

**Payment:**
```prisma
model Payment {
  id          String   @id @default(cuid())
  type        String   // down_payment, final_payment
  status      String   @default("pending")
  budgetId    String
  projectId   String?
  // ... campos
}
```

---

## 🧪 Testes

### Fluxo de Teste

1. **Criar orçamento** → `/orcamento`
2. **Aprovar orçamento** → Gestor aprova
3. **Criar contrato** → `/dashboard/orcamentos/[id]/contrato`
4. **Assinar contrato** → Cliente assina
5. **Gerar pagamento (25%)** → Gestor clica em "Enviar Link Pagamento"
6. **Pagar entrada** → Cliente usa cartão de teste Stripe:
   - Número: `4242 4242 4242 4242`
   - Validade: Qualquer data futura
   - CVC: 123
   - CEP: 00000-000
7. **Verificar projeto criado** → Webhook cria automaticamente
8. **Botão "Ver Projeto"** → Aparece no orçamento
9. **Notificar evolução** → Gestor notifica 20%, 50%, 70%, 100%
10. **Enviar pagamento final** → Gestor clica em "Enviar Pagamento Final"
11. **Pagar final (75%)** → Cliente paga novamente
12. **Agendar entrega** → Cliente agenda no `/projetos/[id]/agendar`

---

## ✅ Checklist de Implementação

- ✅ Webhook Stripe cria projeto automaticamente após pagamento de 25%
- ✅ Status `down_payment_paid` aparece no orçamento
- ✅ Botão "Ver Projeto" aparece quando status = `down_payment_paid`
- ✅ Gestor pode notificar evolução (20%, 50%, 70%, 100%)
- ✅ E-mails automáticos de evolução enviados
- ✅ Projeto 100% → botão "Enviar Pagamento Final" liberado
- ✅ Webhook confirma pagamento final → projeto `completed`
- ✅ Cliente pode agendar entrega após projeto concluído
- ✅ Página de acompanhamento do projeto para o cliente
- ✅ Página de agendamento de entrega
- ✅ Página de pagamento final
- ✅ Schema do Prisma atualizado
- ✅ Banco de dados sincronizado

---

## 🎉 Resumo

O fluxo completo está implementado e funcional:

1. **Pagamento de 25%** → Projeto criado automaticamente via webhook
2. **Status "down_payment_paid"** → Botão "Ver Projeto" aparece
3. **Gestor gerencia evolução** → Notifica 20%, 50%, 70%, 100%
4. **Projeto 100%** → Gestor envia pagamento final (75%)
5. **Cliente paga final** → Projeto marcado como concluído
6. **Projeto concluído** → Cliente agenda entrega

Todas as páginas, APIs e webhooks estão implementados e testados!
