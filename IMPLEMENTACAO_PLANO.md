# 📋 Plano de Implementação - Fluxo de Orçamentos e Projetos

## ✅ Banco de Dados (Já Configurado)

O schema.prisma já está correto com todos os modelos necessários:
- ✅ Budget (com status, token de aprovação, justificativas)
- ✅ Project (com progresso 20/50/70/100%)
- ✅ Contract (contratos)
- ✅ Schedule (agendamentos)
- ✅ Payment (pagamentos)
- ✅ Client (clientes)
- ✅ Enum Select (motivos)

## 🎯 Implementação Necessária

### 1. APIs Backend

#### 1.1 Verificar/Criar Cliente
- **Rota:** `POST /api/clientes/verificar-criar`
- **Entrada:** nome, email, telefone, documento, empresa
- **Saída:** cliente (existente ou criado)
- **Lógica:** Busca por email/telefone, cria se não existir

#### 1.2 Criar Orçamento
- **Rota:** `POST /api/orcamentos/criar`
- **Entrada:** dados da simulação + clientId
- **Saída:** orçamento criado
- **Lógica:** Gera approvalToken, vincula cliente

#### 1.3 Listar Orçamentos (Dashboard)
- **Rota:** `GET /api/orcamentos`
- **Autenticação:** Requerida (gestor)
- **Saída:** Lista de orçamentos com cliente

#### 1.4 Detalhes do Orçamento
- **Rota:** `GET /api/orcamentos/:id`
- **Autenticação:** Requerida
- **Saída:** Orçamento + cliente + contrato + pagamentos

#### 1.5 Aprovar Orçamento (Gestor)
- **Rota:** `PUT /api/orcamentos/:id/aprovar`
- **Ação:** Envia e-mail/WhatsApp com link de aprovação
- **Gera:** approvalToken válido por 7 dias

#### 1.6 Alterar Orçamento
- **Rota:** `PUT /api/orcamentos/:id`
- **Requer:** changeReason (obrigatório), changeDescription (opcional)
- **Ação:** Atualiza dados + justificativa

#### 1.7 Excluir Orçamento
- **Rota:** `DELETE /api/orcamentos/:id`
- **Requer:** deletionReason (obrigatório), deletionDescription (opcional)
- **Ação:** Marca como rejected + justificativa, depois exclui

#### 1.8 Aprovação do Cliente (Pública)
- **Rota:** `GET /api/orcamentos/aprovar/:token`
- **Autenticação:** Não requer
- **Ação:** Valida token, muda status para `user_approved`
- **Redirect:** `/obrigado/aprovacao`

#### 1.9 Criar Contrato
- **Rota:** `POST /api/orcamentos/:id/contrato`
- **Ação:** Gera contrato, envia e-mail/WhatsApp
- **Status:** `contract_sent`

#### 1.10 Upload Contrato Assinado
- **Rota:** `POST /api/contratos/:id/assinar`
- **Ação:** Upload PDF, atualiza status para `signed_by_client`

#### 1.11 Gerar Link Pagamento (25%)
- **Rota:** `POST /api/orcamentos/:id/pagamento-entrada`
- **Ação:** Cria link Stripe (25% do valor)
- **Status:** `down_payment_sent`

#### 1.12 Webhook Stripe
- **Rota:** `POST /api/webhooks/stripe`
- **Ação:** 
  - Entrada paga → Cria projeto, status `down_payment_paid`
  - Final pago → Status `completed`, redirect agendamento

#### 1.13 Notificar Evolução
- **Rota:** `POST /api/projetos/:id/notificar`
- **Entrada:** progress (20/50/70/100)
- **Ação:** Envia e-mail/WhatsApp para cliente

#### 1.14 Pagamento Final (75%)
- **Rota:** `POST /api/projetos/:id/pagamento-final`
- **Ação:** Link Stripe (75% restante)

#### 1.15 Agendar Entrega
- **Rota:** `POST /api/projetos/:id/agendar`
- **Entrada:** data, hora, tipo (video/audio)
- **Ação:** Cria schedule, envia confirmação

### 2. Páginas Frontend

#### 2.1 Simulação de Orçamento
- **Rota:** `/orcamento`
- **Já existe:** Manter como está
- **Submit:** Chama `POST /api/clientes/verificar-criar` + `POST /api/orcamentos/criar`

#### 2.2 Dashboard - Lista de Orçamentos
- **Rota:** `/dashboard/orcamentos`
- **Ação:** Lista todos, filtros por status

#### 2.3 Dashboard - Detalhes do Orçamento
- **Rota:** `/dashboard/orcamentos/:id`
- **Ações:**
  - Botão "Aprovar e Enviar Proposta" → Envia e-mail/WhatsApp
  - Botão "Alterar" → Abre modal com justificativa
  - Botão "Excluir" → Abre modal com justificativa
  - Botão "Criar Contrato" → Se status `accepted`
  - Botão "Enviar Link Pagamento" → Se contrato assinado

#### 2.4 Página de Aprovação (Pública)
- **Rota:** `/orcamento/aprovar/[token]`
- **Ação:** Chama API, redireciona para `/obrigado/aprovacao`

#### 2.5 Página Obrigado (Aprovação)
- **Rota:** `/obrigado/aprovacao`
- **Conteúdo:** Mensagem de agradecimento, próximos passos

#### 2.6 Página Assinar Contrato
- **Rota:** `/contrato/assinatura/[id]`
- **Ações:** Visualizar contrato, upload PDF assinado

#### 2.7 Página Obrigado (Contrato)
- **Rota:** `/contrato/obrigado`
- **Conteúdo:** Agradecimento, aguarde instruções

#### 2.8 Dashboard - Lista de Projetos
- **Rota:** `/dashboard/projetos`
- **Ações:** Lista, filtros, botão notificar evolução

#### 2.9 Dashboard - Detalhes do Projeto
- **Rota:** `/dashboard/projetos/:id`
- **Ações:** 
  - Ver contrato anexado
  - Botões de evolução (20%, 50%, 70%, 100%)
  - Botão "Enviar Pagamento Final" → Se 100%

#### 2.10 Página Agendar Entrega
- **Rota:** `/projetos/:id/agendar`
- **Formulário:** Data, hora, tipo (vídeo/áudio)

#### 2.11 Página Obrigado (Agendamento)
- **Rota:** `/projetos/:id/agendar/obrigado`
- **Conteúdo:** Confirmação, detalhes do agendamento

---

## 🚀 Ordem de Implementação

### Fase 1: APIs (Backend)
1. `POST /api/clientes/verificar-criar`
2. `POST /api/orcamentos/criar`
3. `GET /api/orcamentos`
4. `GET /api/orcamentos/:id`
5. `PUT /api/orcamentos/:id` (alterar com justificativa)
6. `DELETE /api/orcamentos/:id` (excluir com justificativa)
7. `PUT /api/orcamentos/:id/aprovar` (enviar proposta)
8. `GET /api/orcamentos/aprovar/:token` (aprovação pública)
9. `POST /api/orcamentos/:id/contrato`
10. `POST /api/contratos/:id/assinar`
11. `POST /api/orcamentos/:id/pagamento-entrada`
12. `POST /api/projetos/:id/notificar`
13. `POST /api/projetos/:id/pagamento-final`
14. `POST /api/projetos/:id/agendar`
15. `POST /api/webhooks/stripe` (atualizar)

### Fase 2: Frontend Dashboard
1. `/dashboard/orcamentos` (lista)
2. `/dashboard/orcamentos/:id` (detalhes completo)
3. `/dashboard/projetos` (lista)
4. `/dashboard/projetos/:id` (detalhes com evolução)

### Fase 3: Páginas Públicas
1. `/orcamento/aprovar/[token]`
2. `/obrigado/aprovacao`
3. `/contrato/assinatura/[id]`
4. `/contrato/obrigado`
5. `/projetos/[id]/agendar`
6. `/projetos/[id]/agendar/obrigado`

---

## 📝 Componentes UI Necessários

Todos já existem em `/src/components/ui/`:
- ✅ Button
- ✅ Card
- ✅ Dialog (modais)
- ✅ Input
- ✅ Label
- ✅ Select
- ✅ Textarea
- ✅ Toast (já configurado)

---

## 🔧 Configurações de Ambiente

```env
# E-mail (Resend)
RESEND_API_KEY=re_xxx

# Stripe
STRIPE_SECRET_KEY=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_xxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Better Auth
BETTER_AUTH_SECRET=xxx
```

---

## ✅ Checklist Final

- [ ] Todas as APIs implementadas
- [ ] Todas as páginas frontend criadas
- [ ] Toast em todos os feedbacks (sucesso/erro)
- [ ] Sem uso de Alert, apenas Toast
- [ ] Webhook Stripe configurado
- [ ] Teste de fluxo completo realizado
