# Guia de Deploy: Team Login

## ✅ O que foi implementado

O sistema de login de equipe já estava implementado via tRPC (`auth.teamLogin`), mas faltava configurar os usuários no banco de dados com senhas corretas.

### Endpoint tRPC
- **Rota:** `auth.teamLogin`
- **Método:** Mutation
- **Input:** `{ email: string, password: string }`
- **Output:** `{ id, email, firstName, lastName, username, role, token }`

### Segurança
- Senhas hasheadas com bcrypt (salt rounds 10)
- Token JWT com validade de 7 dias
- Validação de usuário ativo

---

## 🚀 Deploy para Produção (brncrm.com.br)

### 1. Atualizar código no servidor

```bash
cd /var/www/productivity-finance-system
git pull origin main
pnpm install
pnpm run build
pm2 restart productivity-system
```

### 2. Criar usuário de teste no banco de produção

**Opção A: Via script Node.js**

```bash
cd /var/www/productivity-finance-system

# Criar arquivo temporário
cat > create-test-user.js << 'EOF'
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

(async () => {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  // Gerar hash da senha
  const hash = await bcrypt.hash('teste123', 10);
  
  // Inserir usuário
  try {
    await conn.execute(`
      INSERT INTO managed_users (
        username, firstName, lastName, email, passwordHash, role, isActive, createdByUserId, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, ['teste', 'Usuario', 'Teste', 'teste@teste.com', hash, 'master', 1, 1]);
    console.log('✅ Usuário criado com sucesso!');
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      await conn.execute('UPDATE managed_users SET passwordHash = ? WHERE email = ?', [hash, 'teste@teste.com']);
      console.log('✅ Senha atualizada!');
    } else {
      throw err;
    }
  }
  
  await conn.end();
})();
EOF

# Executar script
node -r dotenv/config create-test-user.js

# Remover arquivo temporário
rm create-test-user.js
```

**Opção B: Via MySQL direto**

```bash
# 1. Gerar hash da senha
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('teste123', 10).then(h => console.log(h));"

# 2. Copiar o hash gerado e conectar no MySQL
mysql -u root -p

# 3. Dentro do MySQL
USE productivity_system;

INSERT INTO managed_users (
  username, firstName, lastName, email, passwordHash, role, isActive, createdByUserId, createdAt, updatedAt
) VALUES (
  'teste',
  'Usuario',
  'Teste',
  'teste@teste.com',
  'COLE_O_HASH_AQUI',
  'master',
  1,
  1,
  NOW(),
  NOW()
);

exit;
```

### 3. Atualizar senha do Bruno

```bash
# Gerar novo hash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('Br221519@@@', 10).then(h => console.log(h));"

# Conectar no MySQL
mysql -u root -p

# Atualizar senha
USE productivity_system;
UPDATE managed_users SET passwordHash = 'COLE_O_HASH_AQUI' WHERE email = 'bruno@agenciabrn.com.br';
exit;
```

### 4. Testar no servidor

```bash
curl -X POST http://localhost:3000/api/trpc/auth.teamLogin \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@teste.com","password":"teste123"}'
```

### 5. Testar no navegador

Acesse: **https://brncrm.com.br/team-login**

**Credenciais de teste:**
- Email: `teste@teste.com`
- Senha: `teste123`

**Credenciais do Bruno:**
- Email: `bruno@agenciabrn.com.br`
- Senha: `Br221519@@@`

---

## 🔧 Troubleshooting

### Erro: "Invalid credentials"

1. Verifique se o hash da senha está correto no banco:
```sql
SELECT id, email, passwordHash FROM managed_users WHERE email = 'teste@teste.com';
```

2. Teste o hash manualmente:
```bash
node -e "
const bcrypt = require('bcryptjs');
const hash = 'COLE_O_HASH_DO_BANCO';
const password = 'teste123';
bcrypt.compare(password, hash).then(r => console.log('Match:', r));
"
```

### Erro: "Cannot read properties of undefined"

- Verifique se `process.env.DATABASE_URL` está definido
- Execute com `node -r dotenv/config` para carregar variáveis de ambiente

### Logs do PM2

```bash
pm2 logs productivity-system --lines 100
```

---

## 📝 Notas Importantes

1. **Não use endpoint Express `/api/team-login`**: O frontend chama o endpoint tRPC `auth.teamLogin`, não o endpoint Express que criamos inicialmente.

2. **Token JWT**: O token é armazenado em `localStorage` com a chave `teamToken`.

3. **Redirecionamento**: Após login bem-sucedido, o sistema redireciona para `/` (dashboard).

4. **Roles disponíveis**: `ceo`, `master`, `colaborador`

---

## ✅ Checklist de Deploy

- [ ] Código atualizado no servidor (`git pull`)
- [ ] Dependências instaladas (`pnpm install`)
- [ ] Build executado (`pnpm run build`)
- [ ] PM2 reiniciado (`pm2 restart productivity-system`)
- [ ] Usuário de teste criado no banco
- [ ] Senha do Bruno atualizada
- [ ] Login testado via curl
- [ ] Login testado no navegador
- [ ] Dashboard carregando corretamente

---

**Data:** 09/01/2026
**Versão:** 3848bdb2
