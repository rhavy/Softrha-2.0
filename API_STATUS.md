# ✅ Status Atual das APIs

## ✅ APIs que JÁ existem e funcionam:
- [x] `POST /api/clientes/verificar` - Verifica/cria cliente
- [x] `POST /api/orcamentos/criar` - Cria orçamento (precisa de ajuste para clientId)
- [x] `GET /api/orcamentos` - Lista orçamentos
- [x] `GET /api/orcamentos/:id` - Detalhes do orçamento
- [x] `PUT /api/orcamentos/:id` - Atualiza orçamento
- [x] `DELETE /api/orcamentos/:id` - Exclui orçamento
- [x] `POST /api/orcamentos/:id/pagamento` - Gera link pagamento
- [x] `POST /api/orcamentos/:id/iniciar-projeto` - Inicia projeto
- [x] `GET /api/projetos` - Lista projetos
- [x] `POST /api/projetos` - Cria projeto
- [x] `PUT /api/projetos/:id` - Atualiza projeto
- [x] `DELETE /api/projetos/:id` - Exclui projeto

## ⚠️ APIs que PRECISAM ser criadas/atualizadas:

### 1. Atualizar `POST /api/orcamentos/criar`
**O que falta:**
- Receber `clientId` como parâmetro
- Gerar `approvalToken` automaticamente
- Definir `approvalTokenExpires` (7 dias)

### 2. Criar `PUT /api/orcamentos/:id/aprovar`
**Propósito:** Gestor aprova e envia proposta para cliente
**Ações:**
- Atualiza status para `sent`
- Gera/atualiza approvalToken
- Envia e-mail com link de aprovação
- Opcional: Envia WhatsApp

### 3. Criar `GET /api/orcamentos/aprovar/:token`
**Propósito:** Cliente aprova orçamento via link
**Ações:**
- Valida token
- Verifica expiração
- Atualiza status para `user_approved`
- Define `userApprovedAt`
- Invalida token
- Retorna sucesso para redirect

### 4. Criar `POST /api/orcamentos/:id/contrato`
**Propósito:** Gestor cria contrato
**Ações:**
- Gera contrato com dados do orçamento
- Envia e-mail/WhatsApp para cliente
- Atualiza status para `contract_sent`

### 5. Criar `POST /api/contratos/:id/assinar`
**Propósito:** Cliente faz upload do contrato assinado
**Ações:**
- Receive PDF
- Salva arquivo
- Atualiza status para `signed_by_client`

### 6. Criar `POST /api/projetos/:id/notificar`
**Propósito:** Gestor notifica evolução do projeto
**Ações:**
- Recebe progresso (20/50/70/100)
- Atualiza status do projeto
- Envia e-mail/WhatsApp para cliente

### 7. Criar `POST /api/projetos/:id/pagamento-final`
**Propósito:** Gestor envia link de pagamento final (75%)
**Ações:**
- Gera link Stripe (75% do valor)
- Envia e-mail/WhatsApp
- Atualiza status para `final_payment_sent`

### 8. Criar `POST /api/projetos/:id/agendar`
**Propósito:** Cliente agenda entrega
**Ações:**
- Recebe data, hora, tipo (video/audio)
- Cria schedule
- Envia confirmação

### 9. Atualizar `POST /api/webhooks/stripe`
**O que falta:**
- Handler para `down_payment` → Cria projeto
- Handler para `final_payment` → Completa projeto

---

## 📝 Prioridade de Implementação

### Alta Prioridade (Fluxo Básico)
1. Atualizar `POST /api/orcamentos/criar` (clientId + token)
2. Criar `GET /api/orcamentos/aprovar/:token`
3. Criar `PUT /api/orcamentos/:id/aprovar`

### Média Prioridade (Contrato e Pagamento)
4. Criar `POST /api/orcamentos/:id/contrato`
5. Criar `POST /api/contratos/:id/assinar`
6. Criar `POST /api/orcamentos/:id/pagamento-entrada`
7. Atualizar webhook Stripe

### Baixa Prioridade (Projeto e Entrega)
8. Criar `POST /api/projetos/:id/notificar`
9. Criar `POST /api/projetos/:id/pagamento-final`
10. Criar `POST /api/projetos/:id/agendar`
