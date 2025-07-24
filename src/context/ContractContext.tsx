import { MeshMarketplaceContract } from "@meshsdk/contract";
import { BlockfrostProvider, MeshTxBuilder } from "@meshsdk/core";
import { createContext, ReactNode, useContext } from "react";
import { useWalletContext } from "./WalletContext";

interface ContractContextType {
  contract: any;
}
const ContractContext = createContext<ContractContextType | undefined>(
  undefined
);

export const ContractProvider = ({ children }: { children: ReactNode }) => {
  const blockchainProvider = new BlockfrostProvider(
    "previewNNOxQObPDs5JqClb5To9DKf6JpqxSiTQ"
  );
  const meshTxBuilder = new MeshTxBuilder({
    fetcher: blockchainProvider,
    submitter: blockchainProvider,
  });
  const { wallet } = useWalletContext();
  const contract = new MeshMarketplaceContract(
    {
      mesh: meshTxBuilder,
      fetcher: blockchainProvider,
      wallet: wallet,
      networkId: 0,
    },
    "addr_test1qqtkswgdgxzacv09w4w883zpn5jmmwecwtfcqwxgg67kp7gt8ljwnqjfzp4ncn96erdapwd059lsftw0349963ear8rsr85xpv",
    1000
  );
  return (
    <ContractContext.Provider value={{ contract }}>
      {children}
    </ContractContext.Provider>
  );
};
export const useContractContext = () => {
  const context = useContext(ContractContext);
  if (context === undefined) {
    throw new Error(
      "useContractContext must be used within a ContractProvider"
    );
  }
  return context;
};
