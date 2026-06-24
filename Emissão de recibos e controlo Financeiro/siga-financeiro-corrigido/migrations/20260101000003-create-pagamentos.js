'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pagamentos', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      codigo: {
        type: Sequelize.STRING(20),
        unique: true,
        allowNull: false
      },
      associado_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'associados', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      atividade_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'atividades', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      tipo: {
        type: Sequelize.ENUM('quota', 'atividade', 'inscricao'),
        allowNull: false,
        defaultValue: 'quota'
      },
      valor: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      metodo_pagamento: {
        type: Sequelize.ENUM('transferencia', 'numerario', 'cheque', 'mbway', 'outro'),
        allowNull: false
      },
      referencia_pagamento: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      data_pagamento: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      periodo_referencia: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('pendente', 'em_analise', 'confirmado', 'rejeitado'),
        defaultValue: 'pendente',
        allowNull: false
      },
      observacoes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      confirmado_por: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'utilizadores', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      data_confirmacao: {
        type: Sequelize.DATE,
        allowNull: true
      },
      motivo_rejeicao: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Índices
    await queryInterface.addIndex('pagamentos', ['associado_id']);
    await queryInterface.addIndex('pagamentos', ['status']);
    await queryInterface.addIndex('pagamentos', ['tipo']);
    await queryInterface.addIndex('pagamentos', ['data_pagamento']);
    await queryInterface.addIndex('pagamentos', ['codigo']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('pagamentos');
  }
};
