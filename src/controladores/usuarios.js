const conexao = require('../conexao');
const jwt = require('jsonwebtoken')
const segredo = require('../segredo');
const securePassword = require('secure-password');
const pwd = securePassword();


async function cadastrarUsuario(req, res) {
    const { nome, email, senha } = req.body

    if (!nome || !email || !senha) {
        return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios!' })
    }

    try {
        const queryValidacao = 'select * from usuarios where email = $1';
        const usuarioValidacao = await conexao.query(queryValidacao, [email]);


        if (usuarioValidacao.rowCount > 0) {
            return res.status(400).json({ mensagem: 'Já existe usuário cadastrado com o e-mail informado.' });
        }

        const hash = (await pwd.hash(Buffer.from(senha))).toString('hex')

        const queryCadastro = 'insert into usuarios (nome, email, senha) values ($1, $2, $3)';
        const usuarioCadastro = await conexao.query(queryCadastro, [nome, email, hash]);

        if (usuarioCadastro.rowCount === 0) {
            return res.status(400).json('Não foi possível cadastrar este usuario');
        }

        const queryResposta = 'select id, nome, email from usuarios where email = $1';
        const usuarioResposta = await conexao.query(queryResposta, [email]);


        return res.status(201).json(usuarioResposta.rows[0]);


    } catch (error) {
        return res.status(400).json({ mensagem: 'Ocorreu um erro desconhecido - ' + error.message })
    }

}


async function loginUsuario(req, res) {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios!' })
    }

    try {
        const queryValidacao = 'select * from usuarios where email = $1';
        const usuarios = await conexao.query(queryValidacao, [email]);

        if (usuarios.rowCount === 0) {
            return res.status(400).json('O email ou a senha estão incorretos');
        }

        const usuario = usuarios.rows[0];

        const resultado = await pwd.verify(Buffer.from(senha), Buffer.from(usuario.senha, "hex"));

        switch (resultado) {
            case securePassword.INVALID_UNRECOGNIZED_HASH:
            case securePassword.INVALID:
                return res.status(400).json("Email ou senha incorretos.");
            case securePassword.VALID:
                break;
            case securePassword.VALID_NEEDS_REHASH:
                try {
                    const hash = (await pwd.hash(Buffer.from(senha))).toString("hex");
                    const query = 'update usuarios set senha = $1 where email = $2';
                    await conexao.query(query, [hash, email]);
                } catch {
                }
                break;
        }

        const token = jwt.sign({
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email
        }, segredo);

        const usuarioRetornado = { usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email }, token: token };

        return res.status(200).json(usuarioRetornado);

    } catch (error) {
        return res.status(400).json({ mensagem: 'Ocorreu um erro desconhecido - ' + error.message })
    }

}

async function detalharUsuario(req, res) {
    const { usuario } = req;

    try {
        return res.status(200).json(usuario);
    } catch (error) {
        return res.status(400).json(error.message);

    }

}

async function atualizarUsuario(req, res) {
    const { usuario } = req;
    const { nome, email, senha } = req.body

    if (!nome || !email || !senha) {
        return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios!' })
    }

    try {
        const queryValidacao = 'select * from usuarios where email = $1';
        const usuarioValidacao = await conexao.query(queryValidacao, [email]);

        if (usuarioValidacao.rowCount > 0) {
            return res.status(400).json({ mensagem: 'Já existe usuário cadastrado com o e-mail informado.' });
        }

        const hash = (await pwd.hash(Buffer.from(senha))).toString('hex')

        const queryAtualizar = 'update usuarios set nome = $1, email = $2, senha = $3 where id = $4';
        const usuarioAtualizado = await conexao.query(queryAtualizar, [nome, email, hash, usuario.id]);

        if (usuarioAtualizado.rowCount === 0) {
            return res.status(400).json('Não foi possível atualizar este usuario');
        }


        return res.status(204).json();


    } catch (error) {
        return res.status(400).json({ mensagem: 'Ocorreu um erro desconhecido - ' + error.message })
    }




}





module.exports = {
    cadastrarUsuario,
    loginUsuario,
    detalharUsuario,
    atualizarUsuario
}