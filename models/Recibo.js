// models/Recibo.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Recibo = sequelize.define('Recibo', {
  numero: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  dataEmissao: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'recibos'
});

module.exports = Recibo;
