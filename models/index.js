// models/index.js
const sequelize = require('../config/database');
const Associado = require('./Associado');
const Quota = require('./Quota');
const Pagamento = require('./Pagamento');
const Recibo = require('./Recibo');
const LogAuditoria = require('./LogAuditoria');

// Associado 1 --- N Quota
Associado.hasMany(Quota, { foreignKey: 'associadoId' });
Quota.belongsTo(Associado, { foreignKey: 'associadoId' });

// Quota 1 --- N Pagamento  (pode haver pagamento submetido + rejeitado + novo submetido)
Quota.hasMany(Pagamento, { foreignKey: 'quotaId' });
Pagamento.belongsTo(Quota, { foreignKey: 'quotaId' });

// Associado 1 --- N Pagamento (acesso direto, evita join constante via Quota)
Associado.hasMany(Pagamento, { foreignKey: 'associadoId' });
Pagamento.belongsTo(Associado, { foreignKey: 'associadoId' });

// Pagamento 1 --- 1 Recibo
Pagamento.hasOne(Recibo, { foreignKey: 'pagamentoId' });
Recibo.belongsTo(Pagamento, { foreignKey: 'pagamentoId' });

module.exports = {
  sequelize,
  Associado,
  Quota,
  Pagamento,
  Recibo,
  LogAuditoria
};
