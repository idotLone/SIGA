'use strict';

const express = require('express');
const router = express.Router();
const { autenticado } = require('../middleware/auth');

// Dashboard principal
router.get('/', autenticado, (req, res) => {
  res.render('dashboard/index', {
    titulo: 'Dashboard',
    usuario: req.session.usuario,
    mensagem: req.flash('mensagem'),
    erro: req.flash('erro')
  });
});

module.exports = router;
