// middlewares/validarProduto.js
// Um middleware é uma função que roda ANTES do controller, no meio do
// caminho entre a rota e a lógica de negócio. Ela recebe os mesmos
// (req, res, next) de sempre, e tem duas escolhas:
//
//   1. Encontrou um problema → responde direto (400) e NÃO chama next().
//      A requisição para aqui; o controller nunca roda.
//   2. Está tudo certo → chama next(), e o Express segue pro próximo
//      middleware (ou pro controller, se não houver mais nenhum).
//
// Este arquivo tem DOIS middlewares, com regras diferentes:
//   • validarProduto           → POST  (criar): nome e preco são obrigatórios
//   • validarAtualizacaoProduto → PATCH (atualizar): nenhum campo é obrigatório
//                                 sozinho, mas o que vier precisa estar certo

import { responderValidacao } from '../utils/respostasErro.js';

// Limites que vêm do banco (veja database/schema.sql). Validar aqui evita que
// o MySQL recuse o valor e a API responda 500.
const NOME_MAX = 100;            // produtos.nome  VARCHAR(100)
const PRECO_MAX = 99999999.99;   // produtos.preco DECIMAL(10,2)

// Campos que o cliente pode enviar (também é a whitelist do PATCH).
const CAMPOS_PRODUTO = ['nome', 'descricao', 'preco', 'quantidade_estoque', 'categoria_id'];

// Cada função abaixo confere UM campo e devolve a mensagem de erro, ou null
// se estiver tudo certo. Assim POST e PATCH reaproveitam as mesmas regras.
function erroNome(nome) {
  if (typeof nome !== 'string' || !nome.trim()) return 'nome deve ser um texto não vazio';
  if (nome.length > NOME_MAX) return `nome deve ter no máximo ${NOME_MAX} caracteres`;
  return null;
}

function erroPreco(preco) {
  if (typeof preco !== 'number' || !(preco > 0) || preco > PRECO_MAX) {
    return `preco deve ser um número maior que zero e até ${PRECO_MAX}`;
  }
  return null;
}

function erroEstoque(qtd) {
  // Number.isInteger rejeita 1.5 (estoque é contado em unidades inteiras).
  // 0 é válido, por isso a comparação é >= 0.
  if (!Number.isInteger(qtd) || qtd < 0) return 'quantidade_estoque deve ser um número inteiro maior ou igual a zero';
  return null;
}

function erroCategoria(id) {
  // Aqui só checamos o TIPO. Se o número não existir na tabela categorias,
  // quem barra é o banco (chave estrangeira) → errorHandler do index.js.
  if (!Number.isInteger(id)) return 'categoria_id deve ser um número inteiro (ou null)';
  return null;
}

function erroDescricao(descricao) {
  if (typeof descricao !== 'string') return 'descricao deve ser um texto (ou null)';
  return null;
}

// POST /produtos — criação: nome e preco obrigatórios; o resto é opcional.
export function validarProduto(req, res, next) {
  const { nome, descricao, preco, quantidade_estoque, categoria_id } = req.body;

  // Em vez de parar no primeiro problema, juntamos TODOS os erros num array
  // e devolvemos de uma vez. Quem consome a API corrige tudo numa tentativa só.
  const erros = [];

  if (nome === undefined) erros.push('nome é obrigatório');
  else if (erroNome(nome)) erros.push(erroNome(nome));

  if (preco === undefined) erros.push('preco é obrigatório');
  else if (erroPreco(preco)) erros.push(erroPreco(preco));

  // Opcionais: padrão "só valida se veio" (`!== undefined`). Descrição e
  // categoria_id aceitam null (produto sem descrição / sem categoria).
  if (quantidade_estoque !== undefined && erroEstoque(quantidade_estoque)) erros.push(erroEstoque(quantidade_estoque));
  if (descricao !== undefined && descricao !== null && erroDescricao(descricao)) erros.push(erroDescricao(descricao));
  if (categoria_id !== undefined && categoria_id !== null && erroCategoria(categoria_id)) erros.push(erroCategoria(categoria_id));

  if (erros.length > 0) return responderValidacao(res, erros);
  next(); // tudo certo: segue para o controller
}

// PATCH /produtos/:id — atualização PARCIAL: nenhum campo é obrigatório
// sozinho, mas pelo menos UM campo reconhecido precisa vir, e cada campo
// que vier precisa ter o tipo certo.
export function validarAtualizacaoProduto(req, res, next) {
  const { nome, descricao, preco, quantidade_estoque, categoria_id } = req.body;
  const erros = [];

  const enviados = Object.keys(req.body).filter((campo) => CAMPOS_PRODUTO.includes(campo));
  if (enviados.length === 0) {
    erros.push(`envie pelo menos um campo para atualizar (${CAMPOS_PRODUTO.join(', ')})`);
  }

  if (nome !== undefined && erroNome(nome)) erros.push(erroNome(nome));
  if (preco !== undefined && erroPreco(preco)) erros.push(erroPreco(preco));
  if (quantidade_estoque !== undefined && erroEstoque(quantidade_estoque)) erros.push(erroEstoque(quantidade_estoque));
  if (descricao !== undefined && descricao !== null && erroDescricao(descricao)) erros.push(erroDescricao(descricao));
  if (categoria_id !== undefined && categoria_id !== null && erroCategoria(categoria_id)) erros.push(erroCategoria(categoria_id));

  if (erros.length > 0) return responderValidacao(res, erros);
  next();
}
