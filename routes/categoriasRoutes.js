// routes/categoriasRoutes.js
// Liga MÉTODO + CAMINHO → middlewares → controller.
// O prefixo /api é colocado no index.js, por isso não aparece aqui.

import express from 'express';
import * as controller from '../controllers/categoriasController.js';
import { validarCategoria } from '../middlewares/validarCategoria.js';
import { autenticar } from '../middlewares/autenticar.js';

const router = express.Router();

router.post('/categorias', validarCategoria, controller.criar);
router.get('/categorias', controller.listar);
router.get('/categorias/:id', controller.buscarPorId);
router.put('/categorias/:id', validarCategoria, controller.atualizar);

// Protegida: só com token JWT válido.
router.delete('/categorias/:id', autenticar, controller.deletar);

export default router;
