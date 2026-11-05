// middlewares/validarItemPedido.js
//   • validarItemPedido            → POST:  as 2 FKs + quantidade + preço, tudo obrigatório
//   • validarAtualizacaoItemPedido → PATCH: só quantidade e/ou preco_unitario, pelo menos um
//
// pedido_id e produto_id NÃO podem ser alterados depois de criados (para
// trocar o produto de um item, apague o item e crie outro).

import { responderValidacao } from '../utils/respostasErro.js';

const PRECO_MAX = 99999999.99; // itens_pedido.preco_unitario DECIMAL(10,2)

const CAMPOS_ATUALIZAVEIS_ITEM = ['quantidade', 'preco_unitario'];

function erroId(valor, nomeCampo) {
  if (!Number.isInteger(valor)) return `${nomeCampo} deve ser um número inteiro`;
  return null;
}

function erroQuantidade(q) {
  if (!Number.isInteger(q) || q <= 0) return 'quantidade deve ser um número inteiro maior que zero';
  return null;
}

function erroPreco(p) {
  if (typeof p !== 'number' || !(p > 0) || p > PRECO_MAX) {
    return `preco_unitario deve ser um número maior que zero e até ${PRECO_MAX}`;
  }
  return null;
}

// POST /itens_pedido
export function validarItemPedido(req, res, next) {
  const { pedido_id, produto_id, quantidade, preco_unitario } = req.body;
  const erros = [];

  if (pedido_id === undefined) erros.push('pedido_id é obrigatório');
  else if (erroId(pedido_id, 'pedido_id')) erros.push(erroId(pedido_id, 'pedido_id'));

  if (produto_id === undefined) erros.push('produto_id é obrigatório');
  else if (erroId(produto_id, 'produto_id')) erros.push(erroId(produto_id, 'produto_id'));

  if (quantidade === undefined) erros.push('quantidade é obrigatória');
  else if (erroQuantidade(quantidade)) erros.push(erroQuantidade(quantidade));

  if (preco_unitario === undefined) erros.push('preco_unitario é obrigatório');
  else if (erroPreco(preco_unitario)) erros.push(erroPreco(preco_unitario));

  if (erros.length > 0) return responderValidacao(res, erros);
  next();
}

// PATCH /itens_pedido/:id
export function validarAtualizacaoItemPedido(req, res, next) {
  const { quantidade, preco_unitario } = req.body;
  const erros = [];

  const enviados = Object.keys(req.body).filter((campo) => CAMPOS_ATUALIZAVEIS_ITEM.includes(campo));
  if (enviados.length === 0) {
    erros.push(`envie pelo menos um campo para atualizar (${CAMPOS_ATUALIZAVEIS_ITEM.join(', ')})`);
  }

  if (quantidade !== undefined && erroQuantidade(quantidade)) erros.push(erroQuantidade(quantidade));
  if (preco_unitario !== undefined && erroPreco(preco_unitario)) erros.push(erroPreco(preco_unitario));

  if (erros.length > 0) return responderValidacao(res, erros);
  next();
}
