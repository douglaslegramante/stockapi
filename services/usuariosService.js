// services/usuariosService.js
// SQL da tabela usuarios. Repare: a senha NUNCA é guardada em texto puro,
// só o hash (senha_hash). Quem gera e confere o hash é o controller (bcrypt);
// o service só grava e lê o que recebe.

import pool from '../config/db.js';

// Grava um usuário novo. Se o e-mail já existir, o MySQL lança o erro
// ER_DUP_ENTRY (a coluna email é UNIQUE) — o controller trata esse caso.
export async function criar({ nome, email, senhaHash }) {
  const [resultado] = await pool.query(
    'INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)',
    [nome, email, senhaHash]
  );
  return resultado.insertId;
}

// Usada no login: procura o usuário pelo e-mail.
// Devolve a linha completa (com senha_hash) ou undefined se não existir.
export async function buscarPorEmail(email) {
  const [linhas] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
  return linhas[0];
}
