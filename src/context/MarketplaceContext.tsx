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
  }

  const blockfrostApiKey = "previewxOC094xKrrjbuvWPhJ8bkiSoABW4jpDc"; // Thay thế bằng API key của bạn
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
    const size = data.length;
    const NFTs = [];

    for (let i = 0; i < size; i++) {
      const txhash = data[i].input.txHash;
      const jsonObj = await getDatumByHash(data[i].output.dataHash as string);
      const response = await blockchainProvider.fetchUTxOs(txhash);
      const txInfo = await blockchainProvider.fetchTxInfo(txhash);
      const asset = await blockchainProvider.fetchAssetMetadata(
        response[0].output.amount[1].unit
      );
      const blockInfo = await blockchainProvider.fetchBlockInfo(txInfo.block);
      console.log("-------------------------------------");
      const NFT = {
        name: asset.name,
        ownerAddress: response[1].output.address,
        unit: response[0].output.amount[1].unit,
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
