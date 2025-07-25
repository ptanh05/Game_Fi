"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { useContractContext } from "../context/ContractContext";
import { useWalletContext } from "~/context/WalletContext";
import { useMarketContext } from "~/context/MarketplaceContext";
import { usePlutusContract } from "../hooks/usePlutusContract";
import { Transaction } from "@meshsdk/core";

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
  action: "buy" | "sell" | "refund" | "update" | "detail";
  history?: any[];
};

export function NFTsModal({
  isOpen,
  onClose,
  nft,
  action,
  history,
}: NFTsModalProps) {
  const [showActionForm, setShowActionForm] = useState(false);
  const [newPrice, setNewPrice] = useState("");

  const contract = usePlutusContract();
  const { wallet, address } = useWalletContext();
  const { getGameNFTs } = useMarketContext();

  // Lấy contract address từ plutus.json
  const contractAddress = contract?.validators?.[0]?.hash;

  // Build datum đúng schema từ plutus.json
  const buildDatum = (priceLovelace: number) => ({
    seller: address,
    price: priceLovelace,
    asset: {
      // Không còn policyId, assetName
      name: nft.name,
    },
  });

  // Build redeemer đúng schema từ plutus.json
  const buildRedeemer = (action: string) => ({ action });

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
      if (!wallet) {
        alert("Please connect your wallet first!");
        return;
      }
      const utxos = await wallet.getUtxos();
      console.log("UTXOs from wallet:", utxos);
      if (!utxos || utxos.length === 0) {
        alert("Your wallet has no ADA/UTXO. Please fund your wallet first!");
        return;
      }
      const priceADA = parseFloat(newPrice);
      const priceLovelace = Math.floor(priceADA * 1_000_000);
      if (!contractAddress) throw new Error("Contract address not loaded");
      const datum = buildDatum(priceLovelace);
      const tx: any = new Transaction({ initiator: wallet });
      tx.sendAssets({
        address: contractAddress,
        assets: [{ unit: String(nft.unit), quantity: "1" }],
        datum: datum,
      });
      if (typeof tx.selectUtxosFrom === "function") {
        tx.selectUtxosFrom(utxos);
      }
      const unsignedTx: any = await tx.build();
      const signedTx: any = await wallet.signTx(unsignedTx);
      const txHash: any = await wallet.submitTx(signedTx);
      await fetch("/api/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unit: String(nft.unit),
          name: nft.name,
          image: nft.image,
          rarity: nft.rarity,
          price: newPrice,
          category: nft.Category || "default",
          txhash: txHash,
          atk: nft.ATK,
          mpconsume: nft.MPConsume,
          atkspeed: nft.ATKSpeed,
          critrate: nft.CritRate,
          rechargeable: nft.Rechargeable,
          multishoot: nft.MultiShoot,
        }),
      });
      alert("NFT đã được list lên marketplace!");
      if (getGameNFTs) await getGameNFTs();
    } catch (error) {
      console.error("Error listing asset for sale:", error);
      alert(
        "Error listing asset for sale: " +
          (error && (error as any).message ? (error as any).message : error)
      );
    }
  };

  const handleBuyAsset = async () => {
    try {
      if (!wallet) {
        alert("Please connect your wallet first!");
        return;
      }
      const utxos = await wallet.getUtxos();
      if (!utxos || utxos.length === 0) {
        alert("Your wallet has no ADA/UTXO. Please fund your wallet first!");
        return;
      }
      if (!contractAddress) throw new Error("Contract address not loaded");
      const redeemer = buildRedeemer("Buy");
      const tx: any = new Transaction({ initiator: wallet });
      tx.sendAssets({
        address: address,
        assets: [{ unit: String(nft.unit), quantity: "1" }],
      });
      if (typeof tx.selectUtxosFrom === "function") {
        tx.selectUtxosFrom(utxos);
      }
      const unsignedTx: any = await tx.build();
      const signedTx: any = await wallet.signTx(unsignedTx);
      const txHash: any = await wallet.submitTx(signedTx);
      await fetch("/api/inventory/nfts_cache", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nft.name,
          image: nft.image,
          txhash: txHash,
          rarity: nft.rarity,
          type: nft.Category || "default",
          status: 2,
          ATK: nft.ATK,
          ATKSpeed: nft.ATKSpeed,
          MPConsume: nft.MPConsume,
          CritRate: nft.CritRate,
          Rechargeable: nft.Rechargeable,
          MultiShoot: nft.MultiShoot,
          Category: nft.Category,
        }),
      });
      if (getGameNFTs) await getGameNFTs();
    } catch (error) {
      console.error("Error purchasing asset:", error);
    }
  };

  const handleRefundAsset = async () => {
    try {
      if (!wallet) {
        alert("Please connect your wallet first!");
        return;
      }
      const utxos = await wallet.getUtxos();
      if (!utxos || utxos.length === 0) {
        alert("Your wallet has no ADA/UTXO. Please fund your wallet first!");
        return;
      }
      if (!contractAddress) throw new Error("Contract address not loaded");
      const redeemer = buildRedeemer("Refund");
      const tx: any = new Transaction({ initiator: wallet });
      tx.sendAssets({
        address: address,
        assets: [{ unit: String(nft.unit), quantity: "1" }],
      });
      if (typeof tx.selectUtxosFrom === "function") {
        tx.selectUtxosFrom(utxos);
      }
      const unsignedTx: any = await tx.build();
      const signedTx: any = await wallet.signTx(unsignedTx);
      const txHash: any = await wallet.submitTx(signedTx);
      await fetch("/api/inventory/nfts_cache", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nft.name,
          image: nft.image,
          txhash: txHash,
          rarity: nft.rarity,
          type: nft.Category || "default",
          status: 0,
          ATK: nft.ATK,
          ATKSpeed: nft.ATKSpeed,
          MPConsume: nft.MPConsume,
          CritRate: nft.CritRate,
          Rechargeable: nft.Rechargeable,
          MultiShoot: nft.MultiShoot,
          Category: nft.Category,
        }),
      });
      if (getGameNFTs) await getGameNFTs();
    } catch (error) {
      console.error("Error refunding asset:", error);
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

  // Thêm hàm copy
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Thêm render metadata chi tiết
  const renderMetadata = (nft: NFT) => (
    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
      <div>
        <b>Name:</b> {nft.name}
      </div>
      <div>
        <b>Rarity:</b> {nft.rarity}
      </div>
      <div>
        <b>Type:</b> {nft.Category}
      </div>
      <div>
        <b>Price:</b> {nft.price} ADA
      </div>
      <div>
        <b>Unit:</b> {nft.unit}
      </div>
      <div>
        <b>TxHash:</b> {nft.txhash}
      </div>
      <div>
        <b>ATK:</b> {nft.ATK}
      </div>
      <div>
        <b>ATKSpeed:</b> {nft.ATKSpeed}
      </div>
      <div>
        <b>MPConsume:</b> {nft.MPConsume}
      </div>
      <div>
        <b>CritRate:</b> {nft.CritRate}
      </div>
      <div>
        <b>Rechargeable:</b> {nft.Rechargeable}
      </div>
      <div>
        <b>MultiShoot:</b> {nft.MultiShoot}
      </div>
    </div>
  );
  // Thêm render lịch sử giao dịch nếu có
  const renderHistory = (history?: any[]) =>
    history && history.length > 0 ? (
      <div className="mt-4">
        <h4 className="font-bold mb-2">Lịch sử giao dịch</h4>
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th>Loại</th>
              <th>Ngày</th>
              <th>Rarity</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, idx) => (
              <tr key={idx}>
                <td>{item.type}</td>
                <td>{new Date(item.date).toLocaleString()}</td>
                <td>{item.rarity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : null;

  if (!isOpen) return null;

  // Trong phần render, nếu action === 'detail', chỉ hiển thị metadata + history, không có nút giao dịch
  if (action === "detail") {
    return (
      <div
        className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-6"
        onClick={onClose}
      >
        <div
          className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-screen shadow-2xl overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-6 border-b border-gray-700">
            <h3 className="text-3xl font-bold text-white">{nft.name}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
          <div className="p-6 flex flex-col md:flex-row gap-8">
            <div className="relative h-64 w-64 bg-gray-800 rounded-lg overflow-hidden">
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
            <div className="flex-1">
              {renderMetadata(nft)}
              {renderHistory(history)}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
