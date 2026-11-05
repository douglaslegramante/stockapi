// services/produtosService.js
// O service é a camada que conversa com o banco. Aqui só existe SQL e
// acesso ao pool: nada de req, res ou status code — isso é assunto do
// controller. Por isso as funções recebem dados simples (um objeto, um id)
// e devolvem dados simples (um id, uma lista, um número).

import pool from '../config/db.js';
import { montarAtualizacao } from '../utils/montarAtualizacao.js';

// Colunas que o PATCH pode alterar (whitelist). id nunca entra aqui.
const CAMPOS_ATUALIZAVEIS = ['nome', 'descricao', 'preco', 'quantidade_estoque', 'categoria_id'];

// Os pontos de interrogação (?) são "parâmetros": o mysql2 troca cada ?
// pelo valor correspondente do array, já com a proteção necessária.
// NUNCA concatene valores direto na string do SQL (`... WHERE id = ${id}`):
// isso abre a porta para SQL Injection.

// INSERT — devolve o id gerado pelo AUTO_INCREMENT.
export async function criar(produto) {
  const { nome, descricao, preco, quantidade_estoque, categoria_id } = produto;

  // O operador ?? ("se for undefined ou null, use o valor da direita") cuida
  // dos campos opcionais: sem descrição vira NULL no banco, sem estoque vira 0.
  const [resultado] = await pool.query(
    `INSERT INTO produtos (nome, descricao, preco, quantidade_estoque, categoria_id)
     VALUES (?, ?, ?, ?, ?)`,
    [nome, descricao ?? null, preco, quantidade_estoque ?? 0, categoria_id ?? null]
  );

  return resultado.insertId;
}

// SELECT com LEFT JOIN: traz o NOME da categoria junto, em vez de só o id.
// Por que LEFT e não INNER? Porque categoria_id pode ser NULL (produto sem
// categoria). Com INNER JOIN esses produtos sumiriam da listagem; com
// LEFT JOIN eles aparecem, com categoria = null.
export async function listarTodos() {
  const [linhas] = await pool.query(
    `SELECT produtos.id, produtos.nome, produtos.descricao, produtos.preco,
            produtos.quantidade_estoque, categorias.nome AS categoria
     FROM produtos
     LEFT JOIN categorias
       ON produtos.categoria_id = categorias.id`
  );
  return linhas;
}

// Mesmo SELECT, filtrado por id. O resultado é sempre um array de linhas;
// como o id é único, pegamos a primeira (linhas[0]). Se não achou nada,
// linhas[0] é undefined — e o controller transforma isso em 404.
export async function buscarPorId(id) {
  const [linhas] = await pool.query(
    `SELECT produtos.id, produtos.nome, produtos.descricao, produtos.preco,
            produtos.quantidade_estoque, categorias.nome AS categoria
     FROM produtos
     LEFT JOIN categorias
       ON produtos.categoria_id = categorias.id
     WHERE produtos.id = ?`,
    [id]
  );
  return linhas[0];
}

// UPDATE parcial (usado pelo PATCH): só os campos que vieram no corpo são
// alterados; o resto fica como está no banco. Por isso o SQL é MONTADO
// conforme o corpo — veja utils/montarAtualizacao.js para a explicação.
//
// ATENÇÃO ao WHERE: sem ele, o UPDATE alteraria TODOS os produtos da tabela.
export async function atualizar(id, campos) {
  const { setClause, valores } = montarAtualizacao(campos, CAMPOS_ATUALIZAVEIS);

  const [resultado] = await pool.query(
    `UPDATE produtos SET ${setClause} WHERE id = ?`,
    [...valores, id]
  );

  return resultado.affectedRows;
}

// DELETE — devolve quantas linhas foram removidas (0 ou 1).
// Se o produto estiver em algum itens_pedido, o MySQL recusa
// (ER_ROW_IS_REFERENCED_2) e o errorHandler do index.js responde.
export async function deletar(id) {
  const [resultado] = await pool.query('DELETE FROM produtos WHERE id = ?', [id]);
  return resultado.affectedRows;
}
