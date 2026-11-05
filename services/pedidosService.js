// services/pedidosService.js
// listarTodos e buscarPorId usam INNER JOIN com clientes, pra devolver o
// nome do cliente em vez de só o cliente_id (Encontro 06). criar,
// atualizarStatus e deletar completam o CRUD.

import pool from '../config/db.js';

export async function criar(pedido) {
  const { cliente_id, status } = pedido;

  const [resultado] = await pool.query(
    'INSERT INTO pedidos (cliente_id, status) VALUES (?, ?)',
    [cliente_id, status || 'pendente']
  );

  return resultado.insertId;
}

export async function listarTodos() {
  const [linhas] = await pool.query(
    `SELECT pedidos.id, pedidos.data_pedido, pedidos.status,
            clientes.nome AS cliente
     FROM pedidos
     INNER JOIN clientes
       ON pedidos.cliente_id = clientes.id`
  );
  return linhas;
}

export async function buscarPorId(id) {
  const [linhas] = await pool.query(
    `SELECT pedidos.id, pedidos.data_pedido, pedidos.status,
            clientes.nome AS cliente
     FROM pedidos
     INNER JOIN clientes
       ON pedidos.cliente_id = clientes.id
     WHERE pedidos.id = ?`,
    [id]
  );
  return linhas[0];
}

// Só o status é atualizável — mudar de cliente ou de data não faz
// sentido para um pedido que já existe.
export async function atualizarStatus(id, status) {
  const [resultado] = await pool.query(
    'UPDATE pedidos SET status = ? WHERE id = ?',
    [status, id]
  );
  return resultado.affectedRows;
}

// Se houver itens_pedido vinculados a este pedido, o MySQL recusa o
// DELETE (ER_ROW_IS_REFERENCED_2) — é a chave estrangeira de itens_pedido
// protegendo a integridade dos dados. Isso é esperado, não é um bug.
export async function deletar(id) {
  const [resultado] = await pool.query('DELETE FROM pedidos WHERE id = ?', [id]);
  return resultado.affectedRows;
}
