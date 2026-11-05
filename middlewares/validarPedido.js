// middlewares/validarPedido.js
// Dois middlewares porque criar e atualizar pedem coisas diferentes:
//   • validarPedido            → POST: cliente_id obrigatório; status opcional
//   • validarAtualizacaoPedido → PUT:  status obrigatório
//
// Pedido usa PUT (e não PATCH) porque o ÚNICO campo que pode mudar é o status:
// também não existe "atualização parcial" aqui.

import { responderValidacao } from '../utils/respostasErro.js';

const STATUS_MAX = 20; // pedidos.status VARCHAR(20)

function erroStatus(status) {
  if (typeof status !== 'string' || !status.trim()) return 'status deve ser um texto não vazio';
  if (status.length > STATUS_MAX) return `status deve ter no máximo ${STATUS_MAX} caracteres`;
  return null;
}

// POST /pedidos
export function validarPedido(req, res, next) {
  const { cliente_id, status } = req.body;
  const erros = [];

  if (cliente_id === undefined) {
    erros.push('cliente_id é obrigatório');
  } else if (!Number.isInteger(cliente_id)) {
    erros.push('cliente_id deve ser um número inteiro');
  }

  // status é opcional na criação (o padrão "pendente" é definido no service).
  if (status !== undefined && erroStatus(status)) erros.push(erroStatus(status));

  if (erros.length > 0) return responderValidacao(res, erros);
  next();
}

// PUT /pedidos/:id
export function validarAtualizacaoPedido(req, res, next) {
  const { status } = req.body;
  const erros = [];

  if (status === undefined) erros.push('status é obrigatório');
  else if (erroStatus(status)) erros.push(erroStatus(status));

  if (erros.length > 0) return responderValidacao(res, erros);
  next();
}
