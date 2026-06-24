'use strict';

const express = require('express');
const router = express.Router();
const financeiroController = require('../controllers/financeiroController');
const { autenticado, gestorFinanceiro, acessoFinanceiro } = require('../middleware/auth');

// ---- DASHBOARD ----
router.get('/', autenticado, acessoFinanceiro, financeiroController.dashboard);

// ---- PAGAMENTOS ----
// Listar todos os pagamentos
router.get('/pagamentos', autenticado, acessoFinanceiro, financeiroController.listarPagamentos);

// Detalhe de um pagamento
router.get('/pagamentos/:id', autenticado, acessoFinanceiro, financeiroController.detalharPagamento);

// Colocar em análise (apenas gestor financeiro)
router.post('/pagamentos/:id/em-analise', autenticado, gestorFinanceiro, financeiroController.colocarEmAnalise);

// Confirmar pagamento e emitir recibo automaticamente (RF04 + RF05)
router.post('/pagamentos/:id/confirmar', autenticado, gestorFinanceiro, financeiroController.confirmarPagamento);

// Rejeitar pagamento
router.post('/pagamentos/:id/rejeitar', autenticado, gestorFinanceiro, financeiroController.rejeitarPagamento);

// ---- RECIBOS ----
// Listar todos os recibos
router.get('/recibos', autenticado, acessoFinanceiro, financeiroController.listarRecibos);

// Visualizar recibo
router.get('/recibos/:id', autenticado, acessoFinanceiro, financeiroController.visualizarRecibo);

// Imprimir / exportar recibo (vista limpa para impressão)
router.get('/recibos/:id/imprimir', autenticado, acessoFinanceiro, financeiroController.imprimirRecibo);

// Anular recibo (apenas gestor financeiro)
router.post('/recibos/:id/anular', autenticado, gestorFinanceiro, financeiroController.anularRecibo);

// ---- RELATÓRIO FINANCEIRO (RF12, RF13) ----
router.get('/relatorio', autenticado, acessoFinanceiro, financeiroController.relatorio);

module.exports = router;
