const express = require('express');
const { cadastrarUsuario, loginUsuario, detalharUsuario, atualizarUsuario } = require('./controladores/usuarios');
const { verificarLogin } = require('./intermediarios/verificarLogin');
const { listarTransacoes, detalharTransacao, cadastrarTransacao, atualizarTransacao, deletarTransacao, obterExtrato } = require('./controladores/transacoes');
const { listarCategorias } = require('./controladores/categorias');

const rotas = express();


rotas.post('/usuarios', cadastrarUsuario);
rotas.post('/login', loginUsuario);

rotas.use(verificarLogin);

rotas.get('/usuario', detalharUsuario);
rotas.put('/usuario', atualizarUsuario);

rotas.get('/categoria', listarCategorias);

rotas.get('/transacao', listarTransacoes);
rotas.get('/transacao/extrato', obterExtrato);
rotas.get('/transacao/:id', detalharTransacao);
rotas.post('/transacao', cadastrarTransacao);
rotas.put('/transacao/:id', atualizarTransacao);
rotas.delete('/transacao/:id', deletarTransacao);


module.exports = rotas;