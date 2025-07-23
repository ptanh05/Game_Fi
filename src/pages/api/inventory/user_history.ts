import type { NextApiRequest, NextApiResponse } from 'next';
import pool from './db';

function validateHistory(body: any) {
  for (const key of ['user_address', 'name', 'type', 'rarity', 'date']) {
    if (!body[key] || typeof body[key] !== 'string' || body[key].trim() === '') {
      return `${key} không được rỗng`;
    }
  }
  return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { user_address } = req.query;
      let result;
      if (user_address) {
        result = await pool.query('SELECT * FROM user_history WHERE user_address=$1 ORDER BY date DESC', [user_address]);
      } else {
        result = await pool.query('SELECT * FROM user_history ORDER BY date DESC');
      }
      return res.status(200).json(result.rows);
    }
    if (req.method === 'POST') {
      const error = validateHistory(req.body);
      if (error) return res.status(400).json({ error });
      const { user_address, name, type, rarity, date } = req.body;
      const result = await pool.query(
        'INSERT INTO user_history (user_address, name, type, rarity, date) VALUES ($1,$2,$3,$4,$5) RETURNING *',
        [user_address, name, type, rarity, date]
      );
      return res.status(201).json(result.rows[0]);
    }
    if (req.method === 'DELETE') {
      const { id } = req.body;
      await pool.query('DELETE FROM user_history WHERE id=$1', [id]);
      return res.status(204).end();
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
} 