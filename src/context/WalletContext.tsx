import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useWallet } from "@meshsdk/react";
import { BlockfrostProvider } from "@meshsdk/core";
import axios from "axios";

interface WalletContextType {
  name: string;
  connecting: boolean;
  connected: boolean;
  wallet: any;
  connect: (walletName: string, extensions?: number[]) => Promise<void>;
  disconnect: () => Promise<void>;
  error: string | null;
  metadata: any[];
  getMetadata: () => Promise<void>;
  address: string;
  balance: string;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const blockchainProvider = new BlockfrostProvider(
    "previewNNOxQObPDs5JqClb5To9DKf6JpqxSiTQ"
  );

  const { name, connecting, connected, wallet, connect, disconnect, error } =
    useWallet();
  const [metadata, setMetadata] = useState<any[]>([]);
  const [address, setAddress] = useState("Not connected");
  const [balance, setBalance] = useState("0 ADA");
  const [errorState, setErrorState] = useState<string | null>(null);

  const getMetadata = useCallback(async () => {
    if (!connected || !wallet) return;
    try {
      const [assets, changeAddress, balanceData] = await Promise.all([
        wallet.getAssets(),
        wallet.getChangeAddress(),
        wallet.getBalance(),
      ]);
      setAddress(changeAddress);
      if (balanceData.length > 0) {
        const lovelace = parseInt(balanceData[0].quantity, 10);
        setBalance(`${(lovelace / 1000000).toFixed(2)} ADA`);
      }
      const metadataResults = await Promise.allSettled(
        assets.map(async (asset) => {
          try {
            const metadata = await blockchainProvider.fetchAssetMetadata(
              asset.unit
            );
            return metadata
              ? {
                  name: metadata.name,
                  unit: asset.unit,
                  image: metadata.image,
                  policyId: asset.policyId,
                  assetName: asset.assetName,
                  rarity: metadata.rarity,
                  ATK: metadata.atk,
                  ATKSpeed: metadata.atkspeed,
                  MPConsume: metadata.mpconsume,
                  CritRate: metadata.critrate,
                  Rechargeable: metadata.rechargeable,
                  MultiShoot: metadata.multishoot,
                  Category: metadata.type,
                }
              : null;
          } catch (error) {
            console.error("Error fetching asset metadata:", error);
            return null;
          }
        })
      );
      const successfulMetadata = metadataResults
        .filter(
          (result) => result.status === "fulfilled" && result.value?.rarity
        )
        .map((result) => (result as PromiseFulfilledResult<any>).value);
      setMetadata(successfulMetadata);
    } catch (error) {
      console.error("Error fetching wallet data:", error);
      setErrorState(error instanceof Error ? error.message : "Unknown error");
    }
  }, [connected, wallet]);

  // Gọi getMetadata khi connect ví
  useEffect(() => {
    if (connected && wallet) {
      getMetadata();
      console.log("Wallet connected:", wallet);
    }
  }, [connected, wallet, getMetadata]);

  // Nếu address chưa lấy được, thử lại sau 2s
  useEffect(() => {
    if (connected && wallet && (address === "Not connected" || !address)) {
      const timeout = setTimeout(() => {
        getMetadata();
        console.log("Retry getMetadata after 2s");
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [connected, wallet, address, getMetadata]);

  // Log giá trị address, balance, metadata mỗi khi thay đổi
  useEffect(() => {
    console.log(
      "Address:",
      address,
      "Balance:",
      balance,
      "Metadata:",
      metadata
    );
    if (connected && address && address !== "Not connected") {
      axios
        .post("/api/inventory/users", {
          address,
          currentkeys: 0,
          pity_current: 0,
          pity_guaranteedEpic: 0,
          pity_guaranteedLegendary: 0,
        })
        .catch((e) => {
          if (
            e.response?.data?.error &&
            !e.response.data.error.includes("duplicate")
          ) {
            console.log(e.response.data.error);
          }
        });
    }
  }, [connected, address, balance, metadata]);

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } finally {
      setAddress("Not connected");
      setBalance("0 ADA");
      setMetadata([]);
      setErrorState(null);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        name: name ?? "",
        connecting,
        connected,
        wallet,
        connect,
        disconnect: handleDisconnect,
        error: errorState || error?.toString() || null,
        metadata,
        getMetadata,
        address,
        balance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWalletContext must be used within a WalletProvider");
  }
  return context;
};
