// controllers/pedidosController.js
// Mesmo padrão dos outros controllers. A diferença está no PUT: aqui só o
// status muda (service.atualizarStatus), por isso a resposta é { id, status }.

import * as service from '../services/pedidosService.js';

// POST /api/pedidos
// Só cliente_id é obrigatório; o status padrão ("pendente") é definido no service.
// Se o cliente_id não existir, o MySQL lança ER_NO_REFERENCED_ROW_2 → 400.
export async function criar(req, res, next) {
  try {
    const id = await service.criar(req.body);
    res.status(201).json({ id, ...req.body });
  } catch (erro) {
    next(erro);
  }
}


// GET /api/pedidos
// Já vem com o NOME do cliente (INNER JOIN no service).
export async function listar(req, res, next) {
  try {
    const pedidos = await service.listarTodos();
    res.json(pedidos);
  } catch (erro) {
    next(erro);
  }
}


// GET /api/pedidos/:id
export async function buscarPorId(req, res, next) {
  try {
    const { id } = req.params;
    const pedido = await service.buscarPorId(id);

    if (!pedido) {
      return res.status(404).json({ erro: 'Pedido não encontrado' });
    }

    res.json(pedido);
  } catch (erro) {
    next(erro);
  }
}


// PUT /api/pedidos/:id
// Pedido só tem o STATUS atualizável (ver validarAtualizacaoPedido).
// Mudar o cliente ou a data de um pedido existente não faz sentido.
export async function atualizar(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const pedidoExistente = await service.buscarPorId(id);
    if (!pedidoExistente) {
      return res.status(404).json({ erro: 'Pedido não encontrado' });
    }

    await service.atualizarStatus(id, status);
    res.json({ id: Number(id), status }); // Number(id): o id da URL é texto; na resposta queremos o número
  } catch (erro) {
    next(erro);
  }
}


// DELETE /api/pedidos/:id
// Pedido com itens_pedido vinculados não pode ser apagado (veja o catch).
export async function deletar(req, res, next) {
  try {
    const { id } = req.params;
    const linhasRemovidas = await service.deletar(id);

    if (linhasRemovidas === 0) {
      return res.status(404).json({ erro: 'Pedido não encontrado' });
    }

    res.status(204).send();
  } catch (erro) {
    // Se o pedido tiver itens_pedido vinculados, o erro cai aqui —
    // o errorHandler central (index.js) que decide a resposta.
    next(erro);
  }
}
