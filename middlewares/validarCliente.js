// middlewares/validarCliente.js
// clientes não tem chave estrangeira, então a validação é simples.
//   • validarCliente           → POST  (criar): só nome é obrigatório
//   • validarAtualizacaoCliente → PATCH (atualizar): nada é obrigatório sozinho,
//                                 mas o que vier precisa estar certo
//
// email e telefone são opcionais e aceitam null (para apagar o valor).

import { responderValidacao } from '../utils/respostasErro.js';

// Limites do banco (veja database/schema.sql)
const NOME_MAX = 100;     // clientes.nome     VARCHAR(100)
const EMAIL_MAX = 120;    // clientes.email    VARCHAR(120)
const TELEFONE_MAX = 20;  // clientes.telefone VARCHAR(20)

const CAMPOS_CLIENTE = ['nome', 'email', 'telefone'];

// Verificação SIMPLES de e-mail: algo@algo.algo, sem espaços. Não pretende
// cobrir todos os casos da especificação de e-mail — só barrar o óbvio.
const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function erroNome(nome) {
  if (typeof nome !== 'string' || !nome.trim()) return 'nome deve ser um texto não vazio';
  if (nome.length > NOME_MAX) return `nome deve ter no máximo ${NOME_MAX} caracteres`;
  return null;
}

function erroEmail(email) {
  if (typeof email !== 'string' || !FORMATO_EMAIL.test(email)) return 'email deve ser um e-mail válido (ex.: nome@dominio.com)';
  if (email.length > EMAIL_MAX) return `email deve ter no máximo ${EMAIL_MAX} caracteres`;
  return null;
}

function erroTelefone(telefone) {
  if (typeof telefone !== 'string' || !telefone.trim()) return 'telefone deve ser um texto não vazio (ou null)';
  if (telefone.length > TELEFONE_MAX) return `telefone deve ter no máximo ${TELEFONE_MAX} caracteres`;
  return null;
}

// POST /clientes
export function validarCliente(req, res, next) {
  const { nome, email, telefone } = req.body;
  const erros = [];

  if (nome === undefined) erros.push('nome é obrigatório');
  else if (erroNome(nome)) erros.push(erroNome(nome));

  if (email !== undefined && email !== null && erroEmail(email)) erros.push(erroEmail(email));
  if (telefone !== undefined && telefone !== null && erroTelefone(telefone)) erros.push(erroTelefone(telefone));

  if (erros.length > 0) return responderValidacao(res, erros);
  next();
}

// PATCH /clientes/:id — pelo menos um campo, cada um com o tipo certo.
export function validarAtualizacaoCliente(req, res, next) {
  const { nome, email, telefone } = req.body;
  const erros = [];

  const enviados = Object.keys(req.body).filter((campo) => CAMPOS_CLIENTE.includes(campo));
  if (enviados.length === 0) {
    erros.push(`envie pelo menos um campo para atualizar (${CAMPOS_CLIENTE.join(', ')})`);
  }

  if (nome !== undefined && erroNome(nome)) erros.push(erroNome(nome));
  if (email !== undefined && email !== null && erroEmail(email)) erros.push(erroEmail(email));
  if (telefone !== undefined && telefone !== null && erroTelefone(telefone)) erros.push(erroTelefone(telefone));

  if (erros.length > 0) return responderValidacao(res, erros);
  next();
}
