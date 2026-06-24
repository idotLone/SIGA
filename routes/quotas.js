// routes/quotas.js
const express = require('express');
const router = express.Router();
const pagamentoController = require('../controllers/pagamentoController');

// CU01 - Consultar Quotas em Aberto
router.get('/', pagamentoController.listarQuotasAssociado);

// CU02 - Submeter Pagamento de Quota
router.get('/:quotaId/pagar', pagamentoController.formularioPagamento);
router.post('/:quotaId/pagar', pagamentoController.submeterPagamento);

module.exports = router;
