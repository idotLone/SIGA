'use strict';

const express = require('express');
const router = express.Router();
const { autenticado, acessoFinanceiro } = require('../middleware/auth');

// Listagem de associados
router.get('/', autenticado, acessoFinanceiro, (req, res) => {
  res.render('associados/index', {
    titulo: 'Gestão de Associados',
    usuario: req.session.usuario,
    mensagem: req.flash('mensagem'),
    erro: req.flash('erro')
  });
});

// Detalhe de associado
router.get('/:id', autenticado, acessoFinanceiro, (req, res) => {
  res.render('associados/detalhe', {
    titulo: 'Detalhe do Associado',
    usuario: req.session.usuario,
    mensagem: req.flash('mensagem'),
    erro: req.flash('erro')
  });
});

module.exports = router;
