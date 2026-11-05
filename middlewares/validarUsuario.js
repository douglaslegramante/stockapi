// middlewares/validarUsuario.js
// Dois middlewares: um para o registro, outro para o login.

import { responderValidacao } from '../utils/respostasErro.js';

const NOME_MAX = 100;   // usuarios.nome  VARCHAR(100)
const EMAIL_MAX = 120;  // usuarios.email VARCHAR(120)
const SENHA_MIN = 6;    // mínimo simples, só para o exercício. Num sistema real as regras são mais rígidas.
const SENHA_MAX = 72;   // o bcrypt só considera os 72 primeiros caracteres

// Verificação simples de e-mail (algo@algo.algo, sem espaços).
const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /usuarios/registro — nome, email e senha obrigatórios.
export function validarRegistro(req, res, next) {
  const { nome, email, senha } = req.body;
  const erros = [];

  if (typeof nome !== 'string' || !nome.trim()) {
    erros.push('nome é obrigatório e deve ser um texto não vazio');
  } else if (nome.length > NOME_MAX) {
    erros.push(`nome deve ter no máximo ${NOME_MAX} caracteres`);
  }

  if (typeof email !== 'string' || !FORMATO_EMAIL.test(email)) {
    erros.push('email é obrigatório e deve ser um e-mail válido (ex.: nome@dominio.com)');
  } else if (email.length > EMAIL_MAX) {
    erros.push(`email deve ter no máximo ${EMAIL_MAX} caracteres`);
  }

  if (typeof senha !== 'string' || senha.length < SENHA_MIN || senha.length > SENHA_MAX) {
    erros.push(`senha é obrigatória e deve ter entre ${SENHA_MIN} e ${SENHA_MAX} caracteres`);
  }

  if (erros.length > 0) return responderValidacao(res, erros);
  next();
}

// POST /usuarios/login — só email e senha, ambos texto.
// Aqui NÃO conferimos formato nem tamanho: se estiver errado, o login
// simplesmente falha com 401, sem revelar nada sobre o que é válido.
export function validarLogin(req, res, next) {
  const { email, senha } = req.body;
  const erros = [];

  if (typeof email !== 'string' || !email) erros.push('email é obrigatório e deve ser um texto');
  if (typeof senha !== 'string' || !senha) erros.push('senha é obrigatória e deve ser um texto');

  if (erros.length > 0) return responderValidacao(res, erros);
  next();
}
