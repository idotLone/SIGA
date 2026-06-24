// config/database.js
// Liga à base de dados. Por omissão usa SQLite (ficheiro local), sem
// necessidade de instalar MySQL, para que o módulo possa ser testado
// isoladamente. Quando o grupo definir a base MySQL comum, basta trocar
// para o bloco comentado em baixo.

const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'siga.sqlite'),
  logging: false
});

/*
// Configuração alternativa para MySQL (usar quando integrar com o grupo):
const sequelize = new Sequelize(
  process.env.DB_NAME || 'siga',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false
  }
);
*/

module.exports = sequelize;
