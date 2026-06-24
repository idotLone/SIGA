// controllers/pagamentoController.js
const { Quota, Pagamento, Recibo, Associado, LogAuditoria } = require('../models');

// Gera um numero de recibo sequencial simples: REC-2026-000123
async function gerarNumeroRecibo() {
  const ano = new Date().getFullYear();
  const total = await Recibo.count();
  const seq = String(total + 1).padStart(6, '0');
  return `REC-${ano}-${seq}`;
}

module.exports = {

  // CU01 - Consultar Quotas em Aberto
  async listarQuotasAssociado(req, res) {
    const associadoId = req.session.associadoId;
    const quotas = await Quota.findAll({
      where: { associadoId },
      order: [['dataVencimento', 'ASC']]
    });
    res.render('quotas/index', { quotas });
  },

  // CU02 - Submeter Pagamento de Quota
  async formularioPagamento(req, res) {
    const quota = await Quota.findByPk(req.params.quotaId);
    if (!quota) return res.status(404).send('Quota não encontrada');
    res.render('pagamentos/form', { quota });
  },

  async submeterPagamento(req, res) {
    const { quotaId } = req.params;
    const { metodo, referencia } = req.body;

    const quota = await Quota.findByPk(quotaId);
    if (!quota) return res.status(404).send('Quota não encontrada');

    const pagamento = await Pagamento.create({
      quotaId: quota.id,
      associadoId: quota.associadoId,
      valor: quota.valor,
      metodo,
      referencia,
      estado: 'submetido'
    });

    // Serviço partilhado: Notificações (simplificado em consola/flash)
    console.log(`[Notificação] Divisão Financeira: novo pagamento #${pagamento.id} submetido.`);

    res.redirect('/quotas?msg=pagamento_submetido');
  },

  // CU05 - lista de pagamentos pendentes de validação (Gestor Financeiro)
  async listarPendentes(req, res) {
    const pagamentos = await Pagamento.findAll({
      where: { estado: 'submetido' },
      include: [Associado, Quota],
      order: [['dataSubmissao', 'ASC']]
    });
    res.render('pagamentos/lista', { pagamentos, titulo: 'Pagamentos pendentes de confirmação' });
  },

  async listarHistorico(req, res) {
    const pagamentos = await Pagamento.findAll({
      include: [Associado, Quota, Recibo],
      order: [['dataSubmissao', 'DESC']]
    });
    res.render('pagamentos/lista', { pagamentos, titulo: 'Histórico de pagamentos' });
  },

  // CU03 - Confirmar Pagamento
  async confirmarPagamento(req, res) {
    const pagamento = await Pagamento.findByPk(req.params.id, { include: [Quota] });
    if (!pagamento) return res.status(404).send('Pagamento não encontrado');
    if (pagamento.estado !== 'submetido') {
      return res.status(400).send('Este pagamento já foi processado.');
    }

    pagamento.estado = 'confirmado';
    pagamento.dataConfirmacao = new Date();
    await pagamento.save();

    // Atualiza a quota associada
    await pagamento.Quota.update({ estado: 'paga' });

    // Log de auditoria (RF21/RF18)
    await LogAuditoria.create({
      entidade: 'Pagamento',
      entidadeId: pagamento.id,
      acao: 'confirmado',
      ator: req.session.utilizadorNome || 'Gestor Financeiro'
    });

    // CU04 - Emitir Recibo
    const numero = await gerarNumeroRecibo();
    await Recibo.create({
      numero,
      pagamentoId: pagamento.id
    });

    // Notificação ao associado (RF22)
    console.log(`[Notificação] Associado #${pagamento.associadoId}: pagamento confirmado, recibo ${numero} emitido.`);

    res.redirect('/pagamentos/pendentes?msg=confirmado');
  },

  // Fluxo alternativo do CU03
  async rejeitarPagamento(req, res) {
    const pagamento = await Pagamento.findByPk(req.params.id);
    if (!pagamento) return res.status(404).send('Pagamento não encontrado');
    if (pagamento.estado !== 'submetido') {
      return res.status(400).send('Este pagamento já foi processado.');
    }

    pagamento.estado = 'rejeitado';
    pagamento.motivoRejeicao = req.body.motivo || 'Não especificado';
    await pagamento.save();

    await LogAuditoria.create({
      entidade: 'Pagamento',
      entidadeId: pagamento.id,
      acao: 'rejeitado',
      ator: req.session.utilizadorNome || 'Gestor Financeiro'
    });

    console.log(`[Notificação] Associado #${pagamento.associadoId}: pagamento rejeitado (${pagamento.motivoRejeicao}).`);

    res.redirect('/pagamentos/pendentes?msg=rejeitado');
  },

  // CU04 - mostrar/descarregar recibo
  async verRecibo(req, res) {
    const recibo = await Recibo.findOne({
      where: { pagamentoId: req.params.pagamentoId },
      include: [{ model: Pagamento, include: [Associado, Quota] }]
    });
    if (!recibo) return res.status(404).send('Recibo ainda não disponível.');
    res.render('recibos/show', { recibo });
  }
};
