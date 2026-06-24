'use strict';

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { Utilizador } = require('../models');

// Página de login
router.get('/login', (req, res) => {
  if (req.session.usuario) {
    return res.redirect('/dashboard');
  }
  res.render('auth/login', {
    titulo: 'Login',
    usuario: req.session.usuario || null,
    mensagem: req.flash('mensagem'),
    erro: req.flash('erro')
  });
});

// Processar login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validar campos
    if (!username || !password) {
      req.flash('erro', 'Utilizador e senha são obrigatórios!');
      return res.redirect('/auth/login');
    }

    // Procurar utilizador na base de dados
    const usuario = await Utilizador.findOne({ where: { username } });

    if (!usuario) {
      req.flash('erro', 'Utilizador não encontrado!');
      return res.redirect('/auth/login');
    }

    // Verificar senha (comparar com password_hash)
    // Se a senha foi armazenada em texto plano:
    let senhaValida = false;
    
    if (usuario.password_hash.startsWith('$2')) {
      // É um hash bcrypt
      senhaValida = await bcrypt.compare(password, usuario.password_hash);
    } else {
      // É texto plano (para testes)
      senhaValida = (password === usuario.password_hash);
    }

    if (!senhaValida) {
      req.flash('erro', 'Senha incorreta!');
      return res.redirect('/auth/login');
    }

    // Login bem-sucedido
    req.session.usuario = {
      id: usuario.id,
      username: usuario.username,
      email: usuario.email,
      perfil: usuario.perfil
    };

    req.flash('mensagem', `Bem-vindo, ${usuario.username}!`);
    res.redirect('/dashboard');

  } catch (error) {
    console.error('Erro no login:', error);
    req.flash('erro', 'Erro ao processar login. Tente novamente.');
    res.redirect('/auth/login');
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Erro ao fazer logout:', err);
    }
    req.flash('mensagem', 'Logout realizado com sucesso!');
    res.redirect('/auth/login');
  });
});

module.exports = router;
