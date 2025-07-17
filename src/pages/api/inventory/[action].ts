import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';

const SAVE_DIR = path.join(process.cwd(), 'persistent_data');

const ensureSaveDirExists = async () => {
  try {
    await fs.mkdir(SAVE_DIR, { recursive: true });
  } catch (error) {
    console.error('📂 Lỗi tạo thư mục:', error);
    throw error;
  }
};

const sanitizePlayerID = (playerID: string) => {
  return playerID.replace(/[^a-zA-Z0-9-_]/g, '');
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Cấu hình CORS và Content-Type
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action } = req.query;
    // Ưu tiên lấy playerID từ body cho POST requests, hoặc từ query cho GET
    let finalPlayerID = req.body?.playerID || req.query.playerID;
    if (!finalPlayerID) {
      return res.status(400).json({ error: 'Thiếu playerID' });
    }

    const cleanPlayerID = sanitizePlayerID(finalPlayerID.toString());
    const savePath = path.join(SAVE_DIR, `${cleanPlayerID}.json`);

    await ensureSaveDirExists();

    switch (action) {
      case 'save':
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Chỉ hỗ trợ POST' });
        }
        // Nếu không có inventory trong req.body, gán là chuỗi rỗng
        const dataToSave = {
          playerID: cleanPlayerID,
          inventory: req.body.inventory ? req.body.inventory : ""
        };

        await fs.writeFile(savePath, JSON.stringify(dataToSave, null, 2));
        console.log(`💾 Đã lưu cho player: ${cleanPlayerID}`);
        return res.status(200).json({ success: true });

      case 'load':
        if (req.method !== 'GET') {
          return res.status(405).json({ error: 'Chỉ hỗ trợ GET' });
        }
        try {
          const rawData = await fs.readFile(savePath, 'utf-8');
          const data = JSON.parse(rawData);
          console.log(`📂 Đã tải dữ liệu cho: ${cleanPlayerID}`);
          return res.status(200).json(data);
        } catch (error: any) {
          if (error.code === 'ENOENT') {
            console.log(`❌ Không tìm thấy dữ liệu cho: ${cleanPlayerID}`);
            return res.status(404).json({ error: 'Không tìm thấy dữ liệu' });
          }
          return res.status(404).json({ error: 'Không tìm thấy dữ liệu' });
        }

      default:
        return res.status(400).json({ error: 'Action không hợp lệ' });
    }
  } catch (error) {
    console.error('🔥 Lỗi server:', error);
    return res.status(500).json({ error: 'Lỗi hệ thống' });
  }
}