// routes/produtosRoutes.js
// A rota só liga três coisas: MÉTODO + CAMINHO → (middlewares) → controller.
// Os middlewares listados entre o caminho e o controller rodam na ordem em
// que aparecem; se algum responder sem chamar next(), o controller não roda.

import express from 'express';
import * as controller from '../controllers/produtosController.js';
import { validarProduto, validarAtualizacaoProduto } from '../middlewares/validarProduto.js';
import { autenticar } from '../middlewares/autenticar.js';

const router = express.Router();

// Os caminhos NÃO começam com /api: o prefixo é colocado no index.js,
// em app.use('/api', produtosRoutes).
router.post('/produtos', validarProduto, controller.criar);
router.get('/produtos', controller.listar);
router.get('/produtos/:id', controller.buscarPorId);
// PATCH = atualização parcial: envie só os campos que quer mudar.
router.patch('/produtos/:id', validarAtualizacaoProduto, controller.atualizar);

// Rota PROTEGIDA: `autenticar` roda primeiro e só deixa passar quem
// enviou um token JWT válido no header Authorization.
router.delete('/produtos/:id', autenticar, controller.deletar);

export default router;
