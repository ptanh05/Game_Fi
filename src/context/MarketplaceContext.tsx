import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { BlockfrostProvider } from "@meshsdk/core";
import axios from "axios";
import { DateTime } from "luxon";

interface MarketContextType {
  marketNFTs: any[];
  getGameNFTs: () => Promise<void>;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const MarketProvider = ({ children }: { children: ReactNode }) => {
  const [marketNFTs, setMarketNFTs] = useState<any[]>([]);

  interface DatumResponse {
    hash: string;
    datum: string;
    json_value?: {
      fields?: Array<any>;
    };
  }

  const blockfrostApiKey = "previewNNOxQObPDs5JqClb5To9DKf6JpqxSiTQ"; // Thay thế bằng API key của bạn
  const baseUrl = "https://cardano-preview.blockfrost.io/api/v0";

  async function getDatumByHash(datumHash: string): Promise<DatumResponse> {
    try {
      const response = await axios.get(
        `${baseUrl}/scripts/datum/${datumHash}`,
        {
          headers: {
            project_id: blockfrostApiKey,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy datum:", error);
      throw error;
    }
  }

  async function getGameNFTs() {
    const blockchainProvider = new BlockfrostProvider(blockfrostApiKey);
    const data = await blockchainProvider.fetchAddressUTxOs(
      "addr_test1zqcq3m4d0q8zq5yakxgd464qucvr3gyea3x2fcf5we6qamkq3upff6k44dawpnj5w8w5suq8jxff0w54yv90yte9u46slnfap0"
    );
    const NFTs = [];
    for (let i = 0; i < data.length; i++) {
      const txhash = data[i].input.txHash;
      const jsonObj = await getDatumByHash(data[i].output.dataHash as string);
      // Fix: kiểm tra jsonObj có json_value và fields
      if (
        !jsonObj ||
        !jsonObj.json_value ||
        !jsonObj.json_value.fields ||
        !jsonObj.json_value.fields[1] ||
        !jsonObj.json_value.fields[1].int
      )
        continue;
      const response = await blockchainProvider.fetchUTxOs(txhash);
      const txInfo = await blockchainProvider.fetchTxInfo(txhash);
      const blockInfo = await blockchainProvider.fetchBlockInfo(txInfo.block);
      // Lọc asset là NFT (bỏ qua ADA)
      const nftAsset = response[0].output.amount.find(
        (a: any) => a.unit !== "lovelace"
      );
      if (!nftAsset) continue;
      const asset = await blockchainProvider.fetchAssetMetadata(nftAsset.unit);
      // Lấy đúng ownerAddress từ UTXO chứa NFT
      const ownerAddress = response[0].output.address;
      const NFT = {
        name: asset.name,
        ownerAddress: ownerAddress,
        unit: nftAsset.unit,
        image: asset.image,
        txhash: txhash,
        rarity: asset.rarity,
        ATK: asset.atk,
        ATKSpeed: asset.atkspeed,
        MPConsume: asset.mpconsume,
        CritRate: asset.critrate,
        Rechargeable: asset.rechargeable,
        MultiShoot: asset.multishoot,
        Category: asset.type,
        price: jsonObj.json_value.fields[1].int / 1000000,
        time: DateTime.fromSeconds(blockInfo.time)
          .setZone("Asia/Ho_Chi_Minh")
          .toFormat("yyyy-M-d"),
      };
      NFTs.push(NFT);
    }
    setMarketNFTs(NFTs);
  }

  return (
    <MarketContext.Provider value={{ marketNFTs, getGameNFTs }}>
      {children}
    </MarketContext.Provider>
  );
};

export const useMarketContext = () => {
  const context = useContext(MarketContext);
  if (context === undefined) {
    throw new Error("useMarketContext must be used within a MarketProvider");
  }
  return context;
};
