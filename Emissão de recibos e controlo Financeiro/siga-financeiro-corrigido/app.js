'use strict';

require('dotenv').config();

const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const path = require('path');
const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// CONFIGURAÇÃO DO MOTOR DE TEMPLATES (EJS)
// ============================================================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ============================================================
// MIDDLEWARES GLOBAIS
// ============================================================
app.use(express.urlencoded({ extended: true }));  // Parse form data
app.use(express.json());                           // Parse JSON
app.use(methodOverride('_method'));                // Suporte a PUT/DELETE em forms HTML
app.use(express.static(path.join(__dirname, 'public'))); // Ficheiros estáticos

// Sessão
app.use(session({
  secret: process.env.SESSION_SECRET || 'siga_secret_2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 8 // 8 horas
  }
}));

// Flash messages
app.use(flash());

// ============================================================
// VARIÁVEIS GLOBAIS PARA TODAS AS VIEWS
// ============================================================
app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario || null;
  res.locals.mensagem = req.flash('mensagem');
  res.locals.erro = req.flash('erro');
  res.locals.appNome = process.env.APP_NAME || 'SIGA';
  next();
});

// ============================================================
// LOG DE AUDITORIA SIMPLES (RF18)
// ============================================================
app.use((req, res, next) => {
  if (req.session.usuario && req.method !== 'GET') {
    console.log(
      `[AUDITORIA] ${new Date().toISOString()} | Utilizador: ${req.session.usuario.username} (${req.session.usuario.perfil}) | ${req.method} ${req.originalUrl}`
    );
  }
  next();
});

// ============================================================
// ROTAS
// ============================================================

// Rota raiz — redireciona para dashboard ou login
app.get('/', (req, res) => {
  if (req.session.usuario) {
    return res.redirect('/dashboard');
  }
  res.redirect('/auth/login');
});

// Autenticação
app.use('/auth', require('./routes/auth'));

// Dashboard geral
app.use('/dashboard', require('./routes/dashboard'));

// Módulo: Associados
app.use('/associados', require('./routes/associados'));

// Módulo: Gestão Financeira (RF04, RF05, RF11, RF12, RF13, RF14)
app.use('/financeiro', require('./routes/financeiro'));

// Módulo: Atividades e Desenvolvimento Profissional
app.use('/atividades', require('./routes/atividades'));

// Módulo: Gestão de Utilizadores (RF15, RF16, RF17, RF18, RF19, RF20)
app.use('/utilizadores', require('./routes/utilizadores'));

// ============================================================
// TRATAMENTO DE ERROS 404
// ============================================================
app.use((req, res) => {
  res.status(404).render('erros/404', {
    titulo: 'Página não encontrada'
  });
});

// ============================================================
// TRATAMENTO DE ERROS GLOBAIS
// ============================================================
app.use((err, req, res, next) => {
  console.error('[ERRO]', err.stack);
  res.status(500).render('erros/500', {
    titulo: 'Erro interno',
    erro: process.env.NODE_ENV === 'development' ? err.message : null
  });
});

// ============================================================
// INICIALIZAÇÃO
// ============================================================
sequelize.authenticate()
  .then(() => {
    console.log('✅ Ligação à base de dados estabelecida com sucesso.');
    return sequelize.sync({ alter: false }); // usar migrations em vez de sync em produção
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 SIGA a correr em http://localhost:${PORT}`);
      console.log(`   Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch(err => {
    console.error('❌ Erro ao ligar à base de dados:', err);
    process.exit(1);
  });

module.exports = app;
