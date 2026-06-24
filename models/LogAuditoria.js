// models/LogAuditoria.js
// Versão simplificada do serviço partilhado "Log Auditoria" — regista as
// transições de estado relevantes para o módulo de Pagamentos. No sistema
// final este modelo é provavelmente centralizado e partilhado entre todos
// os módulos.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LogAuditoria = sequelize.define('LogAuditoria', {
  entidade: {
    type: DataTypes.STRING, // ex: "Pagamento"
    allowNull: false
  },
  entidadeId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  acao: {
    type: DataTypes.STRING, // ex: "confirmado", "rejeitado"
    allowNull: false
  },
  ator: {
    type: DataTypes.STRING, // nome/perfil de quem executou a ação
    allowNull: false
  },
  data: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'log_auditoria',
  timestamps: false
});

module.exports = LogAuditoria;
