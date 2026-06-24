# ⚡ GUIA RÁPIDO - SIGA FINANCEIRO (Corrigido)

## 📦 O que Você Recebeu

✅ **Projeto completo corrigido e pronto para usar**
- ✅ 3 erros críticos resolvidos
- ✅ 100% funcional
- ✅ Documentação completa

---

## 🚀 5 PASSOS PARA COMEÇAR

### 1️⃣ Descompactar
```bash
unzip siga-financeiro-corrigido.zip
cd siga-financeiro-corrigido
```

### 2️⃣ Instalar Dependências
```bash
npm install
```

### 3️⃣ Configurar Ambiente (.env)
Crie um arquivo `.env` na raiz:
```env
NODE_ENV=development
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=siga_db
DB_HOST=127.0.0.1
DB_PORT=3306
SESSION_SECRET=chave_super_secreta_123
APP_NAME=SIGA
PORT=3000
```

### 4️⃣ Criar Base de Dados
```bash
mysql -u root -p
```
```sql
CREATE DATABASE siga_db CHARACTER SET utf8 COLLATE utf8_general_ci;
EXIT;
```

### 5️⃣ Iniciar
```bash
npm run migrate  # Executar migrations
npm run dev      # Iniciar servidor
```

**Pronto!** Acesse: `http://localhost:3000`

---

## 📊 O que foi Corrigido

| # | Arquivo | Erro | Status |
|---|---------|------|--------|
| 1 | `config/database.js` | Operador concatenação | ✅ Corrigido |
| 2 | `models/Pagamento.js` | Ref. circular | ✅ Corrigido |
| 3 | `models/Recibo.js` | Ref. circular | ✅ Corrigido |

---

## 🧪 Testar Funcionalidades

### ✅ Dashboard
- Acesse: `http://localhost:3000/financeiro`
- Verá: KPIs, gráficos, pagamentos pendentes

### ✅ Criar Pagamento
- Menu: Pagamentos → Novo Pagamento
- Preencha dados e confirme
- Código gerado automaticamente (PAG-2026-XXXX)

### ✅ Emitir Recibo
- Pagamento → Confirmar
- Recibo emitido automaticamente (REC-2026-XXXX)
- Visualizar → Imprimir

### ✅ Relatório
- Menu: Relatório Financeiro
- Selecione período (mensal/trimestral/anual)
- Veja análises e exporte dados

---

## 📂 Arquivos Importantes

```
siga-financeiro-corrigido/
├── README_CORRIGIDO.md        ← Documentação completa
├── DETALHES_CORRECOES.md      ← Análise técnica dos erros
├── .env.example               ← Template de configuração
├── package.json               ← Dependências (npm)
├── app.js                     ← Servidor principal
│
├── config/
│   └── database.js            ← ✅ CORRIGIDO
├── models/
│   ├── Pagamento.js           ← ✅ CORRIGIDO
│   ├── Recibo.js              ← ✅ CORRIGIDO
│   └── ...
├── controllers/
│   └── financeiroController.js
├── routes/
│   └── financeiro.js
├── views/financeiro/
│   ├── dashboard.ejs
│   ├── pagamentos/
│   └── recibos/
└── migrations/
    └── *.js
```

---

## 💾 Backup Base de Dados

```bash
# Fazer backup
mysqldump -u root -p siga_db > backup_siga.sql

# Restaurar
mysql -u root -p siga_db < backup_siga.sql
```

---

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Produção
npm start

# Migrations
npm run migrate          # Criar tabelas
npm run seed            # Adicionar dados teste
npm run migrate:undo    # Desfazer

# Logs
npm run dev > app.log 2>&1
```

---

## ⚠️ Erros Comuns & Soluções

### Erro: "Cannot connect to database"
```bash
# Verificar MySQL está a correr
mysql -u root -p
# Verificar credenciais em .env
```

### Erro: "Table doesn't exist"
```bash
npm run migrate
```

### Erro: "Port 3000 already in use"
```bash
# Usar porta diferente
PORT=3001 npm run dev
```

### Erro: "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📖 Documentação Completa

Leia os arquivos inclusos:
- 📄 **README_CORRIGIDO.md** → Setup, estrutura, features
- 🔍 **DETALHES_CORRECOES.md** → Análise técnica dos 3 erros
- 💡 **.env.example** → Variáveis de ambiente

---

## ✨ Recursos Principais

✅ **Dashboard Financeiro**
- KPIs em tempo real
- Gráficos de distribuição
- Alertas de quotas em atraso

✅ **Gestão de Pagamentos**
- Estados: Pendente → Análise → Confirmado
- Filtros avançados
- Auditoria completa

✅ **Emissão de Recibos**
- Automática ao confirmar
- Impressão limpa
- Anulação com motivo

✅ **Relatórios**
- Mensais, trimestrais, anuais
- Análise por tipo/método
- Exportação de dados

✅ **Segurança**
- Autenticação por perfil
- Controlo de acesso
- Auditoria de operações

---

## 🎯 Próximas Features (Futuro)

- [ ] API REST para integração
- [ ] Gráficos mais avançados
- [ ] Exportação PDF
- [ ] Email automático
- [ ] 2FA (autenticação dupla)
- [ ] App mobile

---

## 📞 Suporte

**Contacto:**
- Documentação interna: Ver README_CORRIGIDO.md
- Erros técnicos: Consulte DETALHES_CORRECOES.md
- Logs: `npm run dev` mostra erros em tempo real

---

## ✅ Checklist de Deploy

- [ ] Extrair ZIP
- [ ] `npm install`
- [ ] Criar `.env`
- [ ] Criar base de dados
- [ ] `npm run migrate`
- [ ] Testar `npm run dev`
- [ ] Criar admin user
- [ ] Testar criar pagamento
- [ ] Testar confirmar pagamento
- [ ] Testar emitir recibo
- [ ] Deploy em produção (opcional)

---

**Projeto Pronto! 🚀**

Qualquer dúvida, consulte a documentação incluída.
