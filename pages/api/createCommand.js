const { sequelize } = require('../../models');

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { FK_ID_NFCT, COMANDO } = req.body;

    if (!FK_ID_NFCT || !COMANDO) {
      return res.status(400).json({ message: 'FK_ID_NFCT e COMANDO são obrigatórios' });
    }

    try {
      const query = `
        INSERT INTO B_BB_COMANDO (FK_ID_NFCT, DT_INCLUSAO, COMANDO, PROCESSADO)
        VALUES (:FK_ID_NFCT, NOW(), :COMANDO, false)
      `;

      const [results, metadata] = await sequelize.query(query, {
        replacements: { FK_ID_NFCT, COMANDO },
        type: sequelize.QueryTypes.INSERT
      });

      return res.status(201).json({ message: 'Comando criado com sucesso', id: metadata.insertId });
    } catch (error) {
      console.error('Erro ao criar comando:', error.message);
      return res.status(500).json({ error: error.message });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
