# ⚡ Guia Rápido de Configuração - SoftRha 2.0

## 🚀 Início Rápido

Siga estes passos para configurar o projeto pela primeira vez:

### 1️⃣ Instalar dependências
```bash
npm install
```

### 2️⃣ Configurar banco de dados

**Opção A: MySQL Local**

1. Crie o banco no MySQL:
```sql
CREATE DATABASE softrha CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Edite o `.env`:
```env
DATABASE_URL="mysql://root:SUA_SENHA@localhost:3306/softrha"
BETTER_AUTH_SECRET="sua-secret-key-com-32-caracteres-minimo"
```

3. Gere e aplique o Prisma:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. Popule com dados de exemplo:
```bash
npm run db:seed
```

**Opção B: Usar SQLite (apenas desenvolvimento)**

Se não quiser instalar MySQL, mude no `.env`:
```env
DATABASE_URL="file:./dev.db"
```

E no `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

Depois:
```bash
npx prisma generate
npx prisma db push
```

### 3️⃣ Rodar o projeto
```bash
npm run dev
```

Acesse: http://localhost:3000

---

## 🔑 Credenciais de Teste (após seed)

| Email | Senha | Role |
|-------|-------|------|
| admin@softrha.com | admin123 | Admin |
| usuario@softrha.com | admin123 | User |

---

## 📚 Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build produção
npm run build

# Start produção
npm run start

# Banco de dados
npm run db:generate    # Gerar Prisma Client
npm run db:migrate     # Criar migration
npm run db:seed        # Popular banco
npm run db:studio      # Abrir GUI do Prisma
npm run db:reset       # Resetar banco
```

---

## 🗺️ Rotas do Sistema

| Rota | Descrição | Protegida |
|------|-----------|-----------|
| `/` | Home | ❌ |
| `/sobre` | Sobre | ❌ |
| `/servicos` | Serviços | ❌ |
| `/orcamento` | Calculadora | ❌ |
| `/contato` | Contato | ❌ |
| `/login` | Login | ❌ |
| `/dashboard` | Dashboard | ✅ |

---

## 🔧 Configuração OAuth (Opcional)

Para habilitar login com Google/GitHub:

1. **Google:**
   - https://console.cloud.google.com/
   - Redirect: `http://localhost:3000/api/auth/callback/google`

2. **GitHub:**
   - https://github.com/settings/developers
   - Callback: `http://localhost:3000/api/auth/callback/github`

Adicione no `.env`:
```env
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
```

---

## 🐛 Problemas Comuns

### Erro: "Can't connect to MySQL server"
- Verifique se o MySQL está rodando
- Confira usuário e senha no `.env`
- Teste: `mysql -u root -p`

### Erro: "Table doesn't exist"
- Rode: `npm run db:migrate`

### Erro: "Prisma Client not generated"
- Rode: `npm run db:generate`

### Login não funciona
- Verifique se o Better Auth está configurado
- Confira `BETTER_AUTH_SECRET` no `.env`
- Rode o seed novamente: `npm run db:seed`

---

## 📦 Estrutura de Arquivos

```
softrha-2.0/
├── prisma/
│   ├── schema.prisma      # Modelo do banco
│   ├── seed.ts            # Dados de exemplo
│   └── migrations/        # Migrations
├── src/
│   ├── app/               # Páginas e rotas
│   ├── components/        # Componentes React
│   ├── hooks/             # Hooks personalizados
│   ├── lib/               # Utils (prisma, auth)
│   └── middleware.ts      # Proteção de rotas
├── .env                   # Variáveis de ambiente
├── .env.example           # Exemplo de .env
├── DATABASE_SETUP.md      # Guia completo do banco
└── package.json
```

---

## 🎯 Próximos Passos

1. ✅ Configurar banco de dados
2. ✅ Rodar migrations
3. ✅ Popular com seed
4. ✅ Testar login
5. ✅ Acessar dashboard
6. 📝 Personalizar conteúdo
7. 🎨 Ajustar cores/tema
8. 🚀 Fazer deploy

---

**Dúvidas?** Consulte [DATABASE_SETUP.md](./DATABASE_SETUP.md) para detalhes completos.
