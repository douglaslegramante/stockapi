// services/categoriasService.js
// Camada de acesso ao banco para a tabela categorias. Só SQL aqui:
// nada de req, res ou status code (isso é assunto do controller).
//
// categorias é a tabela mais simples do projeto: não tem chave estrangeira.
// Quem aponta PARA ela é produtos (produtos.categoria_id).

import pool from '../config/db.js';

// INSERT — devolve o id gerado pelo AUTO_INCREMENT.
export async function criar(categoria) {
  const { nome } = categoria;

  const [resultado] = await pool.query(
    'INSERT INTO categorias (nome) VALUES (?)',
    [nome]
  );

  return resultado.insertId;
}

// SELECT * — sem JOIN, porque a categoria não depende de nenhuma outra tabela.
export async function listarTodos() {
  const [linhas] = await pool.query('SELECT * FROM categorias');
  return linhas;
}

// Devolve a categoria, ou undefined se o id não existir (o controller vira 404).
export async function buscarPorId(id) {
  const [linhas] = await pool.query('SELECT * FROM categorias WHERE id = ?', [id]);
  return linhas[0];
}

// UPDATE — PUT substitui o registro inteiro; aqui o "inteiro" é só o nome.
export async function atualizar(id, categoria) {
  const { nome } = categoria;

  const [resultado] = await pool.query(
    'UPDATE categorias SET nome = ? WHERE id = ?',
    [nome, id]
  );

  return resultado.affectedRows;
}

// DELETE — se existir algum produto usando esta categoria, o MySQL recusa
// (ER_ROW_IS_REFERENCED_2) e o errorHandler do index.js responde 400.
// Isso protege os produtos de ficarem apontando para uma categoria que sumiu.
export async function deletar(id) {
  const [resultado] = await pool.query('DELETE FROM categorias WHERE id = ?', [id]);
  return resultado.affectedRows;
}
