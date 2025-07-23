"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { useContractContext } from "../context/ContractContext";
import { useWalletContext } from "~/context/WalletContext";

type NFT = {
  unit: number;
  name: string;
  rarity: string;
  image: string;
  price?: string;
  Category?: string;
  txhash?: string;
  ATK: number;
  MPConsume: number;
  ATKSpeed: number;
  CritRate: number;
  Rechargeable: number;
  MultiShoot: number;
};

type NFTsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  nft: NFT;
  action: "buy" | "sell" | "refund" | "update";
};

export function NFTsModal({ isOpen, onClose, nft, action }: NFTsModalProps) {
  const [showActionForm, setShowActionForm] = useState(false);
  const [newPrice, setNewPrice] = useState("");

  const { contract } = useContractContext();
  const { wallet } = useWalletContext();

  useEffect(() => {
    if (isOpen) {
      setShowActionForm(false);
      setNewPrice("");
    }
  }, [isOpen]);

  const getStats = (nft: NFT) => ({
    atk: nft.ATK,
    mpConsume: nft.MPConsume,
    atkSpeed: (nft.ATKSpeed / 1000).toFixed(2),
    critRate: (nft.CritRate / 100).toFixed(2),
    rechargeable: nft.Rechargeable == 0 ? false : true,
    multiShoot: nft.MultiShoot == 0 ? false : true,
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Legendary":
        return "text-yellow-400";
      case "Epic":
        return "text-purple-400";
      case "Rare":
        return "text-blue-400";
      default:
        return "text-gray-400";
    }
  };

  const handleActionButtonClick = () => {
    setShowActionForm(true);
  };

  const shortenUnit = (
    unit: string | number,
    startChars = 6,
    endChars = 4
  ): string => {
    const strUnit = String(unit);
    if (strUnit.length <= startChars + endChars) return strUnit;
    return `${strUnit.slice(0, startChars)}...${strUnit.slice(-endChars)}`;
  };

  const handleSellAsset = async () => {
    try {
      // Convert the provided price (in ADA) to lovelace (assuming 1 ADA = 1,000,000 lovelace)
      const priceADA = parseFloat(newPrice);
      const priceLovelace = Math.floor(priceADA * 1000000);

      // Here we assume nft.unit holds the asset identifier. If needed, replace with a hardcoded value.
      const tx = await contract.listAsset(String(nft.unit), priceLovelace);
      const signedTx = await wallet.signTx(tx);
      const txHash = await wallet.submitTx(signedTx);
      console.log("NFT listed for sale. Transaction hash:", txHash);
    } catch (error) {
      console.error("Error listing asset for sale:", error);
    }
  };

  const handleBuyAsset = async () => {
    const utxo = await contract.getUtxoByTxHash(nft.txhash);
    const tx = await contract.purchaseAsset(utxo);
    try {
      const signedTx = await wallet.signTx(tx);
      const txHash = await wallet.submitTx(signedTx);
      console.log("NFT purchase", txHash);
    } catch (error) {
      console.error("Error purchasing asset:", error);
    }
  };

  const handleRefundAsset = async () => {
    const utxo = await contract.getUtxoByTxHash(nft.txhash);
    const tx = await contract.delistAsset(utxo);
    try {
      const signedTx = await wallet.signTx(tx);
      const txHash = await wallet.submitTx(signedTx);
      console.log("NFT purchase", txHash);
    } catch (error) {
      console.error("Error purchasing asset:", error);
    }
  };

  const handleUpdateAsset = async () => {
    const priceADA = parseFloat(newPrice);
    const priceLovelace = Math.floor(priceADA * 1000000);
    const utxo = await contract.getUtxoByTxHash(nft.txhash);
    const tx = await contract.relistAsset(utxo, priceLovelace);
    try {
      const signedTx = await wallet.signTx(tx);
      const txHash = await wallet.submitTx(signedTx);
      console.log("NFT purchase", txHash);
    } catch (error) {
      console.error("Error purchasing asset:", error);
    }
  };

  const handleConfirm = async () => {
    if (action === "buy") {
      await handleBuyAsset();
      onClose();
    } else if (action === "sell" && newPrice) {
      await handleSellAsset();
      onClose();
    } else if (action === "refund") {
      await handleRefundAsset();
      onClose();
    } else if (action === "update" && newPrice) {
      await handleUpdateAsset();
      onClose();
    }
  };

  const renderStats = (nft: NFT) => {
    const stats = getStats(nft);
    return (
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-gray-400">ATK</span>
            <span className="font-medium">{stats.atk}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className="bg-red-500 h-3 rounded-full"
              style={{ width: `${Math.min(100, stats.atk / 2)}%` }}
            ></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-gray-400">MP Consume</span>
            <span className="font-medium">{stats.mpConsume}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className="bg-blue-500 h-3 rounded-full"
              style={{ width: `${Math.min(100, stats.mpConsume / 1.5)}%` }}
            ></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-gray-400">ATK Speed</span>
            <span className="font-medium">{stats.atkSpeed}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full"
              style={{
                width: `${Math.min(100, Number(stats.atkSpeed) / 0.03)}%`,
              }}
            ></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-gray-400">Crit Rate</span>
            <span className="font-medium">{stats.critRate}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className="bg-yellow-500 h-3 rounded-full"
              style={{ width: `${Math.min(100, Number(stats.critRate))}%` }}
            ></div>
          </div>
        </div>
        <div className="mt-6 flex space-x-8">
          <div className="flex items-center">
            <div
              className={`w-4 h-4 rounded-full mr-2 ${
                stats.rechargeable ? "bg-green-500" : "bg-gray-600"
              }`}
            ></div>
            <span>Rechargeable</span>
          </div>
          <div className="flex items-center">
            <div
              className={`w-4 h-4 rounded-full mr-2 ${
                stats.multiShoot ? "bg-green-500" : "bg-gray-600"
              }`}
            ></div>
            <span>Multi-shoot</span>
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-6" // Thay đổi bg-black bg-opacity-60 thành bg-black/30
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-lg max-w-6xl w-full max-h-screen shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h3 className="text-3xl font-bold text-white">{nft.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 flex flex-col md:flex-row gap-8 h-[400px]">
          <div className="relative h-full md:w-1/2 bg-gray-800 rounded-lg overflow-hidden">
            <Image
              src={
                nft.image.startsWith("http")
                  ? nft.image
                  : `https://gateway.pinata.cloud/ipfs/${nft.image}`
              }
              alt={nft.name}
              fill
              className="object-contain"
            />
          </div>

          <div className="md:w-1/2 flex flex-col h-full">
            {!showActionForm ? (
              <div className="flex flex-col h-full justify-between">
                <div>
                  <h4 className="font-bold text-lg mb-4">Stats</h4>
                  {renderStats(nft)}
                </div>
                <button
                  onClick={handleActionButtonClick}
                  className={`py-3 text-white rounded-md text-sm w-full ${
                    action === "buy"
                      ? "bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900"
                      : action === "sell"
                      ? "bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900"
                      : action === "refund"
                      ? "bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900"
                      : "bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
                  }`}
                >
                  {action === "buy"
                    ? "Buy NFT"
                    : action === "sell"
                    ? "Sell NFT"
                    : action === "refund"
                    ? "Refund NFT"
                    : "Update NFT"}
                </button>
              </div>
            ) : (
              <div className="flex flex-col h-full justify-between">
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-400">Rarity</p>
                    <p className={`font-medium ${getRarityColor(nft.rarity)}`}>
                      {nft.rarity}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">ID</p>
                    <p className="font-medium">{shortenUnit(nft.unit)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Type</p>
                    <p className="font-medium">
                      {nft.Category
                        ? nft.Category === "weapons"
                          ? "Weapon"
                          : "Pet"
                        : "Unknown"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Collection</p>
                    <p className="font-medium">
                      Bruhtato{" "}
                      {nft.Category
                        ? nft.Category.charAt(0).toUpperCase() +
                          nft.Category.slice(1)
                        : "Unknown"}
                    </p>
                  </div>
                </div>

                <div>
                  {action === "buy" && (
                    <div className="mb-4">
                      <p className="text-gray-400">
                        Price:{" "}
                        <span className="font-medium text-white">
                          {nft.price} ADA
                        </span>
                      </p>
                    </div>
                  )}
                  {action === "sell" && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Set your price (ADA)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter price in ADA"
                      />
                    </div>
                  )}
                  {action === "refund" && (
                    <div className="mb-4">
                      <p className="text-gray-400">
                        Are you sure you want to refund this listing?
                      </p>
                    </div>
                  )}
                  {action === "update" && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        New Price (ADA)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder={`Your old price was: ${nft.price} ADA`}
                      />
                    </div>
                  )}
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowActionForm(false)}
                    className="flex-1 py-3 bg-gray-700 text-white rounded-md hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirm}
                    className={`flex-1 py-3 text-white rounded-md ${
                      action === "buy" || action === "sell"
                        ? "bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900"
                        : action === "refund"
                        ? "bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900"
                        : "bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
                    }`}
                    disabled={
                      (action === "sell" || action === "update") && !newPrice
                    }
                  >
                    {action === "buy"
                      ? "Confirm Purchase"
                      : action === "sell"
                      ? "List for Sale"
                      : action === "refund"
                      ? "Confirm Refund"
                      : "Update Price"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
