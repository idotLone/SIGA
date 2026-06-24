'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Pagamento extends Model {
    static associate(models) {
      Pagamento.belongsTo(models.Associado, {
        foreignKey: 'associado_id',
        as: 'associado'
      });
      Pagamento.hasOne(models.Recibo, {
        foreignKey: 'pagamento_id',
        as: 'recibo'
      });
      Pagamento.belongsTo(models.Utilizador, {
        foreignKey: 'confirmado_por',
        as: 'gestor'
      });
      Pagamento.belongsTo(models.Atividade, {
        foreignKey: 'atividade_id',
        as: 'atividade'
      });
    }

    // Getters auxiliares
    get statusLabel() {
      const labels = {
        'pendente': 'Pendente',
        'confirmado': 'Confirmado',
        'rejeitado': 'Rejeitado',
        'em_analise': 'Em Análise'
      };
      return labels[this.status] || this.status;
    }

    get statusBadge() {
      const badges = {
        'pendente': 'warning',
        'confirmado': 'success',
        'rejeitado': 'danger',
        'em_analise': 'info'
      };
      return badges[this.status] || 'secondary';
    }

    get tipoLabel() {
      const labels = {
        'quota': 'Quota',
        'atividade': 'Atividade',
        'inscricao': 'Inscrição'
      };
      return labels[this.tipo] || this.tipo;
    }
  }

  Pagamento.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    codigo: {
      type: DataTypes.STRING(20),
      unique: true,
      allowNull: false,
      comment: 'Código único do pagamento (ex: PAG-2026-0001)'
    },
    associado_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    atividade_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Preenchido apenas se for pagamento de atividade'
    },
    tipo: {
      type: DataTypes.ENUM('quota', 'atividade', 'inscricao'),
      allowNull: false,
      defaultValue: 'quota'
    },
    valor: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    metodo_pagamento: {
      type: DataTypes.ENUM('transferencia', 'numerario', 'cheque', 'mbway', 'outro'),
      allowNull: false
    },
    referencia_pagamento: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Referência bancária, número de cheque, etc.'
    },
    data_pagamento: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    periodo_referencia: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Ex: 2026-Q1, 2026-ANO, etc.'
    },
    status: {
      type: DataTypes.ENUM('pendente', 'em_analise', 'confirmado', 'rejeitado'),
      defaultValue: 'pendente',
      allowNull: false
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    confirmado_por: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do gestor financeiro que confirmou'
    },
    data_confirmacao: {
      type: DataTypes.DATE,
      allowNull: true
    },
    motivo_rejeicao: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Pagamento',
    tableName: 'pagamentos',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: async (pagamento) => {
        // Gera código único automático usando timestamp
        const ano = new Date().getFullYear();
        const timestamp = Date.now();
        pagamento.codigo = `PAG-${ano}-${String(timestamp % 10000).padStart(4, '0')}`;
      }
    }
  });

  return Pagamento;
};
