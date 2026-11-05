-- database/seed.sql  (OPCIONAL)
-- Dados de exemplo para testar a API sem cadastrar tudo na mão.
-- Execute DEPOIS do schema.sql, com as tabelas vazias:
--     mysql -u root -p stockapi < database/seed.sql
--
-- Os ids (1, 2, 3...) dependem do AUTO_INCREMENT. Se você já cadastrou
-- dados antes, os números abaixo podem não bater com os ids reais — nesse
-- caso, apague as tabelas (ou recrie o banco) e rode schema.sql + seed.sql
-- de novo.
--
-- Não há usuários aqui: a senha precisa passar pelo bcrypt, então o usuário
-- deve ser criado pela própria API (POST /api/usuarios/registro).

USE stockapi;

INSERT INTO categorias (nome) VALUES
  ('Papelaria'),   -- id 1
  ('Informática'), -- id 2
  ('Limpeza');     -- id 3 (começa sem produtos: dá para apagar sem erro)

INSERT INTO clientes (nome, email, telefone) VALUES
  ('Maria Souza', 'maria@exemplo.com', '69 99999-0001'), -- id 1
  ('João Lima',   'joao@exemplo.com',  NULL),            -- id 2
  ('Ana Castro',  NULL,                NULL);            -- id 3 (sem pedidos)

INSERT INTO produtos (nome, descricao, preco, quantidade_estoque, categoria_id) VALUES
  ('Caderno 96 folhas', 'Capa dura',          15.90, 40, 1), -- id 1
  ('Caneta azul',       NULL,                  2.50, 200, 1), -- id 2
  ('Mouse USB',         'Óptico, 1000 dpi',   35.00, 15, 2), -- id 3
  ('Pendrive 32 GB',    NULL,                 29.90, 0,  2), -- id 4
  ('Produto sem categoria', 'Para testar LEFT JOIN', 9.99, 5, NULL); -- id 5

INSERT INTO pedidos (cliente_id, status) VALUES
  (1, 'pendente'), -- id 1
  (2, 'pago');     -- id 2

INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES
  (1, 1, 2, 15.90), -- pedido 1: 2 cadernos
  (1, 2, 5,  2.50), -- pedido 1: 5 canetas
  (2, 3, 1, 35.00); -- pedido 2: 1 mouse
