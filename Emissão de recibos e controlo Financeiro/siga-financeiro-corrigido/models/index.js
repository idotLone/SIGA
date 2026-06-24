'use strict';
const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  dbConfig
);

const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Importar todos os models
db.Associado = require('./Associado')(sequelize, Sequelize.DataTypes);
db.Utilizador = require('./Utilizador')(sequelize, Sequelize.DataTypes);
db.Atividade = require('./Atividade')(sequelize, Sequelize.DataTypes);
db.Pagamento = require('./Pagamento')(sequelize, Sequelize.DataTypes);
db.Recibo = require('./Recibo')(sequelize, Sequelize.DataTypes);

// Executar as associações
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
