# 🔥 HajaBot - Sistema de Gestão de Leads WhatsApp

Sistema completo de gestão de leads via WhatsApp com integração Z-API e Supabase.

## 📋 Funcionalidades

### Backend (Node.js + Express)
- ✅ Webhook para receber mensagens do WhatsApp
- ✅ Resposta automática via Z-API
- ✅ Cadastro de leads via formulário
- ✅ Envio de mensagens manuais
- ✅ Integração completa com Supabase
- ✅ API REST para frontend

### Frontend (React + Tailwind)
- ✅ Login com magic link (Supabase Auth)
- ✅ Dashboard administrativo
- ✅ Lista de leads com filtros
- ✅ Envio de mensagens manuais
- ✅ Histórico de conversas
- ✅ Interface responsiva

### Database (Supabase)
- ✅ Tabela de leads
- ✅ Tabela de mensagens
- ✅ Autenticação integrada
- ✅ Políticas de segurança (RLS)

## 🚀 Configuração Rápida

### 1. Configurar Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute o SQL em `/supabase_setup.sql` no SQL Editor
3. Copie a URL e chave anon do projeto

### 2. Configurar Z-API

1. Acesse [Z-API](https://z-api.io)
2. Crie uma instância do WhatsApp
3. Copie `INSTANCE_ID` e `TOKEN`

### 3. Configurar Backend

```bash
cd backend
cp .env.example .env
# Edite o .env com suas credenciais
yarn install
yarn start
```

### 4. Configurar Frontend

```bash
cd frontend
cp .env.example .env
# Edite o .env com suas credenciais
yarn install
yarn start
```

## 🔧 Variáveis de Ambiente

### Backend (.env)
```bash
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua_chave_anon
ZAPI_INSTANCE=sua_instancia_zapi
ZAPI_TOKEN=seu_token_zapi
PORT=8001
```

### Frontend (.env)
```bash
REACT_APP_SUPABASE_URL=https://seu-projeto.supabase.co
REACT_APP_SUPABASE_KEY=sua_chave_anon
REACT_APP_BACKEND_URL=http://localhost:8001
```

## 📡 API Endpoints

### Webhook
- `POST /api/webhook` - Recebe mensagens do WhatsApp
- `POST /api/form` - Cadastra leads via formulário
- `POST /api/send` - Envia mensagem manual

### Dashboard
- `GET /api/leads` - Lista leads (com filtros)
- `GET /api/leads/:id/messages` - Mensagens de um lead
- `PUT /api/leads/:id` - Atualiza status do lead

## 🔄 Fluxo de Funcionamento

1. **Cliente envia mensagem** no WhatsApp
2. **Z-API envia webhook** para `/api/webhook`
3. **Sistema salva lead** no Supabase
4. **Resposta automática** é enviada via Z-API
5. **Admin visualiza** lead no dashboard
6. **Admin pode enviar** mensagens manuais

## 🛠️ Configuração do Webhook Z-API

Configure o webhook na Z-API para apontar para:
```
https://seu-dominio.com/api/webhook
```

## 📱 Estrutura das Tabelas

### Leads
```sql
- id (UUID)
- nome (TEXT)
- telefone (TEXT)
- mensagem (TEXT)
- plano (TEXT)
- cep (TEXT)
- status (novo|em_andamento|concluido)
- created_at (TIMESTAMP)
```

### Mensagens
```sql
- id (UUID)
- id_lead (UUID FK)
- texto (TEXT)
- tipo (enviada|recebida)
- horario (TIMESTAMP)
```

## 🔐 Autenticação

O sistema usa Supabase Auth com magic links:
1. Admin insere email na tela de login
2. Recebe link por email
3. Clica no link e é redirecionado autenticado

## 🎨 Interface

- Design moderno com Tailwind CSS
- Responsivo para desktop e mobile
- Dark mode pronto (configurável)
- Componentes reutilizáveis

## 📊 Dashboard Features

- Estatísticas em tempo real
- Filtros por status e busca
- Histórico completo de mensagens
- Envio de mensagens com preview
- Atualizações automáticas

## 🚦 Status dos Leads

- **Novo**: Lead recém-chegado
- **Em Andamento**: Em processo de atendimento
- **Concluído**: Atendimento finalizado

## 🔄 Próximas Funcionalidades

- [ ] Notificações em tempo real
- [ ] Templates de mensagens
- [ ] Integração com CRM
- [ ] Relatórios avançados
- [ ] API de webhooks para terceiros
- [ ] Chat interno para equipe

## 🐛 Troubleshooting

### Backend não inicia
- Verifique se todas as variáveis de ambiente estão configuradas
- Teste a conexão com Supabase
- Verifique os logs do servidor

### Mensagens não chegam
- Confirme o webhook na Z-API
- Verifique se a instância está conectada
- Teste o endpoint webhook manualmente

### Frontend não conecta
- Verifique o REACT_APP_BACKEND_URL
- Confirme se o backend está rodando
- Verifique as credenciais do Supabase

## 📞 Suporte

Sistema desenvolvido para gestão eficiente de leads WhatsApp com foco em conversão e atendimento ágil.
