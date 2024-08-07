import { ADM } from '../../models';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SECRET_KEY = 'kamehamehaa';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { login, senha } = req.body;
    const user = await ADM.findOne({ where: { LOGIN: login } });

    if (user && bcrypt.compareSync(senha, user.SENHA)) {
      const token = jwt.sign({ id: user.ID }, SECRET_KEY, { expiresIn: '1h' });
      res.status(200).json({ token });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
