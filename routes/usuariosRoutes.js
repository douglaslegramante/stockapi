// routes/usuariosRoutes.js
// Rotas públicas de autenticação: não usam o middleware `autenticar`,
// porque é justamente aqui que o usuário consegue o token.

import express from 'express';
import * as controller from '../controllers/usuariosController.js';
import { validarRegistro, validarLogin } from '../middlewares/validarUsuario.js';

const router = express.Router();

router.post('/usuarios/registro', validarRegistro, controller.registrar);
router.post('/usuarios/login', validarLogin, controller.login);

export default router;
