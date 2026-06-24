# SIGA — Módulo de Gestão de Quotas e Pagamentos

Implementação standalone do processo de **Pagamento de Quotas** do SIGA,
para ser depois integrada com o resto do projeto (Admissão de Associados,
Atividades, Dashboard, Gestão de Utilizadores).

## Stack
Node.js + Express + EJS + Bootstrap 5 + Sequelize, conforme definido no
enunciado. Por omissão usa **SQLite** (não precisa de instalar MySQL para
testar) — basta trocar a configuração em `config/database.js` quando o
grupo definir a base de dados comum.

## Como correr

```bash
npm install
npm run seed     # cria a BD e insere um associado + quotas de teste
npm start
```

Depois abre `http://localhost:3000`.

Por omissão, o sistema assume que estás autenticado como o associado
criado pelo seed (`Maria Silva`). Isto é uma simulação temporária — quando
o colega da Gestão de Utilizadores/Auth tiver o login pronto, substitui o
middleware em `app.js` (secção comentada) por autenticação real.

## Funcionalidades implementadas (mapeadas para o enunciado)

| RF | Descrição | Onde está |
|---|---|---|
| RF04 | Registar e confirmar o pagamento de quotas | `pagamentoController.submeterPagamento` / `confirmarPagamento` |
| RF05 | Emitir recibos de pagamento digitais | `pagamentoController.confirmarPagamento` (gera `Recibo`) + `verRecibo` |
| RF10 | Notificar associados sobre o estado | `console.log` (placeholder até integrar serviço de Notificações) |
| RF21 | Histórico completo de transições | `LogAuditoria` + `listarHistorico` |
| RF22 | Notificar atores após cada transição | idem RF10 |
| RF23 | Validar permissões antes da transição | a reforçar quando o módulo de Auth/perfis estiver integrado (ver `TODO` abaixo) |

## Fluxo (workflow)

```
Quota: pendente/atrasada --[associado paga]--> Pagamento: submetido
Pagamento: submetido --[financeiro confirma]--> confirmado --> Quota: paga + Recibo emitido
Pagamento: submetido --[financeiro rejeita]--> rejeitado
```

## Estrutura

```
app.js                       # arranque da aplicação
config/database.js           # ligação à BD (SQLite por omissão)
models/                      # Associado, Quota, Pagamento, Recibo, LogAuditoria
controllers/pagamentoController.js
routes/quotas.js             # rotas do lado do Associado
routes/pagamentos.js         # rotas do lado da Divisão Financeira
views/                       # EJS + Bootstrap
seeds/seed.js                # dados de teste
```

## Pontos a integrar com o resto do grupo

- **Auth real**: substituir a sessão simulada em `app.js` pela autenticação
  do módulo de Gestão de Utilizadores (RF17), e usar o perfil do utilizador
  para restringir o acesso às rotas de `/pagamentos/*` apenas ao
  "Gestor Financeiro" / "Administrador" (RF23).
- **Notificações**: trocar os `console.log` por chamadas ao serviço
  partilhado de Notificações (email/in-app) quando estiver pronto.
- **Modelo Associado**: este projeto cria a sua própria tabela `associados`
  simplificada só para testar isoladamente — ao integrar, usar o modelo
  definido pelo colega da Admissão de Associados (evitar duplicar tabela).
- **Pagamento de atividades**: o enunciado refere que o pagamento de
  inscrições em atividades "segue o mesmo fluxo" deste módulo — o colega
  responsável pelas Atividades pode reutilizar `Pagamento`/`Recibo` daqui,
  só adicionando uma referência opcional a `atividadeInscricaoId`.
- **PDF do recibo**: atualmente o recibo é só uma página HTML; se quiserem
  exportação real em PDF (associado ao Dashboard, RF13), posso ajudar a
  adicionar isso com a biblioteca `pdfkit`.
