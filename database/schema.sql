-- database/schema.sql
-- StockAPI — Desenvolvimento Back-end II
--
-- Como executar (no terminal, dentro da pasta do projeto):
--     mysql -u root -p < database/schema.sql
-- ou abra este arquivo no MySQL Workbench e execute tudo.
--
-- "IF NOT EXISTS" permite rodar o script mais de uma vez sem erro: se a
-- tabela já existe, o MySQL simplesmente a mantém (e os dados também).
--
-- A ORDEM das tabelas importa: uma tabela com FOREIGN KEY só pode ser criada
-- DEPOIS da tabela que ela referencia.
--
--   categorias ──< produtos >──< itens_pedido >── pedidos >── clientes
--   usuarios (independente: só serve para login)

CREATE DATABASE IF NOT EXISTS stockapi;
USE stockapi;

-- ------------------------------------------------------
-- categorias — não depende de ninguém
-- ------------------------------------------------------
CREATE TABLE IF NOT EXISTS categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,        -- gerado pelo banco: 1, 2, 3...
  nome VARCHAR(60) NOT NULL
);

-- ------------------------------------------------------
-- clientes — não depende de ninguém
-- email e telefone são opcionais (aceitam NULL)
-- ------------------------------------------------------
CREATE TABLE IF NOT EXISTS clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(120),
  telefone VARCHAR(20)
);

-- ------------------------------------------------------
-- usuarios — quem pode fazer login na API (independente das demais)
-- email UNIQUE: o banco não deixa cadastrar dois usuários com o mesmo e-mail
-- senha_hash: guarda o HASH da senha (bcrypt), nunca a senha em texto puro
-- ------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------
-- produtos — depende de categorias
-- categoria_id aceita NULL (produto sem categoria) → por isso a API usa
-- LEFT JOIN ao listar produtos
-- ------------------------------------------------------
CREATE TABLE IF NOT EXISTS produtos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  preco DECIMAL(10,2) NOT NULL,
  quantidade_estoque INT NOT NULL DEFAULT 0,
  categoria_id INT,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

-- ------------------------------------------------------
-- pedidos — depende de clientes
-- status começa como 'pendente' se nada for informado
-- ------------------------------------------------------
CREATE TABLE IF NOT EXISTS pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT,
  data_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pendente',
  FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

-- ------------------------------------------------------
-- itens_pedido — tabela associativa: resolve a relação N:N entre pedidos
-- e produtos (um pedido tem vários produtos; um produto está em vários
-- pedidos). Depende das DUAS tabelas.
-- preco_unitario guarda o preço NO MOMENTO da compra, mesmo que o preço do
-- produto mude depois.
-- ------------------------------------------------------
CREATE TABLE IF NOT EXISTS itens_pedido (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT,
  produto_id INT,
  quantidade INT NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
  FOREIGN KEY (produto_id) REFERENCES produtos(id)
);
