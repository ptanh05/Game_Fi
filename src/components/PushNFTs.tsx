"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Copy,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Filter,
  ChevronDown,
  MoreHorizontal,
  Search,
} from "lucide-react";
import { useWalletContext } from "~/context/WalletContext";
import {
  blockchainProvider,
  getScript,
  getTxBuilder,
} from "~/contract/Contract";
import {
  Asset,
  Data,
  deserializeAddress,
  mConStr0,
  Transaction,
} from "@meshsdk/core";
import { usePlutusContract } from "../hooks/usePlutusContract";

// Mock data cho pets (fallback nếu ví không có NFT)
const mockPets = [
  {
    id: 1,
    name: "Shadow Dragon",
    rarity: "Legendary",
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 2,
    name: "Forest Wolf",
    rarity: "Epic",
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 3,
    name: "Fire Fox",
    rarity: "Rare",
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 4,
    name: "Stone Golem",
    rarity: "Common",
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 5,
    name: "Water Sprite",
    rarity: "Epic",
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 6,
    name: "Phoenix",
    rarity: "Legendary",
    image: "/placeholder.svg?height=100&width=100",
  },
];

export function PushNFTs() {
  const [activeTab, setActiveTab] = useState("weapons");
  const [copied, setCopied] = useState(false);
  const [filteredNfts, setFilteredNfts] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rarityFilter, setRarityFilter] = useState("All");
  const [showRarityDropdown, setShowRarityDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // Thêm state cho search query
  const itemsPerPage = 8;

  const { connected, metadata, address, balance, wallet } = useWalletContext();
  const contract = usePlutusContract();
  const contractAddress = contract?.validators?.[0]?.hash;

  const lockNft = async (nft: any) => {
    const asset: Asset[] = [
      {
        unit: "lovelace",
        quantity: "10000000",
      },
    ];
    const utxos = await wallet.getUtxos();
    const walletAddress = (await wallet.getUsedAddresses())[0];

    // Thay vì lấy scriptAddr từ getScript(), dùng contractAddress
    // const { scriptAddr } = getScript();

    // hash of the public key of the wallet, to be used in the datum

    // build transaction with MeshTxBuilder
    const txBuilder = getTxBuilder();
    await txBuilder
      .txOut(contractAddress, asset) // send assets to the script address
      .txOutDatumHashValue(
        mConStr0([
          "dc703457ef9d14e1d77d050b158868b9ab9c59110f437474a3294b7d8b81051c",
        ])
      ) // provide the datum where `"constructor": 0`
      .changeAddress(walletAddress) // send change back to the wallet address
      .selectUtxosFrom(utxos)
      .complete();
    const unsignedTx = txBuilder.txHex;

    const signedTx = await wallet.signTx(unsignedTx);
    const txHash = await wallet.submitTx(signedTx);
    console.log(`1 tADA locked into the contract at Tx ID: ${txHash}`);
  };

  // Xác định nguồn dữ liệu NFT cho từng tab:
  const nftsSource = {
    weapons: connected && metadata && metadata.length > 0 ? metadata : [],
    pets: mockPets,
  };

  // Áp dụng filter theo rarity và search query
  useEffect(() => {
    const currentNfts = nftsSource[activeTab as keyof typeof nftsSource];
    let filtered = currentNfts;

    // Áp dụng rarity filter
    if (rarityFilter !== "All") {
      filtered = filtered.filter((nft: any) => nft.rarity === rarityFilter);
    }

    // Áp dụng search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (nft: any) =>
          (nft.title || nft.name).toLowerCase().includes(query) ||
          nft.rarity.toLowerCase().includes(query)
      );
    }

    setFilteredNfts(filtered);
    setCurrentPage(1); // Reset trang khi filter thay đổi
  }, [activeTab, rarityFilter, searchQuery, connected, metadata]);

  // Các chỉ số phân trang
  const indexOfLastItem = Math.min(
    currentPage * itemsPerPage,
    filteredNfts.length
  );
  const indexOfFirstItem = Math.max(0, indexOfLastItem - itemsPerPage);
  const currentItems = filteredNfts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredNfts.length / itemsPerPage);

  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shortenAddress = (addr: string) => {
    return addr !== "Not connected"
      ? `${addr.substring(0, 10)}...${addr.substring(addr.length - 13)}`
      : addr;
  };

  const getRarityCount = (rarity: string) => {
    const currentNfts = nftsSource[activeTab as keyof typeof nftsSource];
    return rarity === "All"
      ? currentNfts.length
      : currentNfts.filter((nft: any) => nft.rarity === rarity).length;
  };

  const getFilteredTabCount = (tabName: string) => {
    const tabNfts = nftsSource[tabName as keyof typeof nftsSource];
    return rarityFilter === "All"
      ? tabNfts.length
      : tabNfts.filter((nft: any) => nft.rarity === rarityFilter).length;
  };

  // Tính toán phạm vi các trang với ellipsis
  const getPaginationRange = () => {
    const delta = 2;
    const range: (number | string)[] = [];
    range.push(1);
    const rangeStart = Math.max(2, currentPage - delta);
    const rangeEnd = Math.min(totalPages - 1, currentPage + delta);
    if (rangeStart > 2) {
      range.push("ellipsis1");
    }
    for (let i = rangeStart; i <= rangeEnd; i++) {
      range.push(i);
    }
    if (rangeEnd < totalPages - 1) {
      range.push("ellipsis2");
    }
    if (totalPages > 1) {
      range.push(totalPages);
    }
    return range;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>

        {/* Wallet Info Card */}
        <div className="bg-gray-900 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Wallet Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-400 mb-1">Wallet Address</p>
              <div className="flex items-center">
                <p className="font-mono text-sm mr-2">
                  {shortenAddress(address)}
                </p>
                <button
                  onClick={() => copyToClipboard(address)}
                  className="text-purple-400 hover:text-purple-300"
                  aria-label="Copy wallet address"
                >
                  {copied ? "Copied!" : <Copy size={16} />}
                </button>
                <a
                  href={`https://preview.cardanoscan.io/address/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-purple-400 hover:text-purple-300"
                  aria-label="View on explorer"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Balance</p>
              <p className="text-2xl font-bold text-purple-400">{balance}</p>
            </div>
          </div>
        </div>

        {/* NFT Collections */}
        <div className="bg-gray-900 rounded-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
            <h2 className="text-xl font-bold">My NFT Collections</h2>

            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              {/* Search Bar */}
              <div className="relative flex-grow md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search NFTs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                    aria-label="Clear search"
                  >
                    <span className="text-xl">&times;</span>
                  </button>
                )}
              </div>

              {/* Rarity Filter */}
              <div className="relative">
                <button
                  className="flex items-center space-x-1 bg-gray-800 px-3 py-2 rounded-md text-sm w-full md:w-auto justify-between"
                  onClick={() => setShowRarityDropdown(!showRarityDropdown)}
                >
                  <div className="flex items-center">
                    <Filter size={14} className="mr-2" />
                    <span>Rarity: {rarityFilter}</span>
                  </div>
                  <ChevronDown size={14} />
                </button>

                {showRarityDropdown && (
                  <div className="absolute right-0 mt-1 bg-gray-800 rounded-md shadow-lg z-10 w-full md:w-40">
                    <ul>
                      {["All", "Legendary", "Epic", "Rare", "Common"].map(
                        (r) => (
                          <li key={r}>
                            <button
                              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 ${
                                rarityFilter === r ? "text-purple-400" : ""
                              }`}
                              onClick={() => {
                                setRarityFilter(r);
                                setShowRarityDropdown(false);
                              }}
                            >
                              {r}{" "}
                              <span className="text-gray-500 ml-1">
                                ({getRarityCount(r)})
                              </span>
                            </button>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-700 mb-6">
            <button
              className={`py-2 px-4 font-medium ${
                activeTab === "weapons"
                  ? "text-purple-400 border-b-2 border-purple-400"
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setActiveTab("weapons")}
            >
              Weapons ({getFilteredTabCount("weapons")})
            </button>
            <button
              className={`py-2 px-4 font-medium ${
                activeTab === "pets"
                  ? "text-purple-400 border-b-2 border-purple-400"
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setActiveTab("pets")}
            >
              Pets ({getFilteredTabCount("pets")})
            </button>
          </div>

          {/* NFT Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentItems.map((nft: any) => (
              <div
                key={nft.id || nft.unit}
                onClick={() => lockNft(nft)}
                className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-lg hover:shadow-purple-900/20 transition-all duration-300"
              >
                <div className="relative h-40 bg-gray-700">
                  <Image
                    src={`https://gateway.pinata.cloud/ipfs/${nft.image}`}
                    alt={nft.title || nft.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold">{nft.title || nft.name}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <span
                      className={`text-sm ${
                        nft.rarity === "Legendary"
                          ? "text-yellow-400"
                          : nft.rarity === "Epic"
                          ? "text-purple-400"
                          : nft.rarity === "Rare"
                          ? "text-blue-400"
                          : "text-gray-400"
                      }`}
                    >
                      {nft.rarity}
                    </span>
                    <button className="text-gray-400 hover:text-white">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No results message */}
          {filteredNfts.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              {searchQuery
                ? `No ${activeTab} found matching "${searchQuery}" and selected filters.`
                : `No ${activeTab} found matching your filters.`}
            </div>
          )}

          {/* Pagination */}
          {filteredNfts.length > 0 && (
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-400">
                Showing {indexOfFirstItem + 1}-
                {Math.min(indexOfLastItem, filteredNfts.length)} of{" "}
                {filteredNfts.length} items
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-md ${
                    currentPage === 1
                      ? "text-gray-600 cursor-not-allowed"
                      : "text-gray-400 hover:bg-gray-800"
                  }`}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                {getPaginationRange().map((page, index) => {
                  if (page === "ellipsis1" || page === "ellipsis2") {
                    return (
                      <div
                        key={`ellipsis-${index}`}
                        className="flex items-center justify-center w-8 h-8"
                      >
                        <MoreHorizontal size={16} className="text-gray-500" />
                      </div>
                    );
                  }
                  return (
                    <button
                      key={`page-${page}`}
                      onClick={() => paginate(Number(page))}
                      className={`w-8 h-8 rounded-md ${
                        currentPage === page
                          ? "bg-purple-600 text-white"
                          : "text-gray-400 hover:bg-gray-800"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-md ${
                    currentPage === totalPages
                      ? "text-gray-600 cursor-not-allowed"
                      : "text-gray-400 hover:bg-gray-800"
                  }`}
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
