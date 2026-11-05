// utils/montarAtualizacao.js
// Ajuda a construir o UPDATE dos PATCH (atualização PARCIAL).
//
// No PATCH, o cliente envia só os campos que quer mudar. Então o SQL não pode
// ser fixo: "UPDATE produtos SET nome = ?, preco = ? ..." serve para um corpo
// com nome e preço, mas não para um corpo só com o preço. A solução é montar
// o pedaço "SET ..." de acordo com o que veio.
//
// Exemplo:
//   montarAtualizacao({ preco: 20, foo: 1 }, ['nome', 'preco'])
//   → { setClause: 'preco = ?', valores: [20] }     (foo é ignorado)

export function montarAtualizacao(corpo, camposPermitidos) {
  // 1) WHITELIST: só entram campos que (a) vieram no corpo e (b) estão na
  //    lista fixa de colunas permitidas. Isso é o que torna SEGURO colocar o
  //    nome do campo dentro da string do SQL: nunca entra um nome de coluna
  //    escolhido pelo cliente, então não há brecha para SQL Injection pelo
  //    nome do campo.
  const campos = Object.keys(corpo).filter((campo) => camposPermitidos.includes(campo));

  // 2) Um pedaço "campo = ?" para cada campo que sobrou, separados por vírgula.
  const setClause = campos.map((campo) => `${campo} = ?`).join(', ');

  // 3) Os VALORES continuam indo por parâmetro (?), nunca concatenados na
  //    string. Só o NOME da coluna (já filtrado pela whitelist) entra direto.
  const valores = campos.map((campo) => corpo[campo]);

  return { setClause, valores };
}
