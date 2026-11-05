// routes/clientesRoutes.js
// MÉTODO + CAMINHO → middleware de validação → controller.
// (O prefixo /api é adicionado no index.js.)

import express from 'express';
import * as controller from '../controllers/clientesController.js';
import { validarCliente, validarAtualizacaoCliente } from '../middlewares/validarCliente.js';

const router = express.Router();

router.post('/clientes', validarCliente, controller.criar);
router.get('/clientes', controller.listar);
router.get('/clientes/:id', controller.buscarPorId);
router.patch('/clientes/:id', validarAtualizacaoCliente, controller.atualizar); // PATCH: só os campos enviados mudam
router.delete('/clientes/:id', controller.deletar);

export default router;
