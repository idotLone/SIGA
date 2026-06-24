'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('recibos', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      numero: {
        type: Sequelize.STRING(20),
        unique: true,
        allowNull: false
      },
      pagamento_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'pagamentos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      emitido_por: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'utilizadores', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      data_emissao: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      valor_total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      descricao: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      estado: {
        type: Sequelize.ENUM('ativo', 'anulado'),
        defaultValue: 'ativo',
        allowNull: false
      },
      motivo_anulacao: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      data_anulacao: {
        type: Sequelize.DATE,
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

    await queryInterface.addIndex('recibos', ['pagamento_id']);
    await queryInterface.addIndex('recibos', ['numero']);
    await queryInterface.addIndex('recibos', ['emitido_por']);
    await queryInterface.addIndex('recibos', ['estado']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('recibos');
  }
};
