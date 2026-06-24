// routes/pagamentos.js
const express = require('express');
const router = express.Router();
const pagamentoController = require('../controllers/pagamentoController');

// CU03 - lista de pagamentos a confirmar
router.get('/pendentes', pagamentoController.listarPendentes);

// CU05 - histórico (auditoria)
router.get('/historico', pagamentoController.listarHistorico);

// CU03 - confirmar / rejeitar
router.post('/:id/confirmar', pagamentoController.confirmarPagamento);
router.post('/:id/rejeitar', pagamentoController.rejeitarPagamento);

// CU04 - ver recibo de um pagamento
router.get('/:pagamentoId/recibo', pagamentoController.verRecibo);

module.exports = router;
