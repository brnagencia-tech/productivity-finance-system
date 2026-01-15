# Changelog - Versão 1.3.0

**Data:** 15 de Janeiro de 2026  
**Tipo:** Melhorias de UX, Visual Moderno e Novas Funcionalidades

---

## 🎯 Resumo Executivo

Esta versão traz melhorias críticas de experiência do usuário, visual moderno estilo 2026 (era da IA) e novas funcionalidades de compartilhamento. Todas as mudanças são **aditivas** e **não afetam dados existentes em produção**.

---

## ✨ Novas Funcionalidades

### 1. Sistema de Compartilhamento de Tarefas e Hábitos

**Descrição:** Permite compartilhar tarefas e hábitos com outros usuários usando @username.

**Implementação:**
- ✅ Tabelas `task_shares` e `habit_shares` criadas no banco
- ✅ Endpoints tRPC implementados:
  - `tasks.share` - Compartilhar tarefa
  - `tasks.unshare` - Remover compartilhamento
  - `tasks.getShares` - Listar compartilhamentos
  - `habits.share` - Compartilhar hábito
  - `habits.unshare` - Remover compartilhamento
  - `habits.getShares` - Listar compartilhamentos

**UI:**
- ✅ Botão "Compartilhar" no dropdown de ações (desktop e mobile)
- ✅ Dialog com input de @username
- ✅ Validação de username no backend
- ✅ Feedback visual (toast) de sucesso/erro

**Arquivos Modificados:**
- `drizzle/schema.ts` - Adicionadas tabelas de compartilhamento
- `server/db-sharing.ts` - Funções de banco de dados (novo arquivo)
- `server/routers.ts` - Endpoints tRPC
- `client/src/pages/Tasks.tsx` - UI de compartilhamento
- `client/src/pages/Habits.tsx` - UI de compartilhamento

**SQL Executado:**
```sql
CREATE TABLE task_shares (
  id INT PRIMARY KEY AUTO_INCREMENT,
  task_id INT NOT NULL,
  user_id INT NOT NULL,
  permission ENUM('viewer', 'editor') DEFAULT 'viewer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE habit_shares (
  id INT PRIMARY KEY AUTO_INCREMENT,
  habit_id INT NOT NULL,
  user_id INT NOT NULL,
  permission ENUM('viewer', 'editor') DEFAULT 'viewer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

### 2. Campo "Meta" em Hábitos Aceita Texto Livre

**Problema:** Campo "Meta" só aceitava números, impedindo entradas como "uma hora", "2 litros".

**Solução:**
- ✅ Schema alterado: `targetValue` mudou de `DECIMAL(10,2)` para `VARCHAR(100)`
- ✅ Placeholder atualizado para refletir entrada de texto
- ✅ Validação removida do frontend

**SQL Executado:**
```sql
ALTER TABLE habits MODIFY COLUMN targetValue VARCHAR(100);
```

**Arquivos Modificados:**
- `drizzle/schema.ts` - Tipo alterado
- `client/src/pages/Habits.tsx` - Placeholder atualizado

---

### 3. Campo "Prioridade" em Tarefas

**Descrição:** Permite definir prioridade (Baixa/Média/Alta) ao criar ou editar tarefas.

**Implementação:**
- ✅ Coluna `priority` adicionada na tabela `tasks`
- ✅ Enum: `low`, `medium`, `high`
- ✅ Ícones visuais: 🟢 Baixa | 🟡 Média | 🔴 Alta

**SQL Executado:**
```sql
ALTER TABLE tasks ADD COLUMN priority ENUM('low', 'medium', 'high') DEFAULT 'medium';
```

**Arquivos Modificados:**
- `drizzle/schema.ts` - Campo adicionado
- `client/src/pages/Tasks.tsx` - Seletor de prioridade no formulário

---

## 🎨 Melhorias Visuais (Era da IA - 2026)

### Classes CSS Modernas Adicionadas

**Arquivo:** `client/src/index.css`

**Novas Classes:**

1. **Glassmorphism Avançado:**
   - `.glass-card` - Cards com efeito de vidro fosco
   - `.glass-panel` - Painéis translúcidos

2. **Efeitos de Brilho:**
   - `.glow-primary` - Brilho constante
   - `.glow-hover` - Brilho ao passar o mouse
   - `.pulse-glow` - Pulso luminoso animado

3. **Gradientes AI:**
   - `.gradient-ai` - Gradiente multicolorido para textos
   - `.ai-border` - Bordas com gradiente animado
   - `.holographic` - Efeito holográfico

4. **Animações:**
   - `.scale-hover` - Escala suave ao hover
   - `.float` - Flutuação suave
   - `.shimmer` - Efeito de carregamento moderno

5. **Destaques:**
   - `.neon-text` - Texto com efeito neon

### Dashboard Modernizado

**Mudanças Aplicadas:**
- ✅ Título "Dashboard" com gradiente AI (`.gradient-ai`)
- ✅ Todos os cards com glassmorphism (`.glass-card`)
- ✅ Efeitos hover com scale e glow
- ✅ Botões de filtro com animações suaves
- ✅ Visual profissional e futurista

**Arquivos Modificados:**
- `client/src/index.css` - Classes utilitárias
- `client/src/pages/Home.tsx` - Aplicação das classes

---

## 🐛 Correções de Bugs

### 1. Dados Reais nos Cards Multi-Moeda (v1.2.0 - já em produção)

**Problema:** Cards de Faturamento e Despesas BRL/USD mostravam valores estáticos (R$ 0,00).

**Solução:**
- ✅ Endpoint `expenses.getTotalsByCurrency` criado
- ✅ Queries tRPC integradas no Dashboard
- ✅ Loading states adicionados

---

## 📊 Alterações no Banco de Dados

### Novas Tabelas

1. **task_shares**
   - `id` (INT, PK, AUTO_INCREMENT)
   - `task_id` (INT, FK → tasks.id)
   - `user_id` (INT, FK → users.id)
   - `permission` (ENUM: viewer, editor)
   - `created_at` (TIMESTAMP)

2. **habit_shares**
   - `id` (INT, PK, AUTO_INCREMENT)
   - `habit_id` (INT, FK → habits.id)
   - `user_id` (INT, FK → users.id)
   - `permission` (ENUM: viewer, editor)
   - `created_at` (TIMESTAMP)

### Colunas Alteradas

1. **habits.targetValue**
   - Antes: `DECIMAL(10,2)`
   - Depois: `VARCHAR(100)`

2. **tasks.priority**
   - Adicionada: `ENUM('low', 'medium', 'high') DEFAULT 'medium'`

---

## 📁 Novos Arquivos

1. **server/db-sharing.ts**
   - Funções de banco de dados para compartilhamento
   - `getUserByUsername`, `createTaskShare`, `deleteTaskShare`, etc.

2. **CHANGELOG-v1.3.0.md**
   - Este arquivo de documentação

---

## 🔄 Arquivos Modificados

### Backend
- `drizzle/schema.ts` - Tabelas e colunas adicionadas
- `server/routers.ts` - Endpoints de compartilhamento
- `server/db-sharing.ts` - Novo arquivo

### Frontend
- `client/src/index.css` - Classes CSS modernas
- `client/src/pages/Home.tsx` - Visual modernizado
- `client/src/pages/Tasks.tsx` - Compartilhamento + prioridade
- `client/src/pages/Habits.tsx` - Compartilhamento + meta texto

---

## 🚀 Como Fazer Deploy

### Passo 1: Backup do Banco de Dados

```bash
# No servidor de produção (https://brncrm.com.br)
mysqldump -u [usuario] -p [nome_banco] > backup_pre_v1.3.0.sql
```

### Passo 2: Sincronizar Código do GitHub

```bash
cd /caminho/do/projeto
git pull origin main
```

### Passo 3: Instalar Dependências

```bash
pnpm install
```

### Passo 4: Aplicar Migrations do Banco

**IMPORTANTE:** As migrations são **aditivas** e **não afetam dados existentes**.

```bash
# Opção 1: Usar pnpm db:push (recomendado)
pnpm db:push

# Opção 2: Executar SQL manualmente
mysql -u [usuario] -p [nome_banco] < migrations.sql
```

**Conteúdo do `migrations.sql`:**
```sql
-- Adicionar coluna priority em tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority ENUM('low', 'medium', 'high') DEFAULT 'medium';

-- Alterar targetValue em habits
ALTER TABLE habits MODIFY COLUMN targetValue VARCHAR(100);

-- Criar tabela task_shares
CREATE TABLE IF NOT EXISTS task_shares (
  id INT PRIMARY KEY AUTO_INCREMENT,
  task_id INT NOT NULL,
  user_id INT NOT NULL,
  permission ENUM('viewer', 'editor') DEFAULT 'viewer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Criar tabela habit_shares
CREATE TABLE IF NOT EXISTS habit_shares (
  id INT PRIMARY KEY AUTO_INCREMENT,
  habit_id INT NOT NULL,
  user_id INT NOT NULL,
  permission ENUM('viewer', 'editor') DEFAULT 'viewer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Passo 5: Reiniciar Aplicação

```bash
pm2 restart all
# ou
pm2 restart productivity-finance-system
```

### Passo 6: Verificar Logs

```bash
pm2 logs productivity-finance-system
```

### Passo 7: Testar em Produção

1. ✅ Acessar https://brncrm.com.br
2. ✅ Verificar Dashboard (visual moderno)
3. ✅ Criar tarefa com prioridade
4. ✅ Compartilhar tarefa com @username
5. ✅ Criar hábito com meta de texto ("uma hora")
6. ✅ Verificar cards multi-moeda (dados reais)

---

## ⚠️ Avisos Importantes

### 1. Dados Não São Afetados

✅ **Todas as mudanças são aditivas**  
✅ **Nenhum dado existente será perdido**  
✅ **Migrations são seguras para produção**

### 2. Compatibilidade

✅ **Código antigo continua funcionando**  
✅ **Novas funcionalidades são opcionais**  
✅ **Visual moderno não quebra funcionalidades**

### 3. Rollback

Se necessário, fazer rollback:

```bash
# Restaurar código
git checkout [commit_anterior]
pm2 restart all

# Restaurar banco (se necessário)
mysql -u [usuario] -p [nome_banco] < backup_pre_v1.3.0.sql
```

---

## 📝 Notas de Desenvolvimento

### Decisões Técnicas

1. **Compartilhamento via @username:**
   - Escolhido por ser familiar aos usuários (redes sociais)
   - Validação no backend garante segurança
   - Permissões (viewer/editor) preparadas para futuro

2. **Campo Meta como VARCHAR:**
   - Flexibilidade para entrada de texto livre
   - Permite "uma hora", "2 litros", "8 copos"
   - Mantém compatibilidade com valores numéricos

3. **Prioridade em Tarefas:**
   - Enum garante consistência
   - Ícones visuais facilitam identificação rápida
   - Default "medium" para tarefas existentes

4. **Visual 2026:**
   - Glassmorphism segue tendências de design moderno
   - Animações suaves melhoram UX
   - Classes utilitárias facilitam manutenção

### Próximas Melhorias Sugeridas

1. **Notificações de Compartilhamento:**
   - Notificar usuário quando algo é compartilhado com ele
   - Mostrar contador de itens compartilhados

2. **Filtros de Compartilhamento:**
   - Filtrar tarefas/hábitos compartilhados comigo
   - Filtrar por permissão (viewer/editor)

3. **Autocomplete de @username:**
   - Sugerir usuários ao digitar @
   - Mostrar avatar e nome completo

4. **Histórico de Compartilhamento:**
   - Quem compartilhou e quando
   - Auditoria de acessos

---

## 🧪 Testes Realizados

### Testes Manuais

✅ Compartilhamento de tarefas  
✅ Compartilhamento de hábitos  
✅ Campo meta com texto livre  
✅ Prioridade em tarefas  
✅ Visual moderno no Dashboard  
✅ Responsividade mobile  
✅ Efeitos hover e animações  

### Testes de Integração

✅ Endpoints tRPC funcionando  
✅ Validação de @username  
✅ Migrations aplicadas sem erros  
✅ Dados existentes preservados  

---

## 📞 Suporte

Em caso de problemas durante o deploy:

1. Verificar logs: `pm2 logs productivity-finance-system`
2. Verificar conexão com banco de dados
3. Verificar variáveis de ambiente
4. Fazer rollback se necessário (instruções acima)

---

**Versão:** 1.3.0  
**Data de Release:** 15 de Janeiro de 2026  
**Desenvolvido por:** Manus AI Assistant  
**Aprovado por:** Bruno (CEO)
