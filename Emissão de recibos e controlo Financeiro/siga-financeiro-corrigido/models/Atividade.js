'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Atividade extends Model {
    static associate(models) {
      Atividade.hasMany(models.Pagamento, {
        foreignKey: 'atividade_id',
        as: 'pagamentos'
      });
    }
  }

  Atividade.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    titulo: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    tipo: {
      type: DataTypes.ENUM('conferencia', 'workshop', 'formacao', 'transferencia_tecnologia'),
      allowNull: false
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    data_inicio: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    data_fim: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    valor_inscricao: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    vagas: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('rascunho', 'publicada', 'em_curso', 'concluida', 'cancelada'),
      defaultValue: 'rascunho'
    }
  }, {
    sequelize,
    modelName: 'Atividade',
    tableName: 'atividades',
    timestamps: true,
    underscored: true
  });

  return Atividade;
};
