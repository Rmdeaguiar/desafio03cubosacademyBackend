const conexao = require('../conexao');

async function listarTransacoes(req, res) {
    const { usuario } = req;
    const { filtro } = req.query

    try {

        if (filtro) {
            let transacoesFiltradas = []
            for (let item of filtro) {
                const queryListarTransacoes = `select t.id, t.tipo, t.descricao, t.valor, t.data, t.usuario_id, t.categoria_id, c.descricao as categoria_nome from transacoes t
                left join categorias c on t.categoria_id = c.id
                where t.usuario_id = $1 and c.descricao = $2`;
                const listarTransacoes = await conexao.query(queryListarTransacoes, [usuario.id, item]);

                if (listarTransacoes.rowCount === 0) {
                    return res.status(500).json({ mensagem: 'Não foi possivel listar as transações' });
                };

                transacoesFiltradas = [...listarTransacoes.rows, ...transacoesFiltradas];
            };

            return res.status(200).json(transacoesFiltradas);
        };

        const query = `select t.id, t.tipo, t.descricao, t.valor, t.data, t.usuario_id, t.categoria_id, c.descricao as categoria_nome from transacoes t
        left join categorias c on t.categoria_id = c.id
        where t.usuario_id = $1`;
        const transacoes = await conexao.query(query, [usuario.id]);

        if (transacoes.rowCount === 0) {
            return res.status(200).json(transacoes.rows);
        }

        return res.json(transacoes.rows);

    } catch (error) {
        return res.status(400).json({ mensagem: 'Ocorreu um erro desconhecido - ' + error.message });

    }
}

async function detalharTransacao(req, res) {
    const { usuario } = req;
    const { id } = req.params;

    try {
        const query = `select t.id, t.tipo, t.descricao, t.valor, t.data, t.usuario_id, t.categoria_id, c.descricao as categoria_nome from transacoes t
        left join categorias c on t.categoria_id = c.id
        where t.id = $1 and t.usuario_id = $2`;

        const transacao = await conexao.query(query, [id, usuario.id]);

        if (transacao.rowCount === 0) {
            return res.status(400).json({ mensagem: 'Transação não encontrada' });
        }

        return res.status(200).json(transacao.rows[0]);

    } catch (error) {
        return res.status(400).json({ mensagem: 'Ocorreu um erro desconhecido - ' + error.message })

    }

}

async function cadastrarTransacao(req, res) {
    const { usuario } = req;
    const { tipo, descricao, valor, data, categoria_id } = req.body;


    if (!tipo || !descricao || !valor || !data || !categoria_id) {
        return res.status(400).json({ mensagem: 'Todos os campos devem ser informados' })
    }

    if (tipo !== 'entrada' && tipo !== 'saida') {
        return res.status(400).json({ mensagem: 'O tipo pode ser apenas entrada ou saída' });
    }


    try {
        const queryCategoria = 'select * from categorias where id = $1';
        const categoria = await conexao.query(queryCategoria, [categoria_id]);

        if (categoria.rowCount === 0) {
            return res.status(400).json({ mensagem: 'A categoria é inexistente' });
        }


        const queryCadastrar = 'insert into transacoes (descricao, valor, data, categoria_id, usuario_id, tipo) values ($1, $2, $3, $4, $5, $6)';

        const cadastrar = await conexao.query(queryCadastrar, [descricao, valor, data, categoria_id, usuario.id, tipo]);

        if (cadastrar.rowCount === 0) {
            return res.status(400).json({ mensagem: 'Não foi possível cadastrar esta transação' })
        }

        const queryTransacao = `select t.id, t.tipo, t.descricao, t.valor, t.data, t.usuario_id, t.categoria_id, c.descricao as categoria_nome from transacoes t
        left join categorias c on t.categoria_id = c.id
        where data = $1 and usuario_id = $2`
        const novaTransacao = await conexao.query(queryTransacao, [data, usuario.id])

        return res.status(201).json(novaTransacao.rows[0]);


    } catch (error) {
        return res.status(400).json({ mensagem: 'Ocorreu um erro desconhecido - ' + error.message })

    }

}

async function atualizarTransacao(req, res) {
    const { usuario } = req;
    const { id } = req.params;
    const { descricao, valor, data, categoria_id, tipo } = req.body;


    if (!tipo || !descricao || !valor || !data || !categoria_id) {
        return res.status(400).json({ mensagem: 'Todos os campos devem ser informados' })
    }

    if (tipo !== 'entrada' && tipo !== 'saida') {
        return res.status(400).json({ mensagem: 'O tipo pode ser apenas entrada ou saída' });
    }

    try {
        const query = 'select * from transacoes where id = $1 and usuario_id = $2';
        const transacao = await conexao.query(query, [id, usuario.id]);

        if (transacao.rowCount === 0) {
            return res.status(400).json({ mensagem: 'A transação não foi encontrada' });
        }

        const queryAtualizar = `update transacoes set tipo = $1, descricao = $2, valor = $3, data = $4, categoria_id = $5 where id = $6 and usuario_id = $7`;

        const transacaoAtualizada = await conexao.query(queryAtualizar, [tipo, descricao, valor, data, categoria_id, id, usuario.id]);

        if (transacaoAtualizada.rowCount === 0) {
            return res.status(400).json({ mensagem: 'Não foi possível atualizar esta transação' })
        }

        return res.status(200).json(204);



    } catch (error) {
        return res.status(400).json({ mensagem: 'Ocorreu um erro desconhecido - ' + error.message })

    }

}

async function deletarTransacao(req, res) {
    const { usuario } = req;
    const { id } = req.params;

    try {
        const query = 'select * from transacoes where id = $1 and usuario_id = $2';
        const transacao = await conexao.query(query, [id, usuario.id]);

        if (transacao.rowCount === 0) {
            return res.status(400).json({ mensagem: 'Não foi possível encontrar esta transação' })
        }

        const queryDeletar = 'delete from transacoes where id = $1 and usuario_id = $2';
        const transacaoDeletada = await conexao.query(queryDeletar, [id, usuario.id]);

        if (transacaoDeletada.rowCount === 0) {
            return res.status(400).json({ mensagem: 'Não foi possível deletar esta transação' })
        }

        return res.status(204).json()

    } catch (error) {
        return res.status(400).json({ mensagem: 'Ocorreu um erro desconhecido - ' + error.message });

    }

}

async function obterExtrato(req, res) {
    const { usuario } = req;

    try {
        const queryEntrada = "select sum(valor) from transacoes where usuario_id = $1 and tipo = 'entrada'";
        const entrada = await conexao.query(queryEntrada, [usuario.id]);

        const querySaida = "select sum(valor) from transacoes where usuario_id = $1 and tipo = 'saida'";
        const saida = await conexao.query(querySaida, [usuario.id]);

        const resultado = {
            entrada: entrada.rows[0].sum,
            saida: saida.rows[0].sum
        };

        return res.status(200).json(resultado);
    } catch (error) {
        return res.status(500).json({ mensagem: `Ocorreu um erro desconhecido ${error.message}` });
    }

}

module.exports = {
    listarTransacoes,
    detalharTransacao,
    cadastrarTransacao,
    atualizarTransacao,
    deletarTransacao,
    obterExtrato
}