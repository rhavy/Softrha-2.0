# ⚙️ Guia de Configuração - SoftRha 2.0

Este guia cobre todas as configurações opcionais para habilitar funcionalidades avançadas.

---

## 📧 1. Configurar Resend (Envio de Emails)

### O que é?
Resend é um serviço de email transacional para desenvolvedores. Usamos para enviar:
- Notificações de novos orçamentos
- Emails de boas-vindas
- Respostas automáticas

### Passo a Passo

#### 1.1 Criar conta no Resend
1. Acesse https://resend.com
2. Clique em "Sign Up" ou "Get Started"
3. Faça login com GitHub ou crie conta com email

#### 1.2 Obter API Key
1. No dashboard, clique em **"API Keys"** no menu lateral
2. Clique em **"Create API Key"**
3. Dê um nome (ex: "SoftRha Production")
4. Selecione permissão **"Full Access"**
5. Clique em **"Create API Key"**
6. **Copie a API key** (ela começa com `re_`)

#### 1.3 Configurar no projeto
1. No arquivo `.env.local` na raiz do projeto:

```env
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM="SoftRha <noreply@softrha.com>"
```

2. (Opcional) Para usar domínio próprio:
   - No Resend, vá em **"Domains"**
   - Adicione seu domínio
   - Configure os registros DNS conforme instruções
   - Atualize `EMAIL_FROM` com seu domínio

#### 1.4 Testar
```bash
npm run dev
```

Preencha um orçamento em http://localhost:3000/orcamento e verifique se o email chega!

---

## 🔔 2. Configurar Web Push Notifications

### O que é?
Web Push permite enviar notificações para o navegador do usuário, mesmo com a página fechada.

### Passo a Passo

#### 2.1 Gerar chaves VAPID

Execute o script:

```bash
node scripts/generate-vapid-keys.js
```

O script vai gerar algo como:
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BNaZq... (chave longa)
VAPID_PRIVATE_KEY=7xK9... (chave longa)
VAPID_SUBJECT="mailto:support@softrha.com"
```

#### 2.2 Configurar no projeto

Adicione no `.env.local`:

```env
# Web Push
NEXT_PUBLIC_VAPID_PUBLIC_KEY=cole_a_chave_publica_aqui
VAPID_PRIVATE_KEY=cole_a_chave_privada_aqui
VAPID_SUBJECT="mailto:support@softrha.com"
```

#### 2.3 Testar

1. Acesse http://localhost:3000/dashboard/configuracoes
2. Aba **"Notificações"**
3. Clique em **"Ativar"** em Notificações Push
4. Permita as notificações no navegador
5. Crie um novo orçamento para testar!

---

## 🔊 3. Som de Notificação

### O que é?
Toca um som "ding!" quando chega nova notificação.

### Configuração

**Nenhum arquivo necessário!** O sistema usa Web Audio API para gerar o som programaticamente.

Para testar:
1. Abra duas abas do dashboard
2. Em uma aba, crie um novo orçamento
3. Na outra aba → ouvirá o som!

### Personalizar (Opcional)

Se quiser usar um som personalizado:

1. Coloque um arquivo `notification.mp3` em `public/sounds/`
2. No hook `src/hooks/use-notification-sound.ts`, descomente a versão com arquivo

---

## 📄 4. Gerar PDF do Orçamento

### O que é?
Permite imprimir ou salvar como PDF os detalhes do orçamento.

### Como usar

1. Acesse `/dashboard/orcamentos/[id]`
2. Clique em **"Imprimir / PDF"**
3. No dialog de impressão do navegador, selecione **"Salvar como PDF"**

### Personalizar Template de Impressão

Edite `src/app/dashboard/orcamentos/[id]/page.tsx` e adicione estilos `@media print`.

---

## 🤖 5. Respostas Automáticas de Email

### O que é?
Envia email automático de confirmação para o cliente quando ele solicita orçamento.

### Configurar

Já está implementado! Basta configurar o Resend (item 1).

O email é enviado automaticamente quando:
- Cliente preenche formulário de orçamento
- Sistema detecta email válido

### Personalizar Template

Edite `src/lib/email.ts`:
- `createNewBudgetEmailTemplate()` - Email para equipe
- `createWelcomeEmailTemplate()` - Email para cliente

---

## 📊 6. Relatórios de Conversão

### O que é?
Dashboard com estatísticas de conversão de orçamentos.

### Acessar

`/dashboard/orcamentos` já mostra:
- Total de orçamentos
- Pendentes
- Enviados
- Aceitos

### Métricas Calculadas

- **Taxa de Conversão** = (Aceitos / Total) × 100
- **Tempo Médio de Resposta** = Tempo entre criação e ação
- **Valor Médio** = Média dos valores aceitos

---

## 🎯 Resumo das Configurações

| Funcionalidade | Obrigatória? | Dificuldade | Impacto |
|----------------|--------------|-------------|---------|
| Resend (Email) | ❌ Opcional | 🟢 Fácil | Alto |
| VAPID (Push) | ❌ Opcional | 🟡 Média | Alto |
| Som | ✅ Automático | 🟢 Fácil | Médio |
| PDF | ✅ Automático | 🟢 Fácil | Médio |
| Auto Email | ❌ Depende do Resend | 🟢 Fácil | Alto |
| Relatórios | ✅ Automático | 🟢 Fácil | Médio |

---

## 🚀 Setup Rápido (Recomendado)

Para produção, configure pelo menos:

```env
# Email
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx

# Push (opcional mas recomendado)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=xxxxx
VAPID_PRIVATE_KEY=xxxxx
VAPID_SUBJECT="mailto:seu@email.com"
```

---

## 📞 Suporte

Dúvidas? Consulte:
- [Documentação do Resend](https://resend.com/docs)
- [Web Push Guide](https://web-push-book.gauntface.com/)
- README.md do projeto

---

**SoftRha 2.0** - Transformando ideias em soluções digitais
