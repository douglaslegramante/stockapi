// middlewares/validarCategoria.js
// Usado no POST e no PUT de categorias. O único requisito é o nome:
// obrigatório, texto, não vazio (nem só espaços) e de até 60 caracteres
// (categorias.nome é VARCHAR(60)).
//
// Categoria usa PUT (e não PATCH) porque só tem UM campo editável: não existe
// "atualização parcial" de uma tabela com uma coluna só.

import { responderValidacao } from '../utils/respostasErro.js';

const NOME_MAX = 60;

export function validarCategoria(req, res, next) {
  const { nome } = req.body;
  const erros = [];

  if (nome === undefined) {
    erros.push('nome é obrigatório');
  } else if (typeof nome !== 'string' || !nome.trim()) {
    erros.push('nome deve ser um texto não vazio');
  } else if (nome.length > NOME_MAX) {
    erros.push(`nome deve ter no máximo ${NOME_MAX} caracteres`);
  }

  if (erros.length > 0) return responderValidacao(res, erros);
  next();
}
