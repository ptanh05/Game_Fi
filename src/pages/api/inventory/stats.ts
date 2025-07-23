import type { NextApiRequest, NextApiResponse } from 'next';
import pool from './db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    // Tổng số user
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    // Tổng số NFT
    const nftCount = await pool.query('SELECT COUNT(*) FROM nfts_cache');
    // Tổng số lịch sử
    const historyCount = await pool.query('SELECT COUNT(*) FROM user_history');
    // Tổng số NFT đang locked
    const lockedCount = await pool.query('SELECT COUNT(*) FROM nfts_cache WHERE status=1');
    // Tổng số NFT theo từng loại rarity
    const rarityStats = await pool.query('SELECT rarity, COUNT(*) FROM nfts_cache GROUP BY rarity');
    // Tổng số NFT theo từng type
    const typeStats = await pool.query('SELECT type, COUNT(*) FROM nfts_cache GROUP BY type');

    res.status(200).json({
      totalUsers: Number(userCount.rows[0].count),
      totalNFTs: Number(nftCount.rows[0].count),
      totalUserHistory: Number(historyCount.rows[0].count),
      totalLockedNFTs: Number(lockedCount.rows[0].count),
      rarityStats: rarityStats.rows.reduce<{[key: string]: number}>(
        (acc: {[key: string]: number}, cur: { rarity: string; count: string }) => ({ ...acc, [cur.rarity]: Number(cur.count) }),
        {}
      ),
      typeStats: typeStats.rows.reduce<{[key: string]: number}>(
        (acc: {[key: string]: number}, cur: { type: string; count: string }) => ({ ...acc, [cur.type]: Number(cur.count) }),
        {}
      ),
      lastUpdate: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
} 