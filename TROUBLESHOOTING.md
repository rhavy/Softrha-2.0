# 🔧 Troubleshooting - SoftRha 2.0

## Erro: "Failed to get session"

### Causas Possíveis:
1. Cookie de sessão corrompido
2. Secret key inválida
3. Banco de dados não configurado
4. Cache do Next.js desatualizado

### Soluções:

#### 1. Limpar Cookies e Cache
- No navegador, limpe os cookies de `localhost:3000`
- Ou use aba anônima para testar

#### 2. Verificar .env
```env
BETTER_AUTH_SECRET="sua-secret-key-com-mais-de-32-caracteres"
BETTER_AUTH_URL="http://localhost:3000"
DATABASE_URL="file:./dev.db"
```

#### 3. Regenerar Secret Key
Gere uma nova secret:
```bash
# PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Ou use qualquer string com 32+ caracteres
```

#### 4. Limpar Cache do Next.js
```bash
# Pare o servidor
# Delete a pasta .next
rm -r .next

# Rode novamente
npm run dev
```

#### 5. Resetar Banco de Dados
```bash
npm run db:reset
```

#### 6. Verificar se Prisma Client está gerado
```bash
npx prisma generate
```

---

## Erro: "Authentication failed against database"

### Solução:
Verifique se o banco de dados existe e as credenciais estão corretas no `.env`.

Para SQLite, certifique-se que o arquivo `prisma/dev.db` existe.

---

## Erro: "Table doesn't exist"

### Solução:
```bash
npx prisma db push
npm run db:seed
```

---

## Erro: "Module not found"

### Solução:
```bash
# Limpar node_modules e reinstalar
rm -r node_modules
npm install
npx prisma generate
```

---

## Login não funciona

1. Verifique se o seed foi executado: `npm run db:seed`
2. Confira as credenciais no console
3. Tente criar um novo usuário via API

---

## Dashboard não carrega

1. Verifique o middleware em `src/middleware.ts`
2. Confira os logs no console do navegador (F12)
3. Limpe cookies e cache

---

## Comandos de Recuperação

```bash
# Reset completo
npm run db:reset
npm run db:seed
rm -r .next
npm run dev

# Verificar status do banco
npm run db:studio

# Gerar Prisma Client
npm run db:generate

# Aplicar migrations
npm run db:migrate
```

---

## Logs e Debug

### Ver logs do Better Auth:
No `src/lib/auth.ts`, adicione:
```ts
debug: true,
```

### Ver logs do Prisma:
No `src/lib/prisma.ts`, mude para:
```ts
log: ['query', 'info', 'warn', 'error'],
```

---

## Contate o Suporte

Se nenhum dos passos acima resolver, verifique:
- Versão do Node.js (mínimo 18)
- Versão do npm (atualize com `npm install -g npm`)
- Permissões de arquivo/pasta
