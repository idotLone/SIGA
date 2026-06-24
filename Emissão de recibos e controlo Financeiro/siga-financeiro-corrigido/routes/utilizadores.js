'use strict';

const express = require('express');
const router = express.Router();
const { autenticado, gestorFinanceiro } = require('../middleware/auth');

// Listagem de utilizadores
router.get('/', autenticado, gestorFinanceiro, (req, res) => {
  res.render('utilizadores/index', {
    titulo: 'Gestão de Utilizadores',
    usuario: req.session.usuario,
    mensagem: req.flash('mensagem'),
    erro: req.flash('erro')
  });
});

// Detalhe de utilizador
router.get('/:id', autenticado, gestorFinanceiro, (req, res) => {
  res.render('utilizadores/detalhe', {
    titulo: 'Detalhe do Utilizador',
    usuario: req.session.usuario,
    mensagem: req.flash('mensagem'),
    erro: req.flash('erro')
  });
});

module.exports = router;
