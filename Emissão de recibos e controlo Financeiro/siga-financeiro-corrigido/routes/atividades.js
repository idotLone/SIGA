'use strict';

const express = require('express');
const router = express.Router();
const { autenticado, acessoFinanceiro } = require('../middleware/auth');

// Listagem de atividades
router.get('/', autenticado, acessoFinanceiro, (req, res) => {
  res.render('atividades/index', {
    titulo: 'Gestão de Atividades',
    usuario: req.session.usuario,
    mensagem: req.flash('mensagem'),
    erro: req.flash('erro')
  });
});

// Detalhe de atividade
router.get('/:id', autenticado, acessoFinanceiro, (req, res) => {
  res.render('atividades/detalhe', {
    titulo: 'Detalhe da Atividade',
    usuario: req.session.usuario,
    mensagem: req.flash('mensagem'),
    erro: req.flash('erro')
  });
});

module.exports = router;
