// controllers/categoriasController.js
// Recebe a requisição (req), chama o service e decide a resposta (res).
// Mesmo desenho do controller de produtos — só muda a entidade.
// Todo erro inesperado vai para next(erro) e é tratado no index.js.

import * as service from '../services/categoriasService.js';

// POST /api/categorias
export async function criar(req, res, next) {
  try {
    const id = await service.criar(req.body);
    res.status(201).json({ id, ...req.body }); // 201 Created
  } catch (erro) {
    next(erro);
  }
}

// GET /api/categorias
export async function listar(req, res, next) {
  try {
    const categorias = await service.listarTodos();
    res.json(categorias);
  } catch (erro) {
    next(erro);
  }
}

// GET /api/categorias/:id
export async function buscarPorId(req, res, next) {
  try {
    const { id } = req.params;
    const categoria = await service.buscarPorId(id);

    if (!categoria) {
      return res.status(404).json({ erro: 'Categoria não encontrada' });
    }

    res.json(categoria);
  } catch (erro) {
    next(erro);
  }
}

// PUT /api/categorias/:id
export async function atualizar(req, res, next) {
  try {
    const { id } = req.params;

    // Busca ANTES de atualizar (e não confere affectedRows depois): um
    // UPDATE que não muda nenhum valor devolve affectedRows = 0 mesmo com
    // o registro existindo, e isso viraria um 404 errado.
    const categoriaExistente = await service.buscarPorId(id);
    if (!categoriaExistente) {
      return res.status(404).json({ erro: 'Categoria não encontrada' });
    }

    await service.atualizar(id, req.body);

    // Number(id): o id vem da URL como texto ("3"); na resposta queremos o número 3.
    res.json({ id: Number(id), ...req.body });
  } catch (erro) {
    next(erro);
  }
}

// DELETE /api/categorias/:id   (rota protegida: exige token)
export async function deletar(req, res, next) {
  try {
    const { id } = req.params;
    const linhasRemovidas = await service.deletar(id);

    if (linhasRemovidas === 0) {
      return res.status(404).json({ erro: 'Categoria não encontrada' });
    }

    res.status(204).send(); // 204 No Content
  } catch (erro) {
    // Categoria com produtos vinculados: erro do MySQL → errorHandler → 400.
    next(erro);
  }
}
