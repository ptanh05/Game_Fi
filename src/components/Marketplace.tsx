"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import {
  ChevronRight,
  ChevronLeft,
  Filter,
  ChevronDown,
  MoreHorizontal,
  Search,
  ShoppingCart,
  RefreshCw,
  Edit,
} from "lucide-react"

import { NFTsModal } from "./NFTsModal"
import { useMarketContext } from "~/context/MarketplaceContext"
import { useWalletContext } from "~/context/WalletContext"



export function Marketplace() {


  const [activeSection, setActiveSection] = useState("marketplace")
  const [activeCategory, setActiveCategory] = useState("all")
  const [rarityFilter, setRarityFilter] = useState("All")
  const [showRarityDropdown, setShowRarityDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [filteredItems, setFilteredItems] = useState<any[]>([])
  const [sortOption, setSortOption] = useState("price-low")
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [myListingsData, setMyListingsData] = useState<any[]>([])
  const [marketplaceData, setMarketplaceData] = useState<any[]>([])
  const itemsPerPage = 8
  const { address } = useWalletContext();

  const { marketNFTs, getGameNFTs } = useMarketContext();
  useEffect(() => {
    // Khi component mount, gọi hàm lấy dữ liệu NFT
    getGameNFTs();
  }, []);

  useEffect(() => {
    if (marketNFTs && address) {
      const myListings = marketNFTs.filter(
        (nft) =>
          nft.ownerAddress &&
          nft.ownerAddress.toLowerCase() === address.toLowerCase()
      );
      const marketplace = marketNFTs.filter(
        (nft) =>
          !nft.ownerAddress ||
          nft.ownerAddress.toLowerCase() !== address.toLowerCase()
      );
      setMyListingsData(myListings);
      setMarketplaceData(marketplace);
    }
  }, [marketNFTs, address]);

  // Các state cho modal NFTsModal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedNft, setSelectedNft] = useState<any>(null)
  const [currentAction, setCurrentAction] = useState<"buy" | "refund" | "update" | null>(null)

  // Hàm gọi modal
  const openModal = (nft: any, action: "buy" | "refund" | "update") => {
    setSelectedNft(nft)
    setCurrentAction(action)
    setIsModalOpen(true)
  }

  // Filter and sort items
  useEffect(() => {
    let items =
      activeSection === "myListings" ? [...myListingsData] : [...marketplaceData];

    // Apply Category filter
    if (activeCategory !== "all") {
      items = items.filter((item) => item.Category === activeCategory);
    }

    // Apply rarity filter
    if (rarityFilter !== "All") {
      items = items.filter((item) => item.rarity === rarityFilter);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          (item.ownerAddress && item.ownerAddress.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    if (sortOption === "price-low") {
      items.sort((a, b) => Number.parseInt(a.price) - Number.parseInt(b.price));
    } else if (sortOption === "price-high") {
      items.sort((a, b) => Number.parseInt(b.price) - Number.parseInt(a.price));
    } else if (sortOption === "rarity") {
      const rarityOrder = { Legendary: 0, Epic: 1, Rare: 2, Common: 3 };
      items.sort(
        (a, b) =>
          rarityOrder[a.rarity as keyof typeof rarityOrder] -
          rarityOrder[b.rarity as keyof typeof rarityOrder]
      );
    } else if (sortOption === "newest" && activeSection === "myListings") {
      items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    }

    setFilteredItems(items);
    setCurrentPage(1); // Reset to first page when filters change
  }, [activeSection, activeCategory, rarityFilter, searchQuery, sortOption, myListingsData, marketplaceData]);

  // Get current page items
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)

  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }

  // Generate pagination range with ellipsis
  const getPaginationRange = () => {
    const delta = 2 // Number of pages to show before and after current page
    const range = []

    // Always add page 1
    range.push(1)

    // Calculate start and end of range around current page
    const rangeStart = Math.max(2, currentPage - delta)
    const rangeEnd = Math.min(totalPages - 1, currentPage + delta)

    // Add ellipsis after page 1 if needed
    if (rangeStart > 2) {
      range.push("ellipsis1")
    }

    // Add pages around current page
    for (let i = rangeStart; i <= rangeEnd; i++) {
      range.push(i)
    }

    // Add ellipsis before last page if needed
    if (rangeEnd < totalPages - 1) {
      range.push("ellipsis2")
    }

    // Always add last page if it's not page 1
    if (totalPages > 1) {
      range.push(totalPages)
    }

    return range
  }

  const getRarityCount = (rarity: string) => {
    if (rarity === "All") {
      return filteredItems.length
    }
    return filteredItems.filter((item) => item.rarity === rarity).length
  }

  const getCategoryCount = (Category: string) => {
    const items = activeSection === "myListings" ? [...myListingsData] : [...marketplaceData]

    if (Category === "all") {
      return items.length
    }
    return items.filter((item) => item.Category === Category).length
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">NFT Marketplace</h1>

        {/* Section Tabs */}
        <div className="flex border-b border-gray-700 mb-6">
          <button
            className={`py-2 px-4 font-medium ${activeSection === "marketplace" ? "text-purple-400 border-b-2 border-purple-400" : "text-gray-400 hover:text-white"}`}
            onClick={() => setActiveSection("marketplace")}
          >
            Marketplace
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeSection === "myListings" ? "text-purple-400 border-b-2 border-purple-400" : "text-gray-400 hover:text-white"}`}
            onClick={() => setActiveSection("myListings")}
          >
            My Listings
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-gray-900 rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div className="flex flex-wrap gap-4 mb-4 md:mb-0">
              {/* Category Filters */}
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium ${activeCategory === "all" ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
                onClick={() => setActiveCategory("all")}
              >
                All ({getCategoryCount("all")})
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium ${activeCategory === "weapons" ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
                onClick={() => setActiveCategory("weapons")}
              >
                Weapons ({getCategoryCount("weapons")})
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium ${activeCategory === "pets" ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
                onClick={() => setActiveCategory("pets")}
              >
                Pets ({getCategoryCount("pets")})
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search items..."
                  className="bg-gray-800 text-white px-4 py-2 pl-10 rounded-md w-full sm:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              </div>

              {/* Rarity Filter */}
              <div className="relative">
                <button
                  className="flex items-center space-x-1 bg-gray-800 px-3 py-2 rounded-md text-sm w-full sm:w-auto justify-between"
                  onClick={() => setShowRarityDropdown(!showRarityDropdown)}
                >
                  <div className="flex items-center">
                    <Filter size={14} className="mr-1" />
                    <span>Rarity: {rarityFilter}</span>
                  </div>
                  <ChevronDown size={14} />
                </button>

                {showRarityDropdown && (
                  <div className="absolute right-0 mt-1 bg-gray-800 rounded-md shadow-lg z-10 w-40">
                    <ul>
                      {["All", "Legendary", "Epic", "Rare", "Common"].map((rarity) => (
                        <li key={rarity}>
                          <button
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 ${rarityFilter === rarity ? "text-purple-400" : ""}`}
                            onClick={() => {
                              setRarityFilter(rarity)
                              setShowRarityDropdown(false)
                            }}
                          >
                            {rarity} <span className="text-gray-500 ml-1">({getRarityCount(rarity)})</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Sort Options */}
              <div className="relative">
                <button
                  className="flex items-center space-x-1 bg-gray-800 px-3 py-2 rounded-md text-sm w-full sm:w-auto justify-between"
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                >
                  <div className="flex items-center">
                    <ChevronDown size={14} className="mr-1 rotate-180" />
                    <span>
                      {sortOption === "price-low"
                        ? "Price: Low to High"
                        : sortOption === "price-high"
                          ? "Price: High to Low"
                          : sortOption === "rarity"
                            ? "Rarity"
                            : "Newest"}
                    </span>
                  </div>
                  <ChevronDown size={14} />
                </button>

                {showSortDropdown && (
                  <div className="absolute right-0 mt-1 bg-gray-800 rounded-md shadow-lg z-10 w-48">
                    <ul>
                      <li>
                        <button
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 ${sortOption === "price-low" ? "text-purple-400" : ""}`}
                          onClick={() => {
                            setSortOption("price-low")
                            setShowSortDropdown(false)
                          }}
                        >
                          Price: Low to High
                        </button>
                      </li>
                      <li>
                        <button
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 ${sortOption === "price-high" ? "text-purple-400" : ""}`}
                          onClick={() => {
                            setSortOption("price-high")
                            setShowSortDropdown(false)
                          }}
                        >
                          Price: High to Low
                        </button>
                      </li>
                      <li>
                        <button
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 ${sortOption === "rarity" ? "text-purple-400" : ""}`}
                          onClick={() => {
                            setSortOption("rarity")
                            setShowSortDropdown(false)
                          }}
                        >
                          Rarity
                        </button>
                      </li>
                      {activeSection === "myListings" && (
                        <li>
                          <button
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 ${sortOption === "newest" ? "text-purple-400" : ""}`}
                            onClick={() => {
                              setSortOption("newest")
                              setShowSortDropdown(false)
                            }}
                          >
                            Newest
                          </button>
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-400 mb-4">
            Showing {filteredItems.length} {activeCategory === "all" ? "items" : activeCategory} in{" "}
            {activeSection === "myListings" ? "my listings" : "marketplace"}
          </div>

          {/* NFT Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentItems.map((item) => (
              <div
                key={item.id}
                className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-lg hover:shadow-purple-900/20 transition-all duration-300"
              >
                <div className="relative h-40 bg-gray-700">
                  <Image src={item.image ? `https://gateway.pinata.cloud/ipfs/${item.image}` : "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                  <div className="absolute top-2 right-2 bg-gray-900 bg-opacity-70 px-2 py-1 rounded text-xs font-medium">
                    {item.Category === "weapons" ? "Weapon" : "Pet"}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold truncate">{item.name}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <span
                      className={`text-sm ${
                        item.rarity === "Legendary"
                          ? "text-yellow-400"
                          : item.rarity === "Epic"
                            ? "text-purple-400"
                            : item.rarity === "Rare"
                              ? "text-blue-400"
                              : "text-gray-400"
                      }`}
                    >
                      {item.rarity}
                    </span>
                    <span className="text-sm text-gray-300">{item.price} ADA</span>
                  </div>

                  {activeSection === "marketplace" ? (
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-xs text-gray-400 truncate max-w-[120px]">Seller: {item.ownerAddress}</span>
                      <button onClick={() => openModal(item, "buy")}  
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md text-sm flex items-center">
                        <ShoppingCart size={14} className="mr-1" />
                        Buy
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-xs text-gray-400">Listed: {item.time}</span>
                      <div className="flex space-x-2">
                        <button onClick={() => openModal(item, "update")} className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-md text-sm flex items-center">
                          <Edit size={14} className="mr-1" /> Update
                        </button>
                        <button onClick={() => openModal(item, "refund")} className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-md text-sm flex items-center">
                          <RefreshCw size={14} className="mr-1" /> Refund
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {isModalOpen && selectedNft && currentAction && (
            <NFTsModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              nft={selectedNft}
              action={currentAction}
            />
          )}

          {filteredItems.length === 0 && (
            <div className="text-center py-12 text-gray-400">No items found matching your filters.</div>
          )}

          {/* Pagination */}
          {filteredItems.length > 0 && (
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-400">
                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredItems.length)} of{" "}
                {filteredItems.length} items
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-md ${currentPage === 1 ? "text-gray-600 cursor-not-allowed" : "text-gray-400 hover:bg-gray-800"}`}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>

                {getPaginationRange().map((page, index) => {
                  if (page === "ellipsis1" || page === "ellipsis2") {
                    return (
                      <div key={`ellipsis-${index}`} className="flex items-center justify-center w-8 h-8">
                        <MoreHorizontal size={16} className="text-gray-500" />
                      </div>
                    )
                  }

                  return (
                    <button
                      key={`page-${page}`}
                      onClick={() => paginate(page as number)}
                      className={`w-8 h-8 rounded-md ${
                        currentPage === page ? "bg-purple-600 text-white" : "text-gray-400 hover:bg-gray-800"
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-md ${currentPage === totalPages ? "text-gray-600 cursor-not-allowed" : "text-gray-400 hover:bg-gray-800"}`}
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
  )
}