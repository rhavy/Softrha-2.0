# 💼 SoftRha 2.0

Plataforma de desenvolvimento de software de alta performance, especializada em Next.js, TypeScript e Tailwind CSS.

## 🚀 Tecnologias

- **Framework:** Next.js 16 (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS v4
- **Componentes:** shadcn/ui + Radix UI
- **Animações:** Framer Motion
- **Banco de Dados:** MySQL
- **ORM:** Prisma 6
- **Autenticação:** Better Auth
- **Ícones:** Lucide React

## 📄 Páginas

| Página | Rota | Descrição |
|--------|------|-----------|
| Home | `/` | Landing page com serviços e CTAs |
| Sobre | `/sobre` | Informações da empresa |
| Serviços | `/servicos` | Detalhamento dos serviços |
| Orçamento | `/orcamento` | Calculadora interativa de orçamentos |
| Contato | `/contato` | Formulário de contato |
| Login | `/login` | Autenticação de usuários |
| Dashboard | `/dashboard` | Área administrativa protegida |

## 🛠️ Instalação

### 1. Clone o repositório

```bash
git clone <repository-url>
cd softrha-2.0
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o banco de dados

Siga o guia em [DATABASE_SETUP.md](./DATABASE_SETUP.md) para configurar MySQL, Prisma e Better Auth.

Resumo rápido:

```bash
# Copie e edite o .env
cp .env.example .env

# Gere o Prisma Client
npx prisma generate

# Execute as migrations
npx prisma migrate dev --name init
```

### 4. Rode o projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## 📁 Estrutura do Projeto

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # API Routes
│   │   ├── auth/           # Better Auth endpoints
│   │   └── orcamento/      # API de orçamentos
│   ├── contato/            # Página de contato
│   ├── dashboard/          # Dashboard protegido
│   ├── login/              # Página de login
│   ├── orcamento/          # Calculadora de orçamento
│   ├── servicos/           # Página de serviços
│   ├── sobre/              # Página sobre
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/
│   ├── layout/             # Header, Footer, etc.
│   └── ui/                 # Componentes shadcn/ui
├── hooks/                  # React Hooks (use-auth)
├── lib/                    # Utils, Prisma, Auth config
└── middleware.ts           # Proteção de rotas
```

## 🔐 Autenticação

O sistema usa **Better Auth** com suporte a:

- ✅ Email e senha
- ✅ Google OAuth
- ✅ GitHub OAuth
- ✅ Sessions persistentes
- ✅ Middleware de proteção

### Registrar primeiro usuário

Após configurar o banco, acesse `/login` e crie uma conta. O primeiro usuário pode ser promovido a admin manualmente no banco:

```sql
UPDATE users SET role = 'admin' WHERE email = 'seu@email.com';
```

## 📊 Banco de Dados

### Principais Modelos

- **User** - Usuários e administradores
- **Project** - Projetos dos clientes
- **Task** - Tarefas dos projetos
- **Budget** - Orçamentos calculados
- **Contact** - Mensagens de contato
- **Activity** - Log de atividades

### Comandos Prisma

```bash
# Abrir Prisma Studio
npx prisma studio

# Criar nova migration
npx prisma migrate dev --name <nome>

# Resetar banco
npx prisma migrate reset

# Gerar Prisma Client
npx prisma generate
```

## 🎨 Personalização

### Tema de Cores

Edite `src/app/globals.css` para alterar as variáveis de cor do tema azul:

```css
:root {
  --primary: oklch(0.55 0.25 260);
  /* ... outras cores */
}
```

### Componentes UI

Os componentes estão em `src/components/ui/`. Para adicionar novos:

```bash
npx shadcn-ui@latest add <componente>
```

## 🔧 Scripts

```bash
npm run dev      # Desenvolvimento
npm run build    # Build de produção
npm run start    # Start em produção
npm run lint     # ESLint
```

## 📝 Variáveis de Ambiente

```env
# Banco de Dados
DATABASE_URL="mysql://root:senha@localhost:3306/softrha"

# Better Auth
BETTER_AUTH_SECRET="sua-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

# OAuth (opcional)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
```

## 🚀 Deploy

### Vercel

```bash
vercel deploy
```

Lembre-se de configurar as variáveis de ambiente no painel da Vercel.

### Database em Produção

Use um serviço gerenciado:
- [PlanetScale](https://planetscale.com/) (MySQL serverless)
- [Railway](https://railway.app/)
- [Supabase](https://supabase.com/)

## 📄 Licença

Este projeto é propriedade da SoftRha.

## 👥 Contribuição

Para contribuir, entre em contato com a equipe.

---

**SoftRha** - Transformando ideias em soluções digitais de alta performance.
