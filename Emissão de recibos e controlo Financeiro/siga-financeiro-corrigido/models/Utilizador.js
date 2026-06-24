'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class Utilizador extends Model {
    static associate(models) {
      Utilizador.hasMany(models.Pagamento, {
        foreignKey: 'confirmado_por',
        as: 'pagamentosConfirmados'
      });
      Utilizador.hasMany(models.Recibo, {
        foreignKey: 'emitido_por',
        as: 'recibosEmitidos'
      });
    }

    async verificarPassword(password) {
      return bcrypt.compare(password, this.password_hash);
    }

    get perfilLabel() {
      const labels = {
        'administrador': 'Administrador',
        'gestor_associados': 'Gestor de Associados',
        'gestor_financeiro': 'Gestor Financeiro',
        'gestor_atividades': 'Gestor de Atividades',
        'direcao': 'Direção / Gestor Executivo',
        'associado': 'Associado'
      };
      return labels[this.perfil] || this.perfil;
    }
  }

  Utilizador.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nome: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(200),
      unique: true,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    perfil: {
      type: DataTypes.ENUM(
        'administrador',
        'gestor_associados',
        'gestor_financeiro',
        'gestor_atividades',
        'direcao',
        'associado'
      ),
      allowNull: false
    },
    divisao: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    tentativas_login: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    bloqueado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Utilizador',
    tableName: 'utilizadores',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: async (utilizador) => {
        if (utilizador.password_hash) {
          utilizador.password_hash = await bcrypt.hash(utilizador.password_hash, 10);
        }
      },
      beforeUpdate: async (utilizador) => {
        if (utilizador.changed('password_hash')) {
          utilizador.password_hash = await bcrypt.hash(utilizador.password_hash, 10);
        }
      }
    }
  });

  return Utilizador;
};
