// Định nghĩa các kiểu dữ liệu dùng chung cho inventory, user, NFT, thống kê

// User
export interface User {
  playerID: string;
  username?: string;
  email?: string;
  createdAt?: string;
  inventory?: Inventory;
}

// NFT
export interface NFT {
  unit: string;
  name: string;
  image: string;
  rarity: string;
  price?: number;
  ownerAddress?: string;
  txhash?: string;
  ATK?: number;
  MPConsume?: number;
  ATKSpeed?: number;
  CritRate?: number;
  Rechargeable?: number;
  MultiShoot?: number;
  Category?: string;
  time?: string;
}

// Inventory
export interface Inventory {
  items: NFT[];
  lastUpdated?: string;
}

// Thống kê
export interface ProjectStats {
  totalUsers: number;
  totalNFTs: number;
  totalMarketplaceItems: number;
  totalVolume?: number;
  lastUpdate: string;
} 