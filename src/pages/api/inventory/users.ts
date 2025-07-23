import type { NextApiRequest, NextApiResponse } from 'next';
import pool from './db';
import type { User } from './types';

function validateUser(body: any) {
  const { address, currentkeys, pity_current, pity_guaranteedEpic, pity_guaranteedLegendary } = body;
  if (!address || typeof address !== 'string' || address.trim() === '') {
    return 'Địa chỉ (address) không được rỗng';
  }
  for (const key of ['currentkeys', 'pity_current', 'pity_guaranteedEpic', 'pity_guaranteedLegendary']) {
    if (typeof body[key] !== 'number' || body[key] < 0) {
      return `${key} phải là số >= 0`;
    }
  }
  return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const result = await pool.query('SELECT * FROM users ORDER BY address');
      return res.status(200).json(result.rows);
    }
    if (req.method === 'POST') {
      const error = validateUser(req.body);
      if (error) return res.status(400).json({ error });
      const { address, currentkeys, pity_current, pity_guaranteedEpic, pity_guaranteedLegendary } = req.body;
      try {
        const result = await pool.query(
          'INSERT INTO users (address, currentkeys, pity_current, pity_guaranteedEpic, pity_guaranteedLegendary) VALUES ($1,$2,$3,$4,$5) RETURNING *',
          [address, currentkeys, pity_current, pity_guaranteedEpic, pity_guaranteedLegendary]
        );
        return res.status(201).json(result.rows[0]);
      } catch (err: any) {
        // Nếu lỗi duplicate key, trả về user cũ
        if (err.code === '23505') {
          const oldUser = await pool.query('SELECT * FROM users WHERE address=$1', [address]);
          return res.status(200).json(oldUser.rows[0]);
        }
        // Log lỗi chi tiết
        console.error('POST /api/inventory/users error:', err);
        return res.status(500).json({ error: err.message || 'Unknown error' });
      }
    }
    if (req.method === 'PUT') {
      const error = validateUser(req.body);
      if (error) return res.status(400).json({ error });
      const { address, ...fields } = req.body;
      const keys = Object.keys(fields);
      const values = Object.values(fields);
      const setStr = keys.map((k, i) => `${k}=$${i + 2}`).join(', ');
      const result = await pool.query(
        `UPDATE users SET ${setStr} WHERE address=$1 RETURNING *`,
        [address, ...values]
      );
      return res.status(200).json(result.rows[0]);
    }
    if (req.method === 'DELETE') {
      const { address } = req.body;
      await pool.query('DELETE FROM users WHERE address=$1', [address]);
      return res.status(204).end();
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API /api/inventory/users error:', error);
    return res.status(500).json({ error: (error as Error).message });
  }
} 