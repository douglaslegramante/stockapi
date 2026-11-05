// controllers/usuariosController.js
// Registro e login. É aqui que bcrypt (senha) e jsonwebtoken (token) entram.

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import * as service from '../services/usuariosService.js';

// POST /api/usuarios/registro
export async function registrar(req, res, next) {
  try {
    const { nome, email, senha } = req.body;

    // bcrypt.hash transforma a senha num "hash": um texto embaralhado que
    // não tem volta. O 10 é o custo do cálculo (quanto maior, mais lento e
    // mais difícil de quebrar). Mesmo com o banco vazado, a senha original
    // não aparece.
    const senhaHash = await bcrypt.hash(senha, 10);

    const id = await service.criar({ nome, email, senhaHash });

    // Nunca devolvemos senha nem hash na resposta.
    res.status(201).json({ id, email });
  } catch (erro) {
    // ER_DUP_ENTRY: já existe um usuário com esse e-mail (coluna UNIQUE).
    if (erro.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ erro: 'email em uso' });
    }
    next(erro);
  }
}

// POST /api/usuarios/login
export async function login(req, res, next) {
  try {
    const { email, senha } = req.body;

    const usuario = await service.buscarPorEmail(email);

    // Mesma resposta para "e-mail não existe" e "senha errada": assim quem
    // tenta invadir não descobre quais e-mails estão cadastrados.
    if (!usuario) {
      return res.status(401).json({ erro: 'invalido' });
    }

    // bcrypt.compare confere a senha digitada com o hash guardado.
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaCorreta) {
      return res.status(401).json({ erro: 'invalido' });
    }

    // jwt.sign cria o token. O 1º argumento (payload) são os dados que
    // viajam dentro dele; o 2º é a chave secreta que assina o token; o 3º
    // define a validade. O payload é legível por qualquer um: não coloque
    // senha nele.
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (erro) {
    next(erro);
  }
}
