import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { useWallet } from '@meshsdk/react';
import { BlockfrostProvider } from '@meshsdk/core';

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
    'previewxOC094xKrrjbuvWPhJ8bkiSoABW4jpDc'
  );
  
  const { name, connecting, connected, wallet, connect, disconnect, error } = useWallet();
  const [metadata, setMetadata] = useState<any[]>([]);
  const [address, setAddress] = useState('Not connected');
  const [balance, setBalance] = useState('0 ADA');
  const [errorState, setErrorState] = useState<string | null>(null);

  const getMetadata = useCallback(async () => {
    if (!connected || !wallet) return;
    
    try {
      const [assets, changeAddress, balanceData] = await Promise.all([
        wallet.getAssets(),
        wallet.getChangeAddress(),
        wallet.getBalance()
      ]);

      setAddress(changeAddress);

      if (balanceData.length > 0) {
        const lovelace = parseInt(balanceData[0].quantity, 10);
        setBalance(`${(lovelace / 1000000).toFixed(2)} ADA`);
      }

      const metadataResults = await Promise.allSettled(
        assets.map(async (asset) => {
          try {
            const metadata = await blockchainProvider.fetchAssetMetadata(asset.unit);
            return metadata ? {
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
            } : null;
          } catch (error) {
            console.error('Error fetching asset metadata:', error);
            return null;
          }
        })
      );

      const successfulMetadata = metadataResults
        .filter(result => result.status === 'fulfilled' && result.value?.rarity)
        .map(result => (result as PromiseFulfilledResult<any>).value);

      setMetadata(successfulMetadata);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      setErrorState(error instanceof Error ? error.message : 'Unknown error');
    }
  }, [connected, wallet]);

  useEffect(() => {
    if (connected && wallet) {
      getMetadata();
    }
  }, [connected, wallet, getMetadata]);

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
    <WalletContext.Provider value={{
      name,
      connecting,
      connected,
      wallet,
      connect,
      disconnect: handleDisconnect,
      error: errorState || error?.toString() || null,
      metadata,
      getMetadata,
      address,
      balance
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
};