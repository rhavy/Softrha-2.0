# 🔧 Debug: Botões "Ver Projeto" / "Iniciar Projeto"

## Problema Relatado
Botões não aparecem após pagamento de 25%.

---

## ✅ Correções Implementadas

### 1. API Retorna Campo `confirmed` do Contrato

**Arquivo:** `src/app/api/orcamentos/[id]/route.ts`

**Antes:**
```typescript
contract: true,
```

**Depois:**
```typescript
contract: {
  select: {
    id: true,
    status: true,
    confirmed: true,  // ✅ Campo adicionado
    signedAt: true,
    documentUrl: true,
    content: true,
  },
},
```

---

### 2. Logs de Debug no Frontend

**Arquivo:** `src/app/dashboard/orcamentos/[id]/page.tsx`

**Adicionado:**
```typescript
console.log("[DEBUG] Budget recebido:", {
  id: data.id,
  status: data.status,
  projectId: data.projectId,  // ✅ Verificar se está vindo
  contract: data.contract?.id,
  contractConfirmed: data.contract?.confirmed,
});

console.log("[DEBUG] Status é down_payment_paid, projectId:", data.projectId);
```

---

### 3. Webhook Garante Status na Atualização Final

**Arquivo:** `src/app/api/webhooks/stripe/route.ts`

**Antes:**
```typescript
await prisma.budget.update({
  where: { id: budget.id },
  data: {
    projectId: project.id,
  },
});
```

**Depois:**
```typescript
await prisma.budget.update({
  where: { id: budget.id },
  data: {
    projectId: project.id,
    status: "down_payment_paid",  // ✅ Garante status correto
  },
});
```

**Logs adicionais:**
```typescript
console.log(`[Webhook] === DADOS FINAIS DO BUDGET ===`, {
  budgetId: updatedBudgetWithProject.id,
  status: updatedBudgetWithProject.status,
  projectId: updatedBudgetWithProject.projectId,
  projetoCriadoId: project.id,
  projetoCriadoNome: project.name,
});
```

---

## 🔍 Como Debugar

### 1. Abrir Console do Navegador

**Página:** `/dashboard/orcamentos/[id]`

**Ação:** Pressione F12 → Console

---

### 2. Verificar Logs do FetchBudget

**Logs esperados após pagamento:**
```
[DEBUG] Budget recebido: {
  id: "budget_123",
  status: "down_payment_paid",  // ✅ Deve ser este
  projectId: "proj_456",        // ✅ Deve ter ID
  contract: "contract_789",
  contractConfirmed: true
}

[DEBUG] Status é down_payment_paid, projectId: proj_456
```

---

### 3. Verificar Logs do Webhook (Backend)

**Console do servidor** ou **Stripe CLI**

**Logs esperados:**
```
[Webhook] === INICIO handleDownPayment ===
[Webhook] Processando pagamento de entrada para orçamento budget_123
[Webhook] Orçamento atualizado: {
  id: "budget_123",
  status: "down_payment_paid",
  projectId: null  // ⚠️ Temporariamente null
}
[Webhook] === PROJETO CRIADO ===
[Webhook] Projeto proj_456 criado
[Webhook] Orçamento atualizado com projectId: {
  id: "budget_123",
  status: "down_payment_paid",
  projectId: "proj_456"  // ✅ Agora tem projectId
}
[Webhook] === DADOS FINAIS DO BUDGET === {
  budgetId: "budget_123",
  status: "down_payment_paid",
  projectId: "proj_456",
  projetoCriadoId: "proj_456",
  projetoCriadoNome: "web - João Silva"
}
```

---

## 🧪 Teste Passo a Passo

### 1. Gerar Link de Pagamento

**Página:** `/dashboard/orcamentos/[id]`

**Status:** `contract_signed` + `contract.confirmed = true`

**Ação:** Clicar em "Enviar Link Pagamento (25%)"

---

### 2. Pagar no Stripe

**Link:** Recebido por e-mail/WhatsApp

**Cartão de teste:**
- Número: `4242 4242 4242 4242`
- Validade: 12/30
- CVC: 123
- CEP: 00000-000

---

### 3. Verificar Webhook

**Stripe CLI:**
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**Logs esperados:** Ver seção "Logs do Webhook" acima

---

### 4. Verificar Frontend

**Página:** `/dashboard/orcamentos/[id]`

**Console do Navegador:** Ver logs do `fetchBudget`

**Botões esperados:**

**Se projeto criado (projectId !== null):**
```
[Ver Projeto]
```

**Se projeto NÃO criado (projectId === null):**
```
[Iniciar Projeto]
```

---

## 🐛 Problemas Comuns

### Problema 1: `projectId: null` no Console

**Sintoma:**
```
[DEBUG] Budget recebido: {
  status: "down_payment_paid",
  projectId: null  // ❌ Problema!
}
```

**Causa:** Webhook não criou o projeto ou falhou ao atualizar

**Solução:**
1. Verificar logs do webhook
2. Verificar se Stripe CLI está rodando
3. Verificar se `STRIPE_WEBHOOK_SECRET` está correta no `.env`

---

### Problema 2: Status Não Atualiza

**Sintoma:**
```
[DEBUG] Budget recebido: {
  status: "down_payment_sent",  // ❌ Deveria ser down_payment_paid
  projectId: null
}
```

**Causa:** Webhook não processou o pagamento

**Solução:**
1. Verificar logs do Stripe Dashboard
2. Verificar se evento `checkout.session.completed` foi disparado
3. Testar webhook manualmente:
   ```bash
   stripe trigger checkout.session.completed
   ```

---

### Problema 3: Botões Não Aparecem

**Sintoma:** Status correto, projectId correto, mas botões não aparecem

**Verificação:**
```typescript
// Verificar se condição está correta
{budget.status === "down_payment_paid" && (
  <>
    {budget.projectId ? (
      <Button>Ver Projeto</Button>
    ) : (
      <Button>Iniciar Projeto</Button>
    )}
  </>
)}
```

**Solução:**
1. Verificar se `budget` não é null
2. Verificar se `budget.status === "down_payment_paid"`
3. Verificar se `budget.projectId` é string ou null

---

## 📊 Estados Esperados

### Antes do Pagamento
```json
{
  "status": "contract_signed",
  "projectId": null,
  "contract": {
    "confirmed": true
  }
}
```

**Botões:**
```
[Ver Contrato Confirmado ✓] [Enviar Link Pagamento (25%)]
```

---

### Após Pagamento (Projeto Criado)
```json
{
  "status": "down_payment_paid",
  "projectId": "proj_456",  // ✅ String
  "contract": {
    "confirmed": true
  }
}
```

**Botões:**
```
[Ver Projeto]
```

---

### Após Pagamento (Projeto NÃO Criado - Fallback)
```json
{
  "status": "down_payment_paid",
  "projectId": null,  // ⚠️ null (webhook falhou)
  "contract": {
    "confirmed": true
  }
}
```

**Botões:**
```
[Iniciar Projeto]
```

---

## 🔧 Comandos Úteis

### 1. Verificar Banco de Dados
```bash
npx prisma studio
```

**Query para verificar budget:**
```sql
SELECT id, status, projectId, clientName 
FROM budgets 
WHERE id = 'budget_123';
```

---

### 2. Testar Webhook Localmente
```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger checkout.session.completed
```

---

### 3. Limpar Cache do Next.js
```bash
rm -rf .next
npm run build
```

---

## ✅ Checklist de Verificação

- [ ] Stripe CLI está rodando
- [ ] `STRIPE_WEBHOOK_SECRET` está no `.env`
- [ ] Webhook recebe evento `checkout.session.completed`
- [ ] Webhook cria projeto (log: "PROJETO CRIADO")
- [ ] Webhook atualiza budget com projectId
- [ ] Frontend recebe budget com `status: "down_payment_paid"`
- [ ] Frontend recebe budget com `projectId: "proj_..."`
- [ ] Console mostra logs do `fetchBudget`
- [ ] Botão "Ver Projeto" ou "Iniciar Projeto" aparece

---

## 📝 Próximos Passos

Se após seguir este guia os botões ainda não aparecerem:

1. **Coletar logs:**
   - Console do navegador (F12)
   - Logs do webhook (Stripe CLI ou servidor)
   - Dados do banco (Prisma Studio)

2. **Verificar condições:**
   ```javascript
   console.log("budget:", budget);
   console.log("status === down_payment_paid:", budget?.status === "down_payment_paid");
   console.log("projectId:", budget?.projectId);
   console.log("projectId !== null:", budget?.projectId !== null);
   ```

3. **Testar manualmente no banco:**
   ```sql
   -- Verificar budget
   SELECT * FROM budgets WHERE id = 'budget_123';
   
   -- Verificar projeto
   SELECT * FROM projects WHERE clientId = (SELECT clientId FROM budgets WHERE id = 'budget_123');
   
   -- Se projeto existe mas projectId está null, atualizar manualmente
   UPDATE budgets 
   SET projectId = 'proj_456' 
   WHERE id = 'budget_123' AND projectId IS NULL;
   ```

---

## 🎯 Resumo

**O que foi corrigido:**
1. ✅ API retorna campo `confirmed` do contrato
2. ✅ Logs de debug no frontend
3. ✅ Webhook garante status na atualização final
4. ✅ Logs detalhados no webhook

**Como testar:**
1. Pagar com cartão de teste
2. Verificar logs do webhook
3. Verificar console do navegador
4. Verificar botões na página

**Resultado esperado:**
- Status: `down_payment_paid`
- projectId: `proj_...` (string)
- Botão: "Ver Projeto" ou "Iniciar Projeto" visível
