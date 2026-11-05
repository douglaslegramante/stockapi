// utils/respostasErro.js
// Padrão ÚNICO de resposta de erro da API. Toda resposta de erro tem o formato:
//
//     { "erro": "mensagem curta" }                      ← erros simples
//     { "erro": "Dados inválidos", "detalhes": [ ... ] } ← validação com vários problemas
//
// Ou seja: quem consome a API SEMPRE encontra o texto principal em `erro`
// (uma string). O campo `detalhes` só existe quando há uma lista de problemas
// para mostrar (validação do corpo da requisição).
//
// Os middlewares de validação chamam esta função em vez de montar o JSON na
// mão — assim o formato mora em UM lugar só. Se ele mudar, muda aqui.

export function responderValidacao(res, detalhes) {
  // 400 Bad Request: o cliente mandou dados inválidos. A culpa não é do servidor.
  return res.status(400).json({ erro: 'Dados inválidos', detalhes });
}
