// models/Pagamento.js
// Estados possíveis seguem o workflow definido no enunciado (RF21/RF22/RF23):
// submetido -> confirmado | rejeitado
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pagamento = sequelize.define('Pagamento', {
  valor: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  metodo: {
    type: DataTypes.ENUM('transferencia', 'multibanco', 'cartao', 'numerario'),
    allowNull: false
  },
  referencia: {
    type: DataTypes.STRING,
    allowNull: true
  },
  estado: {
    type: DataTypes.ENUM('submetido', 'confirmado', 'rejeitado'),
    allowNull: false,
    defaultValue: 'submetido'
  },
  motivoRejeicao: {
    type: DataTypes.STRING,
    allowNull: true
  },
  dataSubmissao: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  dataConfirmacao: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'pagamentos'
});

module.exports = Pagamento;
