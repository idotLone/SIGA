'use strict';

const { Pagamento, Recibo, Associado, Utilizador, Atividade } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');

// ============================================================
// DASHBOARD FINANCEIRO
// ============================================================
exports.dashboard = async (req, res) => {
  try {
    const hoje = moment().format('YYYY-MM-DD');
    const inicioMes = moment().startOf('month').format('YYYY-MM-DD');
    const fimMes = moment().endOf('month').format('YYYY-MM-DD');
    const inicioAno = moment().startOf('year').format('YYYY-MM-DD');

    // KPIs
    const totalPendentes = await Pagamento.count({ where: { status: 'pendente' } });
    const totalEmAnalise = await Pagamento.count({ where: { status: 'em_analise' } });
    const totalConfirmados = await Pagamento.count({ where: { status: 'confirmado' } });

    // Volume financeiro do mês atual
    const { Sequelize } = require('../models');
    const volumeMes = await Pagamento.sum('valor', {
      where: {
        status: 'confirmado',
        data_pagamento: { [Op.between]: [inicioMes, fimMes] }
      }
    }) || 0;

    const volumeAno = await Pagamento.sum('valor', {
      where: {
        status: 'confirmado',
        data_pagamento: { [Op.between]: [inicioAno, hoje] }
      }
    }) || 0;

    // Pagamentos recentes pendentes (últimos 30 dias)
    const pagamentosPendentes = await Pagamento.findAll({
      where: { status: 'pendente' },
      include: [
        { model: Associado, as: 'associado', attributes: ['id', 'nome', 'apelido', 'nome_entidade', 'tipo'] }
      ],
      order: [['created_at', 'ASC']],
      limit: 10
    });

    // Quotas em atraso (pendentes há mais de 30 dias - alerta automático RF14)
    const trintaDiasAtras = moment().subtract(30, 'days').format('YYYY-MM-DD');
    const quotasAtrasadas = await Pagamento.count({
      where: {
        tipo: 'quota',
        status: 'pendente',
        data_pagamento: { [Op.lt]: trintaDiasAtras }
      }
    });

    // Recibos emitidos este mês
    const recibosEmitidos = await Recibo.count({
      where: {
        data_emissao: { [Op.between]: [inicioMes + ' 00:00:00', fimMes + ' 23:59:59'] },
        estado: 'ativo'
      }
    });

    // Distribuição por tipo de pagamento (para gráfico)
    const distribuicaoTipo = await Pagamento.findAll({
      where: { status: 'confirmado' },
      attributes: [
        'tipo',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'total'],
        [require('sequelize').fn('SUM', require('sequelize').col('valor')), 'valor_total']
      ],
      group: ['tipo']
    });

    res.render('financeiro/dashboard', {
      titulo: 'Controlo Financeiro',
      totalPendentes,
      totalEmAnalise,
      totalConfirmados,
      volumeMes: parseFloat(volumeMes).toFixed(2),
      volumeAno: parseFloat(volumeAno).toFixed(2),
      pagamentosPendentes,
      quotasAtrasadas,
      recibosEmitidos,
      distribuicaoTipo,
      usuario: req.session.usuario,
      mensagem: req.flash('mensagem'),
      erro: req.flash('erro')
    });
  } catch (error) {
    console.error('Erro no dashboard financeiro:', error);
    req.flash('erro', 'Erro ao carregar o dashboard financeiro.');
    res.redirect('/');
  }
};

// ============================================================
// LISTAGEM DE PAGAMENTOS
// ============================================================
exports.listarPagamentos = async (req, res) => {
  try {
    const { status, tipo, associado, data_inicio, data_fim, pagina = 1 } = req.query;
    const limite = 15;
    const offset = (pagina - 1) * limite;

    // Construir filtros dinâmicos
    const where = {};
    if (status) where.status = status;
    if (tipo) where.tipo = tipo;
    if (data_inicio && data_fim) {
      where.data_pagamento = { [Op.between]: [data_inicio, data_fim] };
    } else if (data_inicio) {
      where.data_pagamento = { [Op.gte]: data_inicio };
    } else if (data_fim) {
      where.data_pagamento = { [Op.lte]: data_fim };
    }

    // Filtro por associado (nome ou código)
    const includeAssociado = {
      model: Associado,
      as: 'associado',
      attributes: ['id', 'codigo', 'nome', 'apelido', 'nome_entidade', 'tipo', 'email']
    };
    if (associado) {
      includeAssociado.where = {
        [Op.or]: [
          { nome: { [Op.like]: `%${associado}%` } },
          { codigo: { [Op.like]: `%${associado}%` } },
          { nome_entidade: { [Op.like]: `%${associado}%` } }
        ]
      };
    }

    const { count, rows: pagamentos } = await Pagamento.findAndCountAll({
      where,
      include: [
        includeAssociado,
        { model: Utilizador, as: 'gestor', attributes: ['id', 'nome'], required: false },
        { model: Recibo, as: 'recibo', attributes: ['id', 'numero'], required: false }
      ],
      order: [['created_at', 'DESC']],
      limit: limite,
      offset,
      distinct: true
    });

    const totalPaginas = Math.ceil(count / limite);

    res.render('financeiro/pagamentos/index', {
      titulo: 'Gestão de Pagamentos',
      pagamentos,
      count,
      totalPaginas,
      paginaAtual: parseInt(pagina),
      filtros: { status, tipo, associado, data_inicio, data_fim },
      usuario: req.session.usuario,
      mensagem: req.flash('mensagem'),
      erro: req.flash('erro')
    });
  } catch (error) {
    console.error('Erro ao listar pagamentos:', error);
    req.flash('erro', 'Erro ao carregar a lista de pagamentos.');
    res.redirect('/financeiro');
  }
};

// ============================================================
// DETALHE DE PAGAMENTO
// ============================================================
exports.detalharPagamento = async (req, res) => {
  try {
    const { id } = req.params;

    const pagamento = await Pagamento.findByPk(id, {
      include: [
        {
          model: Associado,
          as: 'associado',
          attributes: ['id', 'codigo', 'nome', 'apelido', 'nome_entidade', 'tipo', 'email', 'telefone', 'morada', 'nif']
        },
        {
          model: Utilizador,
          as: 'gestor',
          attributes: ['id', 'nome'],
          required: false
        },
        {
          model: Recibo,
          as: 'recibo',
          include: [{ model: Utilizador, as: 'emissor', attributes: ['id', 'nome'], required: false }],
          required: false
        },
        {
          model: Atividade,
          as: 'atividade',
          attributes: ['id', 'titulo', 'tipo', 'data_inicio'],
          required: false
        }
      ]
    });

    if (!pagamento) {
      req.flash('erro', 'Pagamento não encontrado.');
      return res.redirect('/financeiro/pagamentos');
    }

    res.render('financeiro/pagamentos/detalhe', {
      titulo: `Pagamento ${pagamento.codigo}`,
      pagamento,
      usuario: req.session.usuario,
      mensagem: req.flash('mensagem'),
      erro: req.flash('erro')
    });
  } catch (error) {
    console.error('Erro ao detalhar pagamento:', error);
    req.flash('erro', 'Erro ao carregar o pagamento.');
    res.redirect('/financeiro/pagamentos');
  }
};

// ============================================================
// CONFIRMAR PAGAMENTO (RF04)
// ============================================================
exports.confirmarPagamento = async (req, res) => {
  try {
    const { id } = req.params;
    const { observacoes } = req.body;
    const gestorId = req.session.usuario.id;

    const pagamento = await Pagamento.findByPk(id, {
      include: [{ model: Associado, as: 'associado' }]
    });

    if (!pagamento) {
      req.flash('erro', 'Pagamento não encontrado.');
      return res.redirect('/financeiro/pagamentos');
    }

    if (!['pendente', 'em_analise'].includes(pagamento.status)) {
      req.flash('erro', `Este pagamento não pode ser confirmado. Estado atual: ${pagamento.statusLabel}`);
      return res.redirect(`/financeiro/pagamentos/${id}`);
    }

    // Confirmar o pagamento
    await pagamento.update({
      status: 'confirmado',
      confirmado_por: gestorId,
      data_confirmacao: new Date(),
      observacoes: observacoes || pagamento.observacoes
    });

    // Emitir recibo automaticamente (RF05)
    const descricaoRecibo = pagamento.tipo === 'quota'
      ? `Quota referente ao período ${pagamento.periodo_referencia || 'N/D'} - Associado: ${pagamento.associado.nomeCompleto || pagamento.associado.nome}`
      : `Inscrição em atividade - ${pagamento.tipo} - Associado: ${pagamento.associado.nomeCompleto || pagamento.associado.nome}`;

    const recibo = await Recibo.create({
      pagamento_id: pagamento.id,
      emitido_por: gestorId,
      data_emissao: new Date(),
      valor_total: pagamento.valor,
      descricao: descricaoRecibo,
      estado: 'ativo'
    });

    // Log de auditoria (RF18)
    console.log(`[AUDITORIA] Pagamento ${pagamento.codigo} confirmado por utilizador ${gestorId}. Recibo ${recibo.numero} emitido.`);

    req.flash('mensagem', `Pagamento ${pagamento.codigo} confirmado com sucesso! Recibo ${recibo.numero} emitido.`);
    res.redirect(`/financeiro/pagamentos/${id}`);
  } catch (error) {
    console.error('Erro ao confirmar pagamento:', error);
    req.flash('erro', 'Erro ao confirmar o pagamento. Tente novamente.');
    res.redirect(`/financeiro/pagamentos/${req.params.id}`);
  }
};

// ============================================================
// REJEITAR PAGAMENTO
// ============================================================
exports.rejeitarPagamento = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo_rejeicao } = req.body;
    const gestorId = req.session.usuario.id;

    if (!motivo_rejeicao || motivo_rejeicao.trim() === '') {
      req.flash('erro', 'É obrigatório indicar o motivo de rejeição.');
      return res.redirect(`/financeiro/pagamentos/${id}`);
    }

    const pagamento = await Pagamento.findByPk(id);

    if (!pagamento) {
      req.flash('erro', 'Pagamento não encontrado.');
      return res.redirect('/financeiro/pagamentos');
    }

    if (!['pendente', 'em_analise'].includes(pagamento.status)) {
      req.flash('erro', `Este pagamento não pode ser rejeitado. Estado atual: ${pagamento.statusLabel}`);
      return res.redirect(`/financeiro/pagamentos/${id}`);
    }

    await pagamento.update({
      status: 'rejeitado',
      confirmado_por: gestorId,
      data_confirmacao: new Date(),
      motivo_rejeicao: motivo_rejeicao.trim()
    });

    console.log(`[AUDITORIA] Pagamento ${pagamento.codigo} rejeitado por utilizador ${gestorId}. Motivo: ${motivo_rejeicao}`);

    req.flash('mensagem', `Pagamento ${pagamento.codigo} foi rejeitado.`);
    res.redirect(`/financeiro/pagamentos/${id}`);
  } catch (error) {
    console.error('Erro ao rejeitar pagamento:', error);
    req.flash('erro', 'Erro ao rejeitar o pagamento.');
    res.redirect(`/financeiro/pagamentos/${req.params.id}`);
  }
};

// ============================================================
// COLOCAR PAGAMENTO EM ANÁLISE
// ============================================================
exports.colocarEmAnalise = async (req, res) => {
  try {
    const { id } = req.params;
    const pagamento = await Pagamento.findByPk(id);

    if (!pagamento || pagamento.status !== 'pendente') {
      req.flash('erro', 'Pagamento inválido ou já processado.');
      return res.redirect('/financeiro/pagamentos');
    }

    await pagamento.update({ status: 'em_analise' });

    req.flash('mensagem', `Pagamento ${pagamento.codigo} colocado em análise.`);
    res.redirect(`/financeiro/pagamentos/${id}`);
  } catch (error) {
    console.error('Erro ao colocar em análise:', error);
    req.flash('erro', 'Erro ao atualizar o pagamento.');
    res.redirect(`/financeiro/pagamentos/${req.params.id}`);
  }
};

// ============================================================
// LISTAGEM DE RECIBOS (RF05)
// ============================================================
exports.listarRecibos = async (req, res) => {
  try {
    const { numero, data_inicio, data_fim, estado, pagina = 1 } = req.query;
    const limite = 15;
    const offset = (pagina - 1) * limite;

    const where = {};
    if (estado) where.estado = estado;
    if (numero) where.numero = { [Op.like]: `%${numero}%` };
    if (data_inicio && data_fim) {
      where.data_emissao = {
        [Op.between]: [
          moment(data_inicio).startOf('day').toDate(),
          moment(data_fim).endOf('day').toDate()
        ]
      };
    }

    const { count, rows: recibos } = await Recibo.findAndCountAll({
      where,
      include: [
        {
          model: Pagamento,
          as: 'pagamento',
          include: [
            { model: Associado, as: 'associado', attributes: ['id', 'codigo', 'nome', 'apelido', 'nome_entidade', 'tipo'] }
          ]
        },
        { model: Utilizador, as: 'emissor', attributes: ['id', 'nome'] }
      ],
      order: [['data_emissao', 'DESC']],
      limit: limite,
      offset,
      distinct: true
    });

    const totalPaginas = Math.ceil(count / limite);

    res.render('financeiro/recibos/index', {
      titulo: 'Recibos Emitidos',
      recibos,
      count,
      totalPaginas,
      paginaAtual: parseInt(pagina),
      filtros: { numero, data_inicio, data_fim, estado },
      usuario: req.session.usuario,
      mensagem: req.flash('mensagem'),
      erro: req.flash('erro')
    });
  } catch (error) {
    console.error('Erro ao listar recibos:', error);
    req.flash('erro', 'Erro ao carregar a lista de recibos.');
    res.redirect('/financeiro');
  }
};

// ============================================================
// VISUALIZAR RECIBO
// ============================================================
exports.visualizarRecibo = async (req, res) => {
  try {
    const { id } = req.params;

    const recibo = await Recibo.findByPk(id, {
      include: [
        {
          model: Pagamento,
          as: 'pagamento',
          include: [
            {
              model: Associado,
              as: 'associado',
              attributes: ['id', 'codigo', 'nome', 'apelido', 'nome_entidade', 'tipo', 'email', 'telefone', 'morada', 'nif']
            },
            { model: Atividade, as: 'atividade', required: false }
          ]
        },
        { model: Utilizador, as: 'emissor', attributes: ['id', 'nome'] }
      ]
    });

    if (!recibo) {
      req.flash('erro', 'Recibo não encontrado.');
      return res.redirect('/financeiro/recibos');
    }

    res.render('financeiro/recibos/visualizar', {
      titulo: `Recibo ${recibo.numero}`,
      recibo,
      usuario: req.session.usuario,
      mensagem: req.flash('mensagem'),
      erro: req.flash('erro')
    });
  } catch (error) {
    console.error('Erro ao visualizar recibo:', error);
    req.flash('erro', 'Erro ao carregar o recibo.');
    res.redirect('/financeiro/recibos');
  }
};

// ============================================================
// IMPRIMIR/EXPORTAR RECIBO (RF05, RF13)
// ============================================================
exports.imprimirRecibo = async (req, res) => {
  try {
    const { id } = req.params;

    const recibo = await Recibo.findByPk(id, {
      include: [
        {
          model: Pagamento,
          as: 'pagamento',
          include: [
            {
              model: Associado,
              as: 'associado'
            },
            { model: Atividade, as: 'atividade', required: false }
          ]
        },
        { model: Utilizador, as: 'emissor', attributes: ['id', 'nome'] }
      ]
    });

    if (!recibo) {
      req.flash('erro', 'Recibo não encontrado.');
      return res.redirect('/financeiro/recibos');
    }

    // Vista de impressão (sem layout / barra de navegação)
    res.render('financeiro/recibos/imprimir', {
      titulo: `Recibo ${recibo.numero}`,
      recibo,
      layout: false
    });
  } catch (error) {
    console.error('Erro ao imprimir recibo:', error);
    req.flash('erro', 'Erro ao preparar o recibo para impressão.');
    res.redirect('/financeiro/recibos');
  }
};

// ============================================================
// ANULAR RECIBO
// ============================================================
exports.anularRecibo = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo_anulacao } = req.body;

    if (!motivo_anulacao || motivo_anulacao.trim() === '') {
      req.flash('erro', 'É obrigatório indicar o motivo de anulação.');
      return res.redirect(`/financeiro/recibos/${id}`);
    }

    const recibo = await Recibo.findByPk(id);

    if (!recibo || recibo.estado !== 'ativo') {
      req.flash('erro', 'Recibo não encontrado ou já anulado.');
      return res.redirect('/financeiro/recibos');
    }

    await recibo.update({
      estado: 'anulado',
      motivo_anulacao: motivo_anulacao.trim(),
      data_anulacao: new Date()
    });

    console.log(`[AUDITORIA] Recibo ${recibo.numero} anulado por utilizador ${req.session.usuario.id}.`);

    req.flash('mensagem', `Recibo ${recibo.numero} foi anulado com sucesso.`);
    res.redirect(`/financeiro/recibos/${id}`);
  } catch (error) {
    console.error('Erro ao anular recibo:', error);
    req.flash('erro', 'Erro ao anular o recibo.');
    res.redirect(`/financeiro/recibos/${req.params.id}`);
  }
};

// ============================================================
// RELATÓRIO FINANCEIRO (RF12, RF13)
// ============================================================
exports.relatorio = async (req, res) => {
  try {
    const { periodo = 'mensal', ano = new Date().getFullYear(), mes } = req.query;

    let dataInicio, dataFim, tituloPeriodo;

    if (periodo === 'mensal' && mes) {
      dataInicio = moment(`${ano}-${mes}-01`).startOf('month').format('YYYY-MM-DD');
      dataFim = moment(`${ano}-${mes}-01`).endOf('month').format('YYYY-MM-DD');
      tituloPeriodo = moment(`${ano}-${mes}-01`).format('MMMM [de] YYYY');
    } else if (periodo === 'trimestral') {
      const trimestre = req.query.trimestre || Math.ceil(new Date().getMonth() / 3);
      dataInicio = moment().year(ano).quarter(trimestre).startOf('quarter').format('YYYY-MM-DD');
      dataFim = moment().year(ano).quarter(trimestre).endOf('quarter').format('YYYY-MM-DD');
      tituloPeriodo = `${trimestre}º Trimestre de ${ano}`;
    } else {
      dataInicio = `${ano}-01-01`;
      dataFim = `${ano}-12-31`;
      tituloPeriodo = `Ano ${ano}`;
    }

    // Totais confirmados
    const totalConfirmado = await Pagamento.sum('valor', {
      where: {
        status: 'confirmado',
        data_pagamento: { [Op.between]: [dataInicio, dataFim] }
      }
    }) || 0;

    // Por tipo
    const porTipo = await Pagamento.findAll({
      where: {
        status: 'confirmado',
        data_pagamento: { [Op.between]: [dataInicio, dataFim] }
      },
      attributes: [
        'tipo',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'quantidade'],
        [require('sequelize').fn('SUM', require('sequelize').col('valor')), 'total']
      ],
      group: ['tipo'],
      raw: true
    });

    // Por método de pagamento
    const porMetodo = await Pagamento.findAll({
      where: {
        status: 'confirmado',
        data_pagamento: { [Op.between]: [dataInicio, dataFim] }
      },
      attributes: [
        'metodo_pagamento',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'quantidade'],
        [require('sequelize').fn('SUM', require('sequelize').col('valor')), 'total']
      ],
      group: ['metodo_pagamento'],
      raw: true
    });

    // Pagamentos pendentes no período
    const totalPendente = await Pagamento.sum('valor', {
      where: {
        status: 'pendente',
        data_pagamento: { [Op.between]: [dataInicio, dataFim] }
      }
    }) || 0;

    // Recibos emitidos
    const totalRecibos = await Recibo.count({
      where: {
        estado: 'ativo',
        data_emissao: {
          [Op.between]: [
            moment(dataInicio).startOf('day').toDate(),
            moment(dataFim).endOf('day').toDate()
          ]
        }
      }
    });

    // Lista detalhada de pagamentos confirmados
    const pagamentos = await Pagamento.findAll({
      where: {
        status: 'confirmado',
        data_pagamento: { [Op.between]: [dataInicio, dataFim] }
      },
      include: [
        { model: Associado, as: 'associado', attributes: ['id', 'codigo', 'nome', 'apelido', 'nome_entidade', 'tipo'] },
        { model: Recibo, as: 'recibo', attributes: ['id', 'numero'], required: false }
      ],
      order: [['data_pagamento', 'DESC']]
    });

    res.render('financeiro/relatorio', {
      titulo: 'Relatório Financeiro',
      tituloPeriodo,
      periodo,
      ano: parseInt(ano),
      mes: mes ? parseInt(mes) : null,
      dataInicio,
      dataFim,
      totalConfirmado: parseFloat(totalConfirmado).toFixed(2),
      totalPendente: parseFloat(totalPendente).toFixed(2),
      porTipo,
      porMetodo,
      totalRecibos,
      pagamentos,
      usuario: req.session.usuario,
      mensagem: req.flash('mensagem'),
      erro: req.flash('erro')
    });
  } catch (error) {
    console.error('Erro no relatório financeiro:', error);
    req.flash('erro', 'Erro ao gerar o relatório financeiro.');
    res.redirect('/financeiro');
  }
};
