// services/clientesService.js
// Mesma responsabilidade dos outros services: só SQL, nada de req/res aqui.

import pool from '../config/db.js';
import { montarAtualizacao } from '../utils/montarAtualizacao.js';

// Colunas que o PATCH pode alterar (whitelist). id nunca entra aqui.
const CAMPOS_ATUALIZAVEIS = ['nome', 'email', 'telefone'];

export async function criar(cliente) {
  const { nome, email, telefone } = cliente;

  const [resultado] = await pool.query(
    'INSERT INTO clientes (nome, email, telefone) VALUES (?, ?, ?)',
    [nome, email ?? null, telefone ?? null]
  );

  return resultado.insertId;
}

export async function listarTodos() {
  const [linhas] = await pool.query('SELECT * FROM clientes');
  return linhas;
}

export async function buscarPorId(id) {
  const [linhas] = await pool.query('SELECT * FROM clientes WHERE id = ?', [id]);
  return linhas[0];
}

// UPDATE parcial (PATCH): só os campos enviados são alterados.
// Para APAGAR o e-mail ou o telefone, envie o campo com valor null.
// O SQL é montado conforme o corpo (veja utils/montarAtualizacao.js).
export async function atualizar(id, campos) {
  const { setClause, valores } = montarAtualizacao(campos, CAMPOS_ATUALIZAVEIS);

  const [resultado] = await pool.query(
    `UPDATE clientes SET ${setClause} WHERE id = ?`,
    [...valores, id]
  );

  return resultado.affectedRows;
}

export async function deletar(id) {
  const [resultado] = await pool.query('DELETE FROM clientes WHERE id = ?', [id]);
  return resultado.affectedRows;
}
