import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const contractPath = path.join(process.cwd(), 'public', 'plutus.json');
  try {
    const data = fs.readFileSync(contractPath, 'utf-8');
    res.status(200).json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Không đọc được contract' });
  }
} 