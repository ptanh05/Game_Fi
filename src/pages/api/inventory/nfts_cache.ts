import type { NextApiRequest, NextApiResponse } from 'next';
import pool from './db';
import type { NFT } from './types';

function validateNFT(body: any) {
  for (const key of ['name', 'image', 'txhash', 'rarity', 'type']) {
    if (!body[key] || typeof body[key] !== 'string' || body[key].trim() === '') {
      return `${key} không được rỗng`;
    }
  }
  if (typeof body.status !== 'number') {
    return 'status phải là số';
  }
  return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const result = await pool.query('SELECT * FROM nfts_cache ORDER BY id DESC');
      return res.status(200).json(result.rows);
    }
    if (req.method === 'POST') {
      const error = validateNFT(req.body);
      if (error) return res.status(400).json({ error });
      const { name, image, txhash, rarity, type, status } = req.body;
      const result = await pool.query(
        'INSERT INTO nfts_cache (name, image, txhash, rarity, type, status, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,NOW(),NOW()) RETURNING *',
        [name, image, txhash, rarity, type, status]
      );
      return res.status(201).json(result.rows[0]);
    }
    if (req.method === 'PUT') {
      const error = validateNFT(req.body);
      if (error) return res.status(400).json({ error });
      const { id, ...fields } = req.body;
      const keys = Object.keys(fields);
      const values = Object.values(fields);
      const setStr = keys.map((k, i) => `${k}=$${i + 2}`).join(', ');
      const result = await pool.query(
        `UPDATE nfts_cache SET ${setStr}, updated_at=NOW() WHERE id=$1 RETURNING *`,
        [id, ...values]
      );
      return res.status(200).json(result.rows[0]);
    }
    if (req.method === 'DELETE') {
      const { id } = req.body;
      await pool.query('DELETE FROM nfts_cache WHERE id=$1', [id]);
      return res.status(204).end();
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
} 