# 🗄️ Configuração do Banco de Dados - SoftRha

Este guia explica como configurar o banco de dados MySQL com Prisma e Better Auth.

## 📋 Pré-requisitos

- MySQL 8.0+ instalado e rodando
- Node.js 18+
- npm ou pnpm

## 🚀 Passo a Passo

### 1. Criar Banco de Dados

Acesse o MySQL e crie o banco:

```sql
CREATE DATABASE softrha CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais:

```env
DATABASE_URL="mysql://root:sua-senha@localhost:3306/softrha"
BETTER_AUTH_SECRET="sua-secret-key-com-mais-de-32-caracteres"
```

### 3. Gerar Prisma Client

```bash
npx prisma generate
```

### 4. Executar Migrações (Criar Tabelas)

```bash
npx prisma migrate dev --name init
```

Isso irá:
- Criar a pasta `prisma/migrations`
- Executar as migrations no banco
- Criar todas as tabelas necessárias

### 5. (Opcional) Seed - Dados Iniciais

Se quiser adicionar dados de exemplo:

```bash
npx prisma db seed
```

## 🔐 Configurar Login Social (Opcional)

### Google OAuth

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto
3. Ative a Google+ API
4. Crie credenciais OAuth 2.0
5. Adicione o redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copie Client ID e Client Secret para o `.env`

### GitHub OAuth

1. Acesse [GitHub Developer Settings](https://github.com/settings/developers)
2. Crie um novo OAuth App
3. Homepage URL: `http://localhost:3000`
4. Callback URL: `http://localhost:3000/api/auth/callback/github`
5. Copie Client ID e Client Secret para o `.env`

## 📊 Estrutura do Banco

### Tabelas de Autenticação
- `users` - Usuários do sistema
- `accounts` - Contas OAuth (Google, GitHub)
- `sessions` - Sessões ativas
- `verification_tokens` - Tokens de verificação de email

### Tabelas de Negócio
- `projects` - Projetos dos clientes
- `tasks` - Tarefas dos projetos
- `milestones` - Marcos do projeto
- `budgets` - Orçamentos solicitados
- `contacts` - Contatos via formulário
- `comments` - Comentários nas tarefas
- `activities` - Log de atividades
- `settings` - Configurações do sistema

## 🔧 Comandos Úteis

```bash
# Ver status das migrations
npx prisma migrate status

# Resetar banco (cuidado: apaga todos os dados!)
npx prisma migrate reset

# Abrir Prisma Studio (GUI para banco)
npx prisma studio

# Formatar schema
npx prisma format

# Validar schema
npx prisma validate
```

## 🐛 Problemas Comuns

### Erro de Conexão
Verifique se o MySQL está rodando e as credenciais estão corretas.

### Tabelas não existem
Execute `npx prisma migrate dev` para criar as tabelas.

### Erro no generate
Delete `node_modules/.prisma` e execute `npx prisma generate` novamente.

## 📝 Script SQL Manual (Alternativo)

Se preferir criar as tabelas manualmente, execute o SQL gerado em `prisma/migrations/*/migration.sql`.

## 🔒 Segurança em Produção

- **Nunca** commit o arquivo `.env`
- Use uma `BETTER_AUTH_SECRET` forte e única
- Configure CORS adequadamente
- Use HTTPS em produção
- Restrinja acesso ao banco por IP

## 📞 Suporte

Em caso de dúvidas, consulte:
- [Docs Prisma](https://www.prisma.io/docs)
- [Better Auth Docs](https://www.better-auth.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
