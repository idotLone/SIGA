// models/Quota.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Quota = sequelize.define('Quota', {
  valor: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  periodo: {
    // Ex.: "2026-06" (mês de referência) ou "2026" (quota anual)
    type: DataTypes.STRING,
    allowNull: false
  },
  dataVencimento: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('pendente', 'paga', 'atrasada'),
    allowNull: false,
    defaultValue: 'pendente'
  }
}, {
  tableName: 'quotas'
});

module.exports = Quota;
