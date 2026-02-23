# Configuração do Stripe para Pagamentos

## 1. Criar conta no Stripe
1. Acesse https://stripe.com/br
2. Crie uma conta gratuita
3. Acesse o Dashboard

## 2. Obter as Chaves da API

### Chaves de Teste
1. No Dashboard, vá em **Developers** → **API keys**
2. Copie as chaves de teste (começam com `sk_test_` e `pk_test_`)

### Variáveis de Ambiente
Adicione no seu `.env.local`:
```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 3. Configurar Webhook

### No Dashboard do Stripe:
1. Vá em **Developers** → **Webhooks**
2. Clique em **Add endpoint**
3. Configure:
   - **Endpoint URL**: `https://seu-domínio.com/api/webhooks/stripe`
   - **Events to send**:
     - `checkout.session.completed`
     - `payment_link.completed`
   - **API version**: Use a mais recente

4. Copie o **Signing secret** gerado
5. Adicione no `.env.local` como `STRIPE_WEBHOOK_SECRET=whsec_...`

### Teste Local (ngrok):
```bash
# Instale o ngrok
ngrok http 3000

# Use a URL gerada no webhook do Stripe
https://xxxx-xxxx.ngrok.io/api/webhooks/stripe
```

## 4. Testar o Fluxo

### Fluxo Completo:
1. **Aceitar Orçamento** → Status muda para `accepted`
2. **Iniciar Projeto** → Projeto criado com status `waiting_payment`
3. **Gerar Link de Pagamento** → Link Stripe criado
4. **Enviar para Cliente** → Email com link
5. **Cliente Paga** → Stripe processa pagamento
6. **Webhook Confirma** → Projeto muda para `planning`
7. **Produção Inicia** → Status atualizado automaticamente

### Teste com Cartões do Stripe:
Use os cartões de teste:
- **Sucesso**: `4242 4242 4242 4242`
- **Recusado**: `4000 0000 0000 0002`
- **PIX**: Selecione PIX no checkout

## 5. Modelo Payment

O sistema cria automaticamente:
- **Payment** com:
  - `amount`: 25% do valor do projeto
  - `type`: `down_payment`
  - `status`: `pending` → `paid` (após confirmação)
  - `stripePaymentLinkId`: ID do link Stripe
  - `paidAt`: Data do pagamento

## 6. Status do Projeto

| Status | Descrição |
|--------|-----------|
| `waiting_payment` | Aguardando pagamento da entrada |
| `planning` | Pagamento confirmado, produção pode iniciar |
| `development` | Em desenvolvimento |
| `completed` | Concluído |

## 7. URLs Importantes

- **Link de Pagamento**: Redireciona para `/pagamento/sucesso`
- **Webhook**: `/api/webhooks/stripe`
- **Gerar Link**: `POST /api/orcamentos/[id]/pagamento`

## 8. Produção

Para produção:
1. Ative o modo **Live** no Stripe
2. Use as chaves **Live** (começam com `sk_live_` e `pk_live_`)
3. Configure o webhook com a URL de produção
4. Teste com pagamentos reais de valor mínimo
