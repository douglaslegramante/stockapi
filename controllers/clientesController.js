// controllers/clientesController.js
// Mesmo padrão de produtosController.js: nenhuma query SQL aqui, sempre
// next(erro) no catch, e atualizar confere existência ANTES de agir
// (evita o mesmo bug de affectedRows já visto em produtos).
// clientes não tem chave estrangeira, então não há JOIN nem erro de referência
// na criação — só na remoção, se o cliente tiver pedidos.

import * as service from '../services/clientesService.js';

// POST /api/clientes
// O corpo já foi validado por validarCliente (aplicado na rota).
// 201 Created + o cliente com o id gerado pelo banco.
export async function criar(req, res, next) {
  try {
    const id = await service.criar(req.body);
    res.status(201).json({ id, ...req.body });
  } catch (erro) {
    next(erro);
  }
}


// GET /api/clientes
export async function listar(req, res, next) {
  try {
    const clientes = await service.listarTodos();
    res.json(clientes);
  } catch (erro) {
    next(erro);
  }
}


// GET /api/clientes/:id
// 404 se o id não existir.
export async function buscarPorId(req, res, next) {
  try {
    const { id } = req.params;
    const cliente = await service.buscarPorId(id);

    if (!cliente) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }

    res.json(cliente);
  } catch (erro) {
    next(erro);
  }
}


// PATCH /api/clientes/:id
// Atualização PARCIAL: só os campos enviados mudam. Busca ANTES de atualizar
// (um UPDATE sem mudança real devolve affectedRows = 0 mesmo com o registro
// existindo) e devolve o cliente completo depois, buscando de novo.
export async function atualizar(req, res, next) {
  try {
    const { id } = req.params;

    const clienteExistente = await service.buscarPorId(id);
    if (!clienteExistente) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }

    await service.atualizar(id, req.body);

    // Como o corpo é parcial, devolvemos o cliente completo, como está agora.
    const clienteAtualizado = await service.buscarPorId(id);
    res.json(clienteAtualizado);
  } catch (erro) {
    next(erro);
  }
}


// DELETE /api/clientes/:id
// Cliente que já tem pedidos não pode ser apagado: o MySQL recusa
// (ER_ROW_IS_REFERENCED_2) e o errorHandler do index.js responde 400.
export async function deletar(req, res, next) {
  try {
    const { id } = req.params;
    const linhasRemovidas = await service.deletar(id);

    if (linhasRemovidas === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }

    res.status(204).send();
  } catch (erro) {
    next(erro);
  }
}
