import { ADM } from '../../models';
import bcrypt from 'bcrypt';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { login, senha } = req.body;

    // Verificar se o usuário já existe
    const existingUser = await ADM.findOne({ where: { LOGIN: login } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash da senha
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(senha, saltRounds);

    // Criar novo usuário
    const newUser = await ADM.create({ LOGIN: login, SENHA: hashedPassword });

    res.status(201).json({ message: 'User created successfully', user: newUser });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
