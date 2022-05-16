const conexao = require('../conexao');
const jwt = require('jsonwebtoken')
const segredo = require('../segredo');

async function verificarLogin(req, res, next) {
    const { authorization } = req.headers;



    if (!authorization) {
        return res.status(401).json({ mensagem: 'Para acessar este recurso um token de autenticação válido deve ser enviado.' })
    }

    try {
        const token = authorization.replace('Bearer ', '').trim();

        const { id } = await jwt.verify(token, segredo);

        const queryUsuario = 'select * from usuarios where id = $1';

        const usuarioEncontrado = await conexao.query(queryUsuario, [id]);

        if (usuarioEncontrado.rowCount === 0) {
            return res.status(404).json({ mensagem: 'O usuário não foi encontrado.' });
        }

        const queryResposta = 'select id, nome, email from usuarios where id = $1';
        const usuarioResposta = await conexao.query(queryResposta, [id]);

        req.usuario = usuarioResposta.rows[0];

        next();

    } catch (error) {
        return res.status(500).json(error.message);
    }

}

module.exports = { verificarLogin }