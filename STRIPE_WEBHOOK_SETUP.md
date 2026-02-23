# ⚙️ Configuração do Stripe Webhook

## ✅ Chaves Configuradas
Suas chaves de teste foram salvas no `.env.local`:
- **Publishable Key**: `pk_test_51T3LDOAk8p6CzYYS...`
- **Secret Key**: `sk_test_51T3LDOAk8p6CzYYS...`

## 🔔 Configurar Webhook Secret

### Opção 1: Stripe CLI (Recomendado para Desenvolvimento)

1. **Instale a Stripe CLI**:
   ```bash
   # Windows (Chocolatey)
   choco install stripe-cli

   # Ou baixe em: https://github.com/stripe/stripe-cli/releases
   ```

2. **Faça login**:
   ```bash
   stripe login
   ```

3. **Encaminhe os eventos**:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. **Copie o webhook secret** que será exibido (começa com `whsec_`)

5. **Adicione no `.env.local`**:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### Opção 2: Dashboard do Stripe (Para Produção)

1. Acesse https://dashboard.stripe.com/test/webhooks

2. Clique em **"Add endpoint"**

3. Configure:
   - **Endpoint URL**: `https://seu-domínio.com/api/webhooks/stripe`
   - **Events to send**:
     - ✅ `checkout.session.completed`
     - ✅ `payment_link.completed`

4. Copie o **Signing secret**

5. Adicione no `.env.local`

## 🧪 Testar o Fluxo

1. **Inicie o servidor**:
   ```bash
   npm run dev
   ```

2. **Inicie o Stripe CLI** (em outro terminal):
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

3. **Acesse um orçamento aceito** → Inicie o projeto

4. **Gere o link de pagamento**

5. **Pague com cartão de teste**:
   - Número: `4242 4242 4242 4242`
   - Validade: Qualquer data futura
   - CVC: Qualquer número (ex: 123)
   - CEP: 00000-000

6. **Verifique**:
   - No console: Logs do webhook
   - No banco: `Payment.status` muda para `paid`
   - No projeto: `Project.status` muda para `planning`

## 📋 Eventos do Webhook

O webhook escuta:
- `checkout.session.completed` - Pagamento completado
- `payment_link.completed` - Link de pagamento usado

## 🚨 Importante

- **NUNCA** commit as chaves do Stripe no Git
- O `.env.local` já está no `.gitignore`
- Use apenas chaves de **teste** em desenvolvimento
- Para produção, use chaves **live** (começam com `sk_live_`)

## 📞 Suporte

Em caso de erros:
1. Verifique os logs no console
2. Teste com `stripe trigger checkout.session.completed`
3. Consulte: https://stripe.com/docs/webhooks
