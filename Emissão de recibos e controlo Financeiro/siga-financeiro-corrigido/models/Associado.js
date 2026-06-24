'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Associado extends Model {
    static associate(models) {
      Associado.hasMany(models.Pagamento, {
        foreignKey: 'associado_id',
        as: 'pagamentos'
      });
    }

    get nomeCompleto() {
      return this.tipo === 'pessoa_fisica'
        ? `${this.nome} ${this.apelido || ''}`.trim()
        : this.nome_entidade;
    }

    get tipoLabel() {
      return this.tipo === 'pessoa_fisica' ? 'Pessoa Física' : 'Pessoa Jurídica';
    }
  }

  Associado.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    codigo: {
      type: DataTypes.STRING(20),
      unique: true,
      allowNull: false
    },
    tipo: {
      type: DataTypes.ENUM('pessoa_fisica', 'pessoa_juridica'),
      allowNull: false
    },
    nome: {
      type: DataTypes.STRING(150),
      allowNull: false,
      comment: 'Primeiro nome ou nome da entidade'
    },
    apelido: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: 'Sobrenome (apenas para pessoa física)'
    },
    nome_entidade: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: 'Nome da empresa/instituição (apenas para pessoa jurídica)'
    },
    nif: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    telefone: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    morada: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('rascunho', 'submetida', 'em_analise', 'aprovada', 'rejeitada', 'ativo', 'inativo'),
      defaultValue: 'rascunho'
    },
    data_admissao: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Associado',
    tableName: 'associados',
    timestamps: true,
    underscored: true
  });

  return Associado;
};
