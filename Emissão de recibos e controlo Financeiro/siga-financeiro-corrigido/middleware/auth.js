'use strict';

// Verifica se o utilizador está autenticado
exports.autenticado = (req, res, next) => {
  if (req.session && req.session.usuario) {
    return next();
  }
  req.flash('erro', 'Precisa de fazer login para aceder a esta página.');
  res.redirect('/auth/login');
};

// Verifica se o utilizador tem perfil financeiro ou admin
exports.gestorFinanceiro = (req, res, next) => {
  const perfisPermitidos = ['administrador', 'gestor_financeiro'];
  if (req.session.usuario && perfisPermitidos.includes(req.session.usuario.perfil)) {
    return next();
  }
  req.flash('erro', 'Não tem permissão para aceder ao módulo financeiro.');
  res.redirect('/dashboard');
};

// Permite acesso à direção e gestores financeiros (só leitura)
exports.acessoFinanceiro = (req, res, next) => {
  const perfisPermitidos = ['administrador', 'gestor_financeiro', 'direcao'];
  if (req.session.usuario && perfisPermitidos.includes(req.session.usuario.perfil)) {
    return next();
  }
  req.flash('erro', 'Sem permissão de acesso.');
  res.redirect('/dashboard');
};
