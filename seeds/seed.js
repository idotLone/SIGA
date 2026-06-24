// seeds/seed.js
// Popula a base de dados com um associado e algumas quotas para testar o fluxo.
const { sequelize, Associado, Quota } = require('../models');

async function seed() {
  await sequelize.sync({ force: true });

  const associado = await Associado.create({
    nome: 'Maria Silva',
    tipo: 'fisica',
    email: 'maria.silva@example.com',
    nif: '123456789'
  });

  const associadoJuridico = await Associado.create({
    nome: 'Tech Solutions, Lda.',
    tipo: 'juridica',
    email: 'geral@techsolutions.example.com',
    nif: '500111222'
  });

  await Quota.bulkCreate([
    { associadoId: associado.id, valor: 25.0, periodo: '2026-Q2', dataVencimento: '2026-06-30', estado: 'pendente' },
    { associadoId: associado.id, valor: 25.0, periodo: '2026-Q1', dataVencimento: '2026-03-31', estado: 'atrasada' },
    { associadoId: associadoJuridico.id, valor: 60.0, periodo: '2026-Q2', dataVencimento: '2026-06-30', estado: 'pendente' }
  ]);

  console.log('Base de dados populada com sucesso.');
  console.log(`Associado de teste (sessão por omissão): #${associado.id} - ${associado.nome}`);
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
