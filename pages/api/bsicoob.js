import { B_SICOOB } from '../../models';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const b_sicoobs = await B_SICOOB.findAll();
    res.status(200).json(b_sicoobs);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
