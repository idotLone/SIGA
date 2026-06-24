// models/Associado.js
// Modelo simplificado — no sistema final este modelo é gerido pelo colega
// responsável pela "Admissão e gestão de associados". Aqui mantemos apenas
// os campos necessários para o módulo de Quotas e Pagamentos funcionar.

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Associado = sequelize.define('Associado', {
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tipo: {
    type: DataTypes.ENUM('fisica', 'juridica'),
    allowNull: false,
    defaultValue: 'fisica'
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  nif: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'associados'
});

module.exports = Associado;
