'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Recibo extends Model {
    static associate(models) {
      Recibo.belongsTo(models.Pagamento, {
        foreignKey: 'pagamento_id',
        as: 'pagamento'
      });
      Recibo.belongsTo(models.Utilizador, {
        foreignKey: 'emitido_por',
        as: 'emissor'
      });
    }
  }

  Recibo.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    numero: {
      type: DataTypes.STRING(20),
      unique: true,
      allowNull: false,
      comment: 'Número único do recibo (ex: REC-2026-0001)'
    },
    pagamento_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    emitido_por: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do gestor financeiro que emitiu'
    },
    data_emissao: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    valor_total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    estado: {
      type: DataTypes.ENUM('ativo', 'anulado'),
      defaultValue: 'ativo',
      allowNull: false
    },
    motivo_anulacao: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    data_anulacao: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Recibo',
    tableName: 'recibos',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: async (recibo) => {
        const ano = new Date().getFullYear();
        const timestamp = Date.now();
        recibo.numero = `REC-${ano}-${String(timestamp % 10000).padStart(4, '0')}`;
      }
    }
  });

  return Recibo;
};
