// routes/itensPedidoRoutes.js
// O POST valida as duas chaves estrangeiras; o PATCH valida só o que pode
// mudar (quantidade e/ou preco_unitario).
// O caminho usa underscore (/itens_pedido), igual ao nome da tabela.

import express from 'express';
import * as controller from '../controllers/itensPedidoController.js';
import { validarItemPedido, validarAtualizacaoItemPedido } from '../middlewares/validarItemPedido.js';

const router = express.Router();

router.post('/itens_pedido', validarItemPedido, controller.criar);
router.get('/itens_pedido', controller.listar);
router.get('/itens_pedido/:id', controller.buscarPorId);
router.patch('/itens_pedido/:id', validarAtualizacaoItemPedido, controller.atualizar);
router.delete('/itens_pedido/:id', controller.deletar);

export default router;
