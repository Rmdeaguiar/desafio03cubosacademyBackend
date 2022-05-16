const conexao = require('../conexao');

async function listarCategorias(req, res) {
    const { usuario } = req;

    try {

        const query = 'select * from categorias'

        const categorias = await conexao.query(query);

        if (categorias.rowCount === 0) {
            return res.status(400).json({ mensagem: 'Não foi possível encontrar nenhuma categoria' });
        }

        return res.status(200).json(categorias.rows);


    } catch (error) {
        return res.status(400).json({ mensagem: 'Ocorreu um erro desconhecido - ' + error.message })

    }

}

module.exports = { listarCategorias }