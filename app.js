// app.js
const express = require('express');
const session = require('express-session');
const methodOverride = require('method-override');
const { sequelize } = require('./models');

const quotasRoutes = require('./routes/quotas');
const pagamentosRoutes = require('./routes/pagamentos');

const app = express();

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(__dirname + '/public'));

app.use(session({
  secret: 'siga-quotas-pagamentos-dev',
  resave: false,
  saveUninitialized: true
}));

// Simulação simples de "sessão" enquanto o módulo de Auth não está integrado:
// assume sempre o associado #1 como utilizador autenticado.
// Quando o colega responsável pela Gestão de Utilizadores/Auth terminar o
// seu módulo, substituir por middleware real de autenticação.
app.use((req, res, next) => {
  req.session.associadoId = req.session.associadoId || 1;
  req.session.utilizadorNome = req.session.utilizadorNome || 'Gestor Financeiro (demo)';
  res.locals.msg = req.query.msg;
  next();
});

app.get('/', (req, res) => res.redirect('/quotas'));

app.use('/quotas', quotasRoutes);
app.use('/pagamentos', pagamentosRoutes);

const PORT = process.env.PORT || 3000;

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`SIGA - Módulo de Quotas e Pagamentos a correr em http://localhost:${PORT}`);
  });
});
