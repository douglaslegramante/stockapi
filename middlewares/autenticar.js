// middlewares/autenticar.js
// Barreira de autenticação. Colocado numa rota, ele só deixa a requisição
// passar se ela trouxer um token JWT válido no header:
//
//     Authorization: Bearer <token>
//
// O token é obtido em POST /api/usuarios/login.

import jwt from 'jsonwebtoken';
import 'dotenv/config';

export function autenticar(req, res, next) {
  // O header chega assim: "Bearer eyJhbGciOi..."
  const cabecalho = req.headers.authorization;

  // 401 Unauthorized: "não sei quem você é". Aqui, nem enviou token.
  if (!cabecalho) {
    return res.status(401).json({ erro: 'sem token' });
  }

  // split(' ') separa "Bearer" do token; o token é a segunda parte.
  const token = cabecalho.split(' ')[1];

  try {
    // jwt.verify confere a assinatura (feita com JWT_SECRET) e a validade.
    // Se o token for falso, adulterado ou estiver expirado, LANÇA um erro.
    const dados = jwt.verify(token, process.env.JWT_SECRET);

    // Guardamos quem é o usuário em req.usuario: o controller (ou o próximo
    // middleware) pode usar isso se precisar.
    req.usuario = dados;

    next(); // token ok: segue para o controller
  } catch (erro) {
    return res.status(401).json({ erro: 'token invalido' });
  }
}
