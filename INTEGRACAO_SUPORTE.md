# 🔧 Guia de Integração: Sistema de Suporte + Evolution API + n8n + Coolify

Este documento contém os passos exatos para integrar o sistema de tickets de suporte com WhatsApp (Evolution API), automação (n8n) e deploy (Coolify).

---

## 📋 Pré-requisitos

Antes de começar, você precisa ter:

- ✅ Evolution API rodando (URL + API Key)
- ✅ n8n rodando (URL de acesso)
- ✅ Coolify configurado no servidor Digital Ocean
- ✅ Acesso ao servidor via SSH
- ✅ Checkpoint v2.0.0 (9fdae1a8) publicado em produção

---

## 🔌 FASE 1: Configurar Evolution API (15 min)

### 1.1 - Obter Credenciais

Acesse o painel da Evolution API e anote:

```
EVOLUTION_API_URL=https://evolution.seudominio.com
EVOLUTION_API_KEY=sua-chave-aqui
EVOLUTION_INSTANCE=suporte
```

### 1.2 - Configurar Webhook

Execute o comando abaixo (substitua os valores):

```bash
curl -X POST https://evolution.seudominio.com/instance/setWebhook \
  -H "apikey: SUA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "webhook": "https://brncrm.com.br/api/webhooks/evolution",
    "webhook_by_events": true,
    "events": ["messages.upsert"]
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Webhook configured successfully"
}
```

### 1.3 - Testar Webhook

Envie uma mensagem de teste no WhatsApp conectado à instância e verifique se o webhook recebe a notificação.

---

## 🤖 FASE 2: Criar Workflow no n8n (30 min)

### 2.1 - Importar Workflow

1. Acesse seu n8n: `https://n8n.seudominio.com`
2. Clique em **"Workflows" → "Import from File"**
3. Cole o JSON abaixo e salve como **"Suporte - WhatsApp para Tickets"**

```json
{
  "name": "Suporte - WhatsApp para Tickets",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "evolution-webhook",
        "responseMode": "responseNode",
        "options": {}
      },
      "name": "Webhook Evolution",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{$json.event}}",
              "operation": "equals",
              "value2": "messages.upsert"
            }
          ]
        }
      },
      "name": "Filtrar Mensagens",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [450, 300]
    },
    {
      "parameters": {
        "url": "https://brncrm.com.br/api/trpc/clients.findByPhone",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendQuery": true,
        "queryParameters": {
          "parameters": [
            {
              "name": "phone",
              "value": "={{$json.data.key.remoteJid.split('@')[0]}}"
            }
          ]
        }
      },
      "name": "Buscar Cliente",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3,
      "position": [650, 300]
    },
    {
      "parameters": {
        "url": "https://brncrm.com.br/api/trpc/tickets.createFromWhatsApp",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "phone",
              "value": "={{$json.data.key.remoteJid.split('@')[0]}}"
            },
            {
              "name": "message",
              "value": "={{$json.data.message.conversation || $json.data.message.extendedTextMessage.text}}"
            },
            {
              "name": "clientName",
              "value": "={{$json.data.pushName}}"
            }
          ]
        }
      },
      "name": "Criar Ticket",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3,
      "position": [850, 300]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ { \"success\": true, \"ticketId\": $json.id } }}"
      },
      "name": "Responder Sucesso",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [1050, 300]
    }
  ],
  "connections": {
    "Webhook Evolution": {
      "main": [[{ "node": "Filtrar Mensagens", "type": "main", "index": 0 }]]
    },
    "Filtrar Mensagens": {
      "main": [[{ "node": "Buscar Cliente", "type": "main", "index": 0 }]]
    },
    "Buscar Cliente": {
      "main": [[{ "node": "Criar Ticket", "type": "main", "index": 0 }]]
    },
    "Criar Ticket": {
      "main": [[{ "node": "Responder Sucesso", "type": "main", "index": 0 }]]
    }
  }
}
```

### 2.2 - Configurar Credenciais

1. Nos nodes **"Buscar Cliente"** e **"Criar Ticket"**, clique em **"Credentials"**
2. Crie nova credencial **"Header Auth"**:
   - **Name:** `Authorization`
   - **Value:** `Bearer SEU_TOKEN_AQUI` (obtenha no sistema em Settings → API)

### 2.3 - Ativar Workflow

1. Clique em **"Active"** no canto superior direito
2. Copie a URL do webhook gerada (ex: `https://n8n.seudominio.com/webhook/evolution-webhook`)
3. Atualize o webhook da Evolution API com essa URL

---

## 🚀 FASE 3: Deploy no Coolify (10 min)

### 3.1 - Adicionar Variáveis de Ambiente

Acesse o painel do Coolify e adicione as seguintes variáveis:

```env
EVOLUTION_API_URL=https://evolution.seudominio.com
EVOLUTION_API_KEY=sua-chave-aqui
EVOLUTION_INSTANCE=suporte
WEBHOOK_SECRET=token-secreto-aleatorio-123
N8N_WEBHOOK_URL=https://n8n.seudominio.com/webhook/evolution-webhook
```

**Gerar WEBHOOK_SECRET:**
```bash
openssl rand -hex 32
```

### 3.2 - Deploy da Aplicação

```bash
# Conectar ao servidor
ssh root@seu-servidor.com

# Navegar para o diretório do projeto
cd /var/www/brncrm

# Fazer pull das alterações
git pull origin main

# Instalar dependências
pnpm install

# Aplicar migrations (CUIDADO: não sobrescreve dados existentes)
pnpm db:push

# Reiniciar aplicação
pm2 restart brncrm

# Verificar logs
pm2 logs brncrm --lines 50
```

### 3.3 - Verificar Deploy

1. Acesse: `https://brncrm.com.br/suporte`
2. Verifique se a página carrega corretamente
3. Teste criar um ticket manualmente

---

## 🧪 FASE 4: Testar Integração Completa (15 min)

### 4.1 - Teste Manual (WhatsApp → Ticket)

1. Envie mensagem no WhatsApp conectado à Evolution API
2. Verifique se ticket aparece em `/suporte` com status "Aberto"
3. Verifique se cliente foi vinculado automaticamente (se cadastrado)

### 4.2 - Teste de Atribuição

1. Abra o ticket criado
2. Atribua um responsável
3. Mova para "Em Andamento"
4. Verifique se métricas atualizam

### 4.3 - Teste de Resposta (Futuro)

> **Nota:** A funcionalidade de responder pelo sistema e enviar para WhatsApp será implementada na próxima versão.

---

## 📊 Monitoramento

### Logs da Aplicação

```bash
# Ver logs em tempo real
pm2 logs brncrm

# Ver últimas 100 linhas
pm2 logs brncrm --lines 100

# Ver apenas erros
pm2 logs brncrm --err
```

### Logs do n8n

1. Acesse: `https://n8n.seudominio.com`
2. Clique no workflow **"Suporte - WhatsApp para Tickets"**
3. Veja execuções em **"Executions"**

### Logs da Evolution API

Acesse o painel da Evolution e veja **"Webhooks" → "Logs"**

---

## 🔧 Troubleshooting

### Problema: Ticket não é criado ao enviar mensagem

**Solução:**
1. Verifique logs do n8n (execuções)
2. Verifique se webhook da Evolution está configurado corretamente
3. Teste manualmente o endpoint:

```bash
curl -X POST https://brncrm.com.br/api/trpc/tickets.createFromWhatsApp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "phone": "5511999999999",
    "message": "Teste de mensagem",
    "clientName": "Cliente Teste"
  }'
```

### Problema: Cliente não é vinculado automaticamente

**Solução:**
1. Verifique se telefone do cliente está cadastrado no formato correto (ex: `5511999999999`)
2. Verifique logs do servidor: `pm2 logs brncrm | grep "getClientByPhone"`

### Problema: Métricas não atualizam

**Solução:**
1. Faça refresh da página `/suporte`
2. Verifique se banco de dados está acessível
3. Execute query manual:

```sql
SELECT COUNT(*) FROM support_tickets;
```

---

## 🎯 Próximas Funcionalidades

- [ ] Responder ticket pelo sistema e enviar para WhatsApp
- [ ] Notificações em tempo real quando novo ticket chega
- [ ] Arrastar tickets entre colunas (drag & drop)
- [ ] Histórico de mensagens dentro do ticket
- [ ] Anexos em tickets
- [ ] SLA e alertas de vencimento
- [ ] Relatórios e dashboards de suporte

---

## 📞 Suporte

Se encontrar problemas, documente:
1. Mensagem de erro completa
2. Logs do servidor (`pm2 logs`)
3. Logs do n8n (execuções)
4. Passos para reproduzir

---

**Versão:** v2.0.0  
**Data:** 17/01/2026  
**Checkpoint:** 9fdae1a8
