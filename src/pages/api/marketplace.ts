import type { NextApiRequest, NextApiResponse } from 'next';
import pool from './inventory/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const {
      unit, name, image, rarity, price, category, txhash,
      atk, mpconsume, atkspeed, critrate, rechargeable, multishoot
    } = req.body;
    try {
      const result = await pool.query(
        `INSERT INTO marketplace
        (unit, name, image, rarity, price, category, txhash, atk, mpconsume, atkspeed, critrate, rechargeable, multishoot)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
        RETURNING *`,
        [unit, name, image, rarity, price, category, txhash, atk, mpconsume, atkspeed, critrate, rechargeable, multishoot]
      );
      return res.status(201).json(result.rows[0]);
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message });
    }
  }
  if (req.method === 'GET') {
    // Lấy tất cả NFT đang bán
    const result = await pool.query('SELECT * FROM marketplace ORDER BY created_at DESC');
    return res.status(200).json(result.rows);
  }
  res.status(405).json({ error: 'Method not allowed' });
} 