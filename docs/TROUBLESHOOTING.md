# Troubleshooting Guide
## Sistema de Produtividade e Gestão Financeira

**Versão:** 1.0  
**Data:** Janeiro 2026  
**Autor:** Manus AI

---

## Sumário

Este guia documenta problemas comuns encontrados durante desenvolvimento, deploy e operação do sistema, com soluções testadas e validadas.

---

## Índice

1. [Problemas de Autenticação](#problemas-de-autenticação)
2. [Erros de Query SQL](#erros-de-query-sql)
3. [Problemas de Build e Deploy](#problemas-de-build-e-deploy)
4. [Erros de Git e GitHub](#erros-de-git-e-github)
5. [Problemas de Ambiente](#problemas-de-ambiente)
6. [Erros de TypeScript](#erros-de-typescript)
7. [Problemas de WebSocket](#problemas-de-websocket)
8. [Performance e Otimização](#performance-e-otimização)

---

## Problemas de Autenticação

### 1. "Invalid credentials" no Team Login

**Sintoma:**
```
Failed query: select `id`, `createdByUserId`, ... from `managed_users` where `managed_users`.`email` = ? limit ? 
params: teste@teste.com,1
```

**Causa Raiz:**
Incompatibilidade entre camelCase (código) e snake_case (banco de dados). O Drizzle ORM gera queries com nomes de colunas em camelCase, mas o MySQL espera snake_case.

**Solução Implementada:**

1. **Fallback SQL em `getManagedUserByEmail`:**
```typescript
export async function getManagedUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    // Tentar Drizzle primeiro
    const result = await db.select().from(managedUsers)
      .where(eq(managedUsers.email, email))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('[getManagedUserByEmail] Error:', error);
    
    // Fallback: SQL raw com mapeamento correto
    const connection = await import('mysql2/promise');
    const conn = await connection.createConnection(ENV.databaseUrl);
    try {
      const [rows] = await conn.execute(`
        SELECT
          id,
          created_by_user_id AS createdByUserId,
          username,
          first_name AS firstName,
          last_name AS lastName,
          email,
          phone_br AS phoneBR,
          phone_us AS phoneUS,
          password_hash AS passwordHash,
          role,
          is_active AS isActive,
          last_login AS lastLogin,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM managed_users
        WHERE email = ?
        LIMIT 1
      `, [email]);
      await conn.end();
      return (rows as any[]).length > 0 ? (rows as any[])[0] : null;
    } catch (fallbackError) {
      console.error('[getManagedUserByEmail] Fallback error:', fallbackError);
      await conn.end();
      return null;
    }
  }
}
```

2. **Mesmo fallback em `updateManagedUser`:**
```typescript
export async function updateManagedUser(id: number, createdByUserId: number, updates: Partial<ManagedUser>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    await db.update(managedUsers)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(
        eq(managedUsers.id, id),
        eq(managedUsers.createdByUserId, createdByUserId)
      ));
  } catch (error) {
    console.error('[updateManagedUser] Error:', error);
    
    // Fallback: SQL raw
    const connection = await import('mysql2/promise');
    const conn = await connection.createConnection(ENV.databaseUrl);
    try {
      const setClause = Object.keys(updates).map(key => {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        return `${snakeKey} = ?`;
      }).join(', ');
      const values = [...Object.values(updates), new Date(), id, createdByUserId];
      
      await conn.execute(`
        UPDATE managed_users
        SET ${setClause}, updated_at = ?
        WHERE id = ? AND created_by_user_id = ?
      `, values);
      await conn.end();
    } catch (fallbackError) {
      console.error('[updateManagedUser] Fallback error:', fallbackError);
      await conn.end();
      throw fallbackError;
    }
  }
}
```

**Prevenção:**
- Sempre use fallback SQL para queries críticas de autenticação
- Configure Drizzle com `snakeCaseMappers()` (TODO)
- Padronize migrations para usar snake_case consistentemente

---

### 2. Email Malformado ("teste@teste.comqdqfdwefwqfwq")

**Sintoma:**
Query falha com email concatenado com lixo: `teste@teste.comqdqfdwefwqfwq`

**Causa Raiz:**
- Frontend enviando email sem sanitização
- Concatenação acidental de campos (email + outro campo)
- State management incorreto (email sendo sobrescrito)

**Solução Implementada:**

1. **Sanitização no Backend (`server/routers.ts`):**
```typescript
teamLogin: publicProcedure.input(z.object({
  email: z.string().email(),
  password: z.string().min(1)
})).mutation(async ({ input }) => {
  // Sanitizar e validar email
  const email = String(input.email || '')
    .trim()
    .toLowerCase();
  
  console.log('[teamLogin] Email recebido:', JSON.stringify(input.email));
  console.log('[teamLogin] Email sanitizado:', JSON.stringify(email));
  
  // Validação adicional de formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error('[teamLogin] Email inválido:', email);
    throw new Error('Invalid credentials');
  }
  
  // Continuar com autenticação...
});
```

2. **Sanitização no Frontend (`client/src/pages/TeamLogin.tsx`):**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError("");

  // Sanitizar email
  const sanitizedEmail = email.trim().toLowerCase();

  // Validação básica de formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitizedEmail)) {
    setError("Por favor, insira um email válido");
    setIsLoading(false);
    return;
  }

  console.log('[TeamLogin] Email enviado:', sanitizedEmail);
  
  teamLoginMutation.mutate({ 
    email: sanitizedEmail, 
    password 
  });
};
```

**Prevenção:**
- Sempre use `.trim()` e `.toLowerCase()` em emails
- Valide formato com regex antes de enviar
- Adicione logs para rastrear origem de dados malformados
- Nunca confie em input do usuário sem sanitização

---

### 3. Senha Incorreta (bcrypt hash mismatch)

**Sintoma:**
Login falha mesmo com senha correta. Logs mostram `isValidPassword = false`.

**Causa Raiz:**
Hash da senha no banco não corresponde à senha fornecida. Possíveis causas:
- Senha foi alterada manualmente sem bcrypt
- Hash foi truncado durante migração
- Salt rounds diferentes entre criação e verificação

**Solução:**

1. **Gerar novo hash correto:**
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('SUA_SENHA', 10).then(h => console.log(h));"
```

2. **Atualizar no banco:**
```sql
UPDATE managed_users 
SET password_hash = '$2b$10$RoJee9VXuV.oTum6E79/Ve2x0TXR7xc6qloTbPRucrRAXq7voVC4W'
WHERE email = 'usuario@example.com';
```

3. **Verificar hash:**
```bash
node -e "
const bcrypt = require('bcryptjs');
const hash = '\$2b\$10\$RoJee9VXuV.oTum6E79/Ve2x0TXR7xc6qloTbPRucrRAXq7voVC4W';
bcrypt.compare('SUA_SENHA', hash).then(match => console.log('Match:', match));
"
```

**Prevenção:**
- Sempre use `bcrypt.hash()` ao criar/atualizar senhas
- Use 10 salt rounds consistentemente
- Nunca armazene senhas em plain text
- Implemente reset de senha via email

---

### 4. "[Auth] Missing session cookie"

**Sintoma:**
Logs mostram repetidamente `[Auth] Missing session cookie`.

**Causa Raiz:**
**Isso é NORMAL!** Não é um erro. Acontece quando:
- Usuário acessa rotas públicas (home, team-login)
- Requisições sem autenticação (health check, assets)
- OAuth não foi usado (apenas Team Login)

**Solução:**
Nenhuma ação necessária. Para silenciar logs em rotas públicas:

```typescript
// server/_core/context.ts
export async function createContext({ req, res }: CreateExpressContextOptions) {
  const publicRoutes = ['/team-login', '/api/trpc/auth.teamLogin'];
  const isPublicRoute = publicRoutes.some(route => req.path.includes(route));
  
  const sessionId = req.cookies[COOKIE_NAME];
  if (!sessionId && !isPublicRoute) {
    console.log('[Auth] Missing session cookie');
  }
  
  // ...
}
```

---

## Erros de Query SQL

### 5. "Unknown column 'createdByUserId'"

**Sintoma:**
```
Error: Unknown column 'createdByUserId' in 'field list'
```

**Causa Raiz:**
Drizzle ORM gera queries com camelCase, mas banco usa snake_case (`created_by_user_id`).

**Solução:**
Usar SQL raw com `AS` para mapear colunas (ver solução do problema #1).

**Prevenção:**
- Configure Drizzle com `snakeCaseMappers()`
- Padronize schema para usar snake_case
- Use fallback SQL em queries críticas

---

### 6. "Table 'managed_users' doesn't exist"

**Sintoma:**
```
Error: Table 'productivity_system.managed_users' doesn't exist
```

**Causa Raiz:**
- Migrations não foram executadas
- Conectado ao banco errado
- Banco foi dropado/recriado

**Solução:**

1. **Verificar conexão:**
```bash
mysql -u root -p -e "SELECT DATABASE();"
```

2. **Executar migrations:**
```bash
cd /var/www/productivity-finance-system
pnpm db:push
```

3. **Verificar tabelas:**
```sql
SHOW TABLES LIKE 'managed_users';
DESCRIBE managed_users;
```

**Prevenção:**
- Sempre execute `pnpm db:push` após `git pull`
- Documente migrations no changelog
- Use CI/CD para automatizar migrations

---

### 7. "Duplicate entry for key 'email'"

**Sintoma:**
```
Error: Duplicate entry 'teste@teste.com' for key 'managed_users.email'
```

**Causa Raiz:**
Tentativa de criar usuário com email já existente.

**Solução:**

1. **Verificar se email existe:**
```typescript
const existing = await db.getManagedUserByEmail(email);
if (existing) {
  throw new Error('Email already exists');
}
```

2. **Ou usar UPSERT:**
```sql
INSERT INTO managed_users (...) VALUES (...)
ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash);
```

**Prevenção:**
- Sempre valide unicidade antes de INSERT
- Use constraints UNIQUE no schema
- Retorne erro amigável ao usuário

---

## Problemas de Build e Deploy

### 8. "Command failed with exit code 1" (pnpm build)

**Sintoma:**
```
 ELIFECYCLE  Command failed with exit code 1.
```

**Causa Raiz:**
- Erros de TypeScript
- Imports faltando
- Variáveis de ambiente não definidas

**Solução:**

1. **Ver erros completos:**
```bash
pnpm run build 2>&1 | tee build.log
cat build.log
```

2. **Verificar TypeScript:**
```bash
pnpm tsc --noEmit
```

3. **Limpar cache:**
```bash
rm -rf dist node_modules/.cache
pnpm install
pnpm run build
```

**Prevenção:**
- Execute `pnpm tsc` antes de commit
- Configure pre-commit hooks
- Use CI/CD para validar builds

---

### 9. "Duplicate top-level function declarations"

**Sintoma:**
```
Duplicate top-level function declarations are not allowed in an ECMAScript module.
server/db.ts:1421:0:
  1421 │ export async function getManagedUserByEmail(email: string) {
```

**Causa Raiz:**
Função `getManagedUserByEmail` declarada duas vezes no mesmo arquivo.

**Solução:**

1. **Encontrar duplicatas:**
```bash
grep -n "export async function getManagedUserByEmail" server/db.ts
```

2. **Remover duplicata:**
```bash
nano server/db.ts
# Deletar uma das declarações
```

3. **Rebuild:**
```bash
pnpm run build
```

**Prevenção:**
- Use ESLint com regra `no-duplicate-exports`
- Code review antes de merge
- Evite copiar/colar código

---

### 10. "EMFILE: too many open files"

**Sintoma:**
```
Error: EMFILE: too many open files, watch '/home/ubuntu/productivity-finance-system/client'
```

**Causa Raiz:**
Sistema operacional atingiu limite de file descriptors. Comum em desenvolvimento com hot reload.

**Solução:**

1. **Aumentar limite (temporário):**
```bash
ulimit -n 10000
```

2. **Aumentar limite (permanente):**
```bash
echo "fs.inotify.max_user_watches=524288" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

3. **Reiniciar dev server:**
```bash
pm2 restart productivity-system
```

**Prevenção:**
- Configure limites adequados no servidor
- Use `--max-old-space-size` para Node.js
- Evite watch excessivo em produção

---

## Erros de Git e GitHub

### 11. "Authentication failed" (GitHub push)

**Sintoma:**
```
remote: Invalid username or token. Password authentication is not supported for Git operations.
fatal: Authentication failed for 'https://github.com/...'
```

**Causa Raiz:**
GitHub não aceita mais senha para autenticação HTTPS. Precisa usar Personal Access Token (PAT) ou SSH.

**Solução (HTTPS com PAT):**

1. **Criar token:**
   - Acesse: https://github.com/settings/tokens/new
   - Marque: `repo` (full control)
   - Gerar e copiar token

2. **Configurar remote:**
```bash
git remote set-url origin https://github.com/brnagencia-tech/productivity-finance-system.git
```

3. **Push com token:**
```bash
git push origin main
# Username: brnagencia-tech
# Password: COLE_O_TOKEN_AQUI
```

**Solução (SSH):**

1. **Gerar chave SSH:**
```bash
ssh-keygen -t ed25519 -C "bruno@agenciabrn.com.br"
cat ~/.ssh/id_ed25519.pub
```

2. **Adicionar no GitHub:**
   - Acesse: https://github.com/settings/keys
   - New SSH key → Cole a chave pública

3. **Configurar remote:**
```bash
git remote set-url origin git@github.com:brnagencia-tech/productivity-finance-system.git
```

4. **Push:**
```bash
git push origin main
```

**Prevenção:**
- Use SSH para servidores de produção
- Armazene PAT em gerenciador de senhas
- Configure Git Credential Manager

---

### 12. "fatal: unable to auto-detect email address"

**Sintoma:**
```
*** Please tell me who you are.
fatal: unable to auto-detect email address (got 'root@BRNCRM.(none)')
```

**Causa Raiz:**
Git não tem identidade configurada (nome e email).

**Solução:**

```bash
git config --global user.email "bruno@agenciabrn.com.br"
git config --global user.name "Bruno Medeiros"

# Verificar
git config --global user.email
git config --global user.name
```

**Prevenção:**
- Configure Git em novos servidores
- Use script de setup automatizado
- Documente configuração no README

---

### 13. "Your branch is behind 'origin/main' by X commits"

**Sintoma:**
```
Your branch is behind 'origin/main' by 4 commits, and can be fast-forwarded.
```

**Causa Raiz:**
Branch local está desatualizado em relação ao GitHub.

**Solução:**

1. **Pull sem conflitos:**
```bash
git pull origin main
```

2. **Pull com conflitos:**
```bash
git pull origin main
# Resolver conflitos manualmente
git add .
git commit -m "merge: resolver conflitos"
git push origin main
```

3. **Forçar overwrite (CUIDADO!):**
```bash
git fetch origin
git reset --hard origin/main
```

**Prevenção:**
- Sempre faça `git pull` antes de começar a trabalhar
- Use branches para features
- Configure pull automático no CI/CD

---

## Problemas de Ambiente

### 14. "Cannot read properties of undefined (reading 'isServer')"

**Sintoma:**
```
TypeError: Cannot read properties of undefined (reading 'isServer')
at new ConnectionConfig (.../mysql2/lib/connection_config.js:96:29)
```

**Causa Raiz:**
`process.env.DATABASE_URL` está undefined. Variável de ambiente não foi carregada.

**Solução:**

1. **Verificar .env:**
```bash
cat .env | grep DATABASE_URL
```

2. **Carregar .env:**
```bash
node -r dotenv/config seu-script.js
```

3. **Ou usar ENV do código:**
```typescript
import { ENV } from './server/_core/env';
const conn = await mysql.createConnection(ENV.databaseUrl);
```

**Prevenção:**
- Sempre use `ENV` do código, não `process.env` direto
- Valide variáveis obrigatórias no startup
- Use `.env.example` como template

---

### 15. "Port 3000 is already in use"

**Sintoma:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Causa Raiz:**
Outro processo está usando a porta 3000.

**Solução:**

1. **Encontrar processo:**
```bash
lsof -i :3000
# ou
netstat -tlnp | grep 3000
```

2. **Matar processo:**
```bash
kill -9 <PID>
```

3. **Ou usar outra porta:**
```bash
PORT=3001 pnpm dev
```

**Prevenção:**
- Use PM2 para gerenciar processos
- Configure porta via variável de ambiente
- Implemente graceful shutdown

---

## Erros de TypeScript

### 16. "Property 'databaseUrl' does not exist on type 'ENV'"

**Sintoma:**
```
Property 'databaseUrl' does not exist on type 'typeof ENV'
```

**Causa Raiz:**
Variável não foi declarada no `server/_core/env.ts`.

**Solução:**

```typescript
// server/_core/env.ts
export const ENV = {
  databaseUrl: process.env.DATABASE_URL!,
  jwtSecret: process.env.JWT_SECRET!,
  // ...
} as const;
```

**Prevenção:**
- Centralize todas as env vars em `env.ts`
- Use Zod para validação de schema
- Documente variáveis obrigatórias

---

### 17. "Cannot find module 'bcryptjs'"

**Sintoma:**
```
Error: Cannot find module 'bcryptjs'
```

**Causa Raiz:**
Pacote não foi instalado ou `node_modules` está corrompido.

**Solução:**

```bash
pnpm install bcryptjs
pnpm install @types/bcryptjs --save-dev
```

**Prevenção:**
- Sempre execute `pnpm install` após `git pull`
- Commit `pnpm-lock.yaml`
- Use `pnpm install --frozen-lockfile` em CI/CD

---

## Problemas de WebSocket

### 18. "WebSocket connection failed"

**Sintoma:**
Frontend não consegue conectar ao Socket.IO.

**Causa Raiz:**
- Servidor WebSocket não está rodando
- CORS bloqueando conexão
- Proxy reverso não configurado para WebSocket

**Solução:**

1. **Verificar servidor:**
```bash
curl -I http://localhost:3000/socket.io/
```

2. **Configurar CORS:**
```typescript
// server/_core/socket.ts
const io = new Server(server, {
  cors: {
    origin: ["https://brncrm.com.br", "http://localhost:5173"],
    credentials: true
  }
});
```

3. **Configurar Nginx (se usar):**
```nginx
location /socket.io/ {
  proxy_pass http://localhost:3000;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
}
```

**Prevenção:**
- Teste conexão WebSocket em staging
- Configure health check para Socket.IO
- Monitore conexões ativas

---

## Performance e Otimização

### 19. "Query muito lenta (>1s)"

**Sintoma:**
Queries demorando mais de 1 segundo para retornar.

**Causa Raiz:**
- Falta de índices
- Query sem WHERE/LIMIT
- JOIN excessivo
- Tabela muito grande sem paginação

**Solução:**

1. **Adicionar índices:**
```sql
CREATE INDEX idx_managed_users_email ON managed_users(email);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_expenses_user_date ON expenses(user_id, date);
```

2. **Usar EXPLAIN:**
```sql
EXPLAIN SELECT * FROM managed_users WHERE email = 'teste@teste.com';
```

3. **Adicionar paginação:**
```typescript
tasks.list: protectedProcedure.input(z.object({
  page: z.number().default(1),
  limit: z.number().default(50)
})).query(async ({ ctx, input }) => {
  const offset = (input.page - 1) * input.limit;
  return db.getTasksByUser(ctx.user.id, input.limit, offset);
});
```

**Prevenção:**
- Sempre use índices em colunas de WHERE/JOIN
- Implemente paginação em listas
- Use `SELECT` específico, não `SELECT *`
- Monitore slow query log

---

### 20. "Memory leak (heap out of memory)"

**Sintoma:**
```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

**Causa Raiz:**
- Conexões de banco não fechadas
- Event listeners não removidos
- Cache crescendo indefinidamente
- Loops infinitos

**Solução:**

1. **Aumentar heap (temporário):**
```bash
NODE_OPTIONS="--max-old-space-size=4096" node dist/index.js
```

2. **Fechar conexões:**
```typescript
const conn = await mysql.createConnection(ENV.databaseUrl);
try {
  // ...
} finally {
  await conn.end();  // SEMPRE feche!
}
```

3. **Remover listeners:**
```typescript
socket.on('disconnect', () => {
  socket.removeAllListeners();
});
```

**Prevenção:**
- Use connection pooling
- Implemente garbage collection manual
- Monitore uso de memória com PM2
- Profile com Chrome DevTools

---

## Checklist de Deploy

Antes de fazer deploy em produção:

- [ ] `pnpm tsc --noEmit` sem erros
- [ ] `pnpm run build` completo com sucesso
- [ ] Migrations executadas (`pnpm db:push`)
- [ ] Variáveis de ambiente configuradas
- [ ] Senhas de usuários atualizadas com bcrypt
- [ ] Backup do banco de dados criado
- [ ] PM2 configurado e rodando
- [ ] Logs monitorados (`pm2 logs`)
- [ ] Health check respondendo
- [ ] WebSocket conectando
- [ ] Login testado (OAuth + Team)
- [ ] SSL/HTTPS configurado
- [ ] CORS configurado corretamente

---

## Comandos Úteis

**Verificar status:**
```bash
pm2 status
pm2 logs productivity-system --lines 50
curl -I http://localhost:3000/
```

**Reiniciar serviços:**
```bash
pm2 restart productivity-system
pm2 reload productivity-system  # Zero downtime
```

**Banco de dados:**
```bash
mysql -u root -p productivity_system
pnpm db:push
pnpm db:studio  # Drizzle Studio
```

**Git:**
```bash
git status
git log --oneline -10
git diff HEAD~1
```

**Build:**
```bash
pnpm run build
pnpm tsc --noEmit
pnpm run lint
```

---

## Suporte

Para problemas não listados aqui:

1. Consulte [Technical Documentation](./TECHNICAL_DOCUMENTATION.md)
2. Consulte [API Reference](./API_REFERENCE.md)
3. Verifique logs: `pm2 logs productivity-system`
4. Entre em contato com o administrador do sistema

---

**Autor:** Manus AI  
**Última Atualização:** Janeiro 2026  
**Versão:** 1.0
