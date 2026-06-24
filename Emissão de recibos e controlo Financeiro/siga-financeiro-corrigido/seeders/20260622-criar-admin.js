'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('utilizadores', [
      {
        username: 'admin',
        email: 'admin@siga.com',
        password_hash: 'admin123',
        perfil: 'gestor_financeiro',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('utilizadores', { username: 'admin' });
  }
}; 