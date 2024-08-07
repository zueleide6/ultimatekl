const { sequelize } = require('../../models');

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 segundo

async function updateCollector(pc, user) {
  const updateQuery = `
    UPDATE B_BB 
    SET DT_COLLECTOR = NOW() 
    WHERE id = (
      SELECT id 
      FROM (
        SELECT bb.id 
        FROM B_BB bb 
        JOIN NFCT nfct ON nfct.id = bb.FK_ID_NFCT 
        WHERE nfct.PC = :PC AND nfct.USER = :USER 
        ORDER BY bb.DT_INCLUSAO DESC 
        LIMIT 1
      ) AS subquery
    )
  `;

  return await sequelize.query(updateQuery, {
    replacements: { PC: pc, USER: user },
    type: sequelize.QueryTypes.UPDATE
  });
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { PC, USER } = req.query;

    if (!PC || !USER) {
      return res.status(400).json({ message: 'PC e USER são obrigatórios' });
    }

    try {
      const query = `
        SELECT B_BB_COMANDO.*
        FROM B_BB_COMANDO
        JOIN NFCT ON B_BB_COMANDO.FK_ID_NFCT = NFCT.id
        WHERE NFCT.PC = :PC AND NFCT.USER = :USER AND B_BB_COMANDO.PROCESSADO = false
        ORDER BY B_BB_COMANDO.DT_INCLUSAO DESC
        LIMIT 1
      `;

      const [results] = await sequelize.query(query, {
        replacements: { PC, USER },
        type: sequelize.QueryTypes.SELECT
      });

      if (results.length > 0) {
        res.status(200).json(results[0]);
      } else {
        res.status(200).json({ message: 'Nenhum comando' });
      }
    } catch (error) {
      console.error('Erro ao buscar comandos:', error.message);
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'PUT') {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'ID do comando é obrigatório' });
    }

    try {
      const updateQuery = `
        UPDATE B_BB_COMANDO
        SET PROCESSADO = true
        WHERE id = :id
      `;

      const [results, metadata] = await sequelize.query(updateQuery, {
        replacements: { id },
        type: sequelize.QueryTypes.UPDATE
      });

      if (metadata.affectedRows === 0) {
        return res.status(404).json({ message: 'Comando não encontrado' });
      }

      res.status(200).json({ message: 'Comando marcado como processado' });
    } catch (error) {
      console.error('Erro ao atualizar comando:', error.message);
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'POST') {
    const { PC, USER } = req.body;

    if (!PC || !USER) {
      return res.status(400).json({ message: 'PC e USER são obrigatórios' });
    }

    let attempt = 0;
    while (attempt < MAX_RETRIES) {
      try {
        const [results, metadata] = await updateCollector(PC, USER);

        if (metadata.affectedRows === 0) {
          return res.status(404).json({ message: 'Registro B_BB não encontrado' });
        }

        return res.status(200).json({ message: 'DT_COLLECTOR atualizado com sucesso' });
      } catch (error) {
        if (error.message.includes('Deadlock found')) {
          attempt++;
          if (attempt < MAX_RETRIES) {
            console.warn(`Deadlock detected. Retrying... (${attempt}/${MAX_RETRIES})`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            continue;
          }
        }
        console.error('Erro ao atualizar DT_COLLECTOR:', error.message);
        return res.status(500).json({ error: error.message });
      }
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
