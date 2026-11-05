// controllers/itensPedidoController.js
// Mesmo padrão dos outros controllers. itens_pedido tem DUAS chaves
// estrangeiras (pedido_id e produto_id); se qualquer uma apontar para um
// registro que não existe, o banco lança ER_NO_REFERENCED_ROW_2 e o
// errorHandler do index.js responde 400.

import * as service from '../services/itensPedidoService.js';

// POST /api/itens_pedido
// Exige pedido_id, produto_id, quantidade e preco_unitario.
export async function criar(req, res, next) {
  try {
    const id = await service.criar(req.body);
    res.status(201).json({ id, ...req.body });
  } catch (erro) {
    // pedido_id ou produto_id inexistente cai aqui como ER_NO_REFERENCED_ROW_2;
    // o errorHandler (index.js) transforma em 400.
    next(erro);
  }
}


// GET /api/itens_pedido
// Já vem com o nome do produto e o status do pedido (dois INNER JOIN).
export async function listar(req, res, next) {
  try {
    const itens = await service.listarTodos();
    res.json(itens);
  } catch (erro) {
    next(erro);
  }
}


// GET /api/itens_pedido/:id
export async function buscarPorId(req, res, next) {
  try {
    const { id } = req.params;
    const item = await service.buscarPorId(id);

    if (!item) {
      return res.status(404).json({ erro: 'Item de pedido não encontrado' });
    }

    res.json(item);
  } catch (erro) {
    next(erro);
  }
}


// PATCH /api/itens_pedido/:id
// Atualização PARCIAL: quantidade e/ou preco_unitario (pedido_id e produto_id
// não mudam). Devolve o item completo, como está agora, com os dados dos JOINs.
export async function atualizar(req, res, next) {
  try {
    const { id } = req.params;

    const itemExistente = await service.buscarPorId(id);
    if (!itemExistente) {
      return res.status(404).json({ erro: 'Item de pedido não encontrado' });
    }

    await service.atualizar(id, req.body);

    const itemAtualizado = await service.buscarPorId(id);
    res.json(itemAtualizado);
  } catch (erro) {
    next(erro);
  }
}


// DELETE /api/itens_pedido/:id
// Item não é referenciado por nenhuma outra tabela: apaga sem restrição.
export async function deletar(req, res, next) {
  try {
    const { id } = req.params;
    const linhasRemovidas = await service.deletar(id);

    if (linhasRemovidas === 0) {
      return res.status(404).json({ erro: 'Item de pedido não encontrado' });
    }

    res.status(204).send();
  } catch (erro) {
    next(erro);
  }
}
