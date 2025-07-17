"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Key,
  ChevronRight,
  X,
  History,
  Info,
  Trophy,
  Gift,
  Star,
  Sparkles,
} from "lucide-react";
import { useWalletContext } from "~/context/WalletContext";
import { mConStr0, stringToHex } from "@meshsdk/core";
import { getScript, getTxBuilder, getUtxoByTxHash } from "~/contract/Contract";


// Ở đầu file EarnNFTs.tsx, sau các import khác
async function updateNFTStatus(txhash: string, new_status: string): Promise<any> {
  try {
    const response = await fetch("http://localhost/earnnfts/updateNFTStatus.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        txhash,
        new_status,
      }),
    });
    const data = await response.json();
    if (data.error) {
      console.error("Error updating NFT status:", data.error);
    }
    return data;
  } catch (error) {
    console.error("Error updating NFT status:", error);
  }
}


// Banner data
const bannerData = [
  {
    id: "season-1 banner",
    name: "Start of a New Journey",
    description: "Get a head start with new pets",
    type: "pets",
    featuredLegendary: {
      name: "Sword",
      image: "bafkreicafiaqog5t3xgw42xnvu7vueyfwzu5bsejfiyox3ncornpkrxezy",
      description: "Best weapon for beginners",
    },
    featuredEpics: [
      { name: "Sword", image: "bafkreicafiaqog5t3xgw42xnvu7vueyfwzu5bsejfiyox3ncornpkrxezy" },
      { name: "Sword", image: "bafkreicafiaqog5t3xgw42xnvu7vueyfwzu5bsejfiyox3ncornpkrxezy" },
      { name: "Sword", image: "bafkreicafiaqog5t3xgw42xnvu7vueyfwzu5bsejfiyox3ncornpkrxezy" },
    ],
    iconImage: "bafkreicafiaqog5t3xgw42xnvu7vueyfwzu5bsejfiyox3ncornpkrxezy",
    themeColor: "from-indigo-600 to-cyan-600",
    accentColor: "text-indigo-400",
    buttonColor: "from-indigo-500 to-cyan-600",
    buttonHoverColor: "from-indigo-600 to-cyan-700",
    itemDetails: {
      Legendary: [
        { name: "Sword", image: "bafkreicafiaqog5t3xgw42xnvu7vueyfwzu5bsejfiyox3ncornpkrxezy" },
      ],
      Epic: [
        { name: "Sword", image: "bafkreicafiaqog5t3xgw42xnvu7vueyfwzu5bsejfiyox3ncornpkrxezy" },
        { name: "Sword", image: "bafkreicafiaqog5t3xgw42xnvu7vueyfwzu5bsejfiyox3ncornpkrxezy" },
        { name: "Sword", image: "bafkreicafiaqog5t3xgw42xnvu7vueyfwzu5bsejfiyox3ncornpkrxezy" },
      ],
      Rare: [
        { name: "Sword", image: "bafkreicafiaqog5t3xgw42xnvu7vueyfwzu5bsejfiyox3ncornpkrxezy" },
        { name: "Sword", image: "bafkreicafiaqog5t3xgw42xnvu7vueyfwzu5bsejfiyox3ncornpkrxezy" },
        { name: "Sword", image: "bafkreicafiaqog5t3xgw42xnvu7vueyfwzu5bsejfiyox3ncornpkrxezy" },
      ],
      Common: [
        { name: "Sword", image: "bafkreicafiaqog5t3xgw42xnvu7vueyfwzu5bsejfiyox3ncornpkrxezy" },
        { name: "Sword", image: "bafkreicafiaqog5t3xgw42xnvu7vueyfwzu5bsejfiyox3ncornpkrxezy" },
        { name: "Sword", image: "bafkreicafiaqog5t3xgw42xnvu7vueyfwzu5bsejfiyox3ncornpkrxezy" },
      ],
    },
  },
];

async function fetchNFTsFromDB() {
  const res = await fetch("http://localhost/earnnfts/getNFTs.php");
  const data = await res.json();
  return data.data.pets; // lấy pets
}


//////////////////////////////////////////
// Wish Animation Component
//////////////////////////////////////////

// Cập nhật interface để bao gồm các prop bổ sung
interface WishAnimationProps {
  isOpen: boolean;
  onClose: () => void;
  rewards: any[];
  onSubmit: (txHashes: string[]) => void;
  updateUserData: (updatedData: any, newHistory?: any) => void;
  userKeys: number;
  userPity: { current: number; guaranteedEpic: number; guaranteedLegendary: number };
  activeBanner: any;
}

function WishAnimation({
  isOpen,
  onClose,
  rewards,
  onSubmit,
}: WishAnimationProps) {
  const [animationStage, setAnimationStage] = useState(0);
  const [currentRewardIndex, setCurrentRewardIndex] = useState(0);
  const [showSkip, setShowSkip] = useState(false);
  const [revealRarity, setRevealRarity] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const animationRef = useRef<HTMLDivElement>(null);
  const chestRef = useRef<HTMLDivElement>(null);
  const animationTimersRef = useRef<NodeJS.Timeout[]>([]);

  const getRarityValue = (rarity: string) => {
    switch (rarity) {
      case "Legendary":
        return 4;
      case "Epic":
        return 3;
      case "Rare":
        return 2;
      default:
        return 1;
    }
  };

  const rarestItem =
    rewards.length > 0
      ? rewards.reduce((prev, current) =>
          getRarityValue(current.rarity) > getRarityValue(prev.rarity)
            ? current
            : prev
        )
      : null;

  const isLegendaryAnimation = rarestItem?.rarity === "Legendary";
  const isEpicAnimation = !isLegendaryAnimation && rarestItem?.rarity === "Epic";
  const isRareAnimation =
    !isLegendaryAnimation && !isEpicAnimation && rarestItem?.rarity === "Rare";

  const sortedRewards = [...rewards].sort(
    (a, b) => getRarityValue(b.rarity) - getRarityValue(a.rarity)
  );

  const clearAllAnimationTimers = () => {
    animationTimersRef.current.forEach((timer) => clearTimeout(timer));
    animationTimersRef.current = [];
  };

  useEffect(() => {
    if (isOpen) {
      setAnimationStage(0);
      setCurrentRewardIndex(0);
      setRevealRarity(false);
      setShowSummary(false);
      clearAllAnimationTimers();
      setShowSkip(true);

      const timer1 = setTimeout(() => {
        setAnimationStage(1);
      }, 500);
      animationTimersRef.current.push(timer1);

      const timer2 = setTimeout(() => {
        setAnimationStage(2);
      }, 1000);
      animationTimersRef.current.push(timer2);

      const timer3 = setTimeout(() => {
        setAnimationStage(3);
      }, 2500);
      animationTimersRef.current.push(timer3);

      const timer4 = setTimeout(() => {
        setRevealRarity(true);
      }, 4000);
      animationTimersRef.current.push(timer4);

      const timer5 = setTimeout(() => {
        setAnimationStage(4);
      }, 5000);
      animationTimersRef.current.push(timer5);

      const timer6 = setTimeout(() => {
        setAnimationStage(5);
      }, 7000);
      animationTimersRef.current.push(timer6);

      return () => {
        clearAllAnimationTimers();
      };
    }
  }, [isOpen]);

  const handleNext = async () => {
    if (currentRewardIndex < rewards.length - 1) {
      setCurrentRewardIndex(currentRewardIndex + 1);
      setAnimationStage(5);
      setRevealRarity(true);
    } else {
      if (rewards.length === 1) {
        try {
          // Đã processing từ trước đó, chỉ cần submit transaction
        await onSubmit([rewards[0].txhash]);
        // await Promise.all(rewards.map((reward) => updateNFTStatus(reward.txhash, "remove")));
        onClose();
        } catch (error) {
          // console.error("Error processing rewards:", error);
          await Promise.all(rewards.map((reward) => updateNFTStatus(reward.txhash, "available")));
        }
      } else {
        setShowSummary(true);
      }
    }
  };

  const handleCollectAll = async () => {
    const txHashes = rewards.map((item) => item.txhash);
    try {
      // Đã processing từ trước đó, chỉ cần submit transaction
      await onSubmit(txHashes);
  
      // Xóa khỏi cache sau khi hoàn thành giao dịch
      //  await Promise.all(rewards.map((reward) => updateNFTStatus(reward.txhash, "remove")));
  
      onClose();
    } catch (error) {
      // console.error("Error processing rewards:", error);
      await Promise.all(rewards.map((reward) => updateNFTStatus(reward.txhash, "available")));
    }
  };
  

  const handleSkip = () => {
    clearAllAnimationTimers();
    if (rewards.length > 1) {
      setAnimationStage(5);
      setRevealRarity(true);
      setShowSummary(true);
    } else {
      setAnimationStage(5);
      setRevealRarity(true);
      setCurrentRewardIndex(0);
    }
  };

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

  const getCurrentRarityColors = (rarity: string) => {
    switch (rarity) {
      case "Legendary":
        return {
          glowColor: "from-yellow-500/0 via-yellow-500/70 to-yellow-500/0",
          particleColor: "bg-yellow-400",
          bgGradient: "from-yellow-900/50 to-black",
        };
      case "Epic":
        return {
          glowColor: "from-purple-500/0 via-purple-500/70 to-purple-500/0",
          particleColor: "bg-purple-400",
          bgGradient: "from-purple-900/50 to-black",
        };
      case "Rare":
        return {
          glowColor: "from-blue-500/0 via-blue-500/70 to-blue-500/0",
          particleColor: "bg-blue-400",
          bgGradient: "from-blue-900/50 to-black",
        };
      default:
        return {
          glowColor: "from-gray-500/0 via-gray-500/70 to-gray-500/0",
          particleColor: "bg-gray-400",
          bgGradient: "from-gray-800/50 to-black",
        };
    }
  };

  if (!isOpen) return null;

  const currentReward = rewards[currentRewardIndex];
  const isLegendary = currentReward?.rarity === "Legendary";
  const isEpic = currentReward?.rarity === "Epic";
  const isRare = currentReward?.rarity === "Rare";

  const glowColor = isLegendaryAnimation
    ? "from-yellow-500/0 via-yellow-500/70 to-yellow-500/0"
    : isEpicAnimation
    ? "from-purple-500/0 via-purple-500/70 to-purple-500/0"
    : isRareAnimation
    ? "from-blue-500/0 via-blue-500/70 to-blue-500/0"
    : "from-gray-500/0 via-gray-500/70 to-gray-500/0";

  const particleColor = isLegendaryAnimation
    ? "bg-yellow-400"
    : isEpicAnimation
    ? "bg-purple-400"
    : isRareAnimation
    ? "bg-blue-400"
    : "bg-gray-400";

  return (
    <div ref={animationRef} className="fixed inset-0 bg-black flex items-center justify-center z-50">
      {/* Animation Background */}
      <div className="absolute inset-0 overflow-hidden bg-gray-900">
        <div className="stars-container">
          {Array(150)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className={`absolute rounded-full transition-colors duration-500 ${
                  revealRarity
                    ? animationStage >= 5 && currentReward && !showSummary
                      ? getCurrentRarityColors(currentReward.rarity).particleColor
                      : particleColor
                    : "bg-white"
                }`}
                style={{
                  width: `${Math.random() * 4}px`,
                  height: `${Math.random() * 4}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.7,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${Math.random() * 3 + 2}s`,
                }}
              />
            ))}
        </div>
        {revealRarity && (
          <div
            className={`absolute inset-0 bg-gradient-to-b ${
              animationStage >= 5 && currentReward && !showSummary
                ? getCurrentRarityColors(currentReward.rarity).bgGradient
                : isLegendaryAnimation
                ? "from-yellow-900/50 to-black"
                : isEpicAnimation
                ? "from-purple-900/50 to-black"
                : isRareAnimation
                ? "from-blue-900/50 to-black"
                : "from-gray-800/50 to-black"
            } animate-fadeIn transition-colors duration-500`}
          />
        )}
      </div>

      {showSkip && animationStage < 5 && (
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 bg-gray-800 bg-opacity-50 text-white px-4 py-2 rounded-md text-sm z-50"
        >
          Skip
        </button>
      )}

      {animationStage >= 1 && animationStage < 5 && (
        <div
          ref={chestRef}
          className={`relative w-40 h-40 ${
            animationStage >= 3 ? "animate-chest-shake" : animationStage >= 2 ? "animate-pulse" : "animate-fadeIn"
          }`}
        >
          <div className="w-full h-full relative">
            <div className="absolute inset-0 bg-gray-700 rounded-lg shadow-lg flex items-center justify-center">
              <span className="text-6xl">🎁</span>
            </div>
          </div>
          {animationStage >= 2 && (
            <div
              className={`absolute -inset-8 bg-gradient-radial ${
                revealRarity ? glowColor : "from-white/0 via-white/30 to-white/0"
              } rounded-full animate-pulse-slow z-0`}
            ></div>
          )}
          {revealRarity && (
            <>
              {Array(8)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className={`absolute top-1/2 left-1/2 h-[300px] w-[20px] bg-gradient-to-t from-transparent ${
                      isLegendaryAnimation
                        ? "to-yellow-400"
                        : isEpicAnimation
                        ? "to-purple-400"
                        : isRareAnimation
                        ? "to-blue-400"
                        : "to-gray-400"
                    } animate-ray-rotate z-0`}
                    style={{
                      transformOrigin: "bottom center",
                      transform: `translate(-50%, -100%) rotate(${i * 45}deg)`,
                      opacity: 0.6,
                    }}
                  />
                ))}
            </>
          )}
          {animationStage === 4 && <div className="absolute inset-0 bg-white animate-flash z-10"></div>}
        </div>
      )}

      {animationStage >= 5 && currentReward && !showSummary && (
        <div className="flex flex-col items-center animate-fadeIn z-10">
          <div className="relative w-64 h-64 mb-6">
            <Image
              src={`https://gateway.pinata.cloud/ipfs/${currentReward.image}` || "/placeholder.svg"}
              alt={currentReward.name}
              fill
              className="object-contain animate-float"
            />
            <div
              className={`absolute -inset-4 bg-gradient-radial ${getCurrentRarityColors(currentReward.rarity).glowColor} rounded-full -z-10 opacity-70 animate-pulse-slow`}
            ></div>
          </div>
          <h3 className={`text-3xl font-bold mb-3 ${getRarityColor(currentReward.rarity)} animate-fadeIn-delay`}>
            {currentReward.name}
          </h3>
          <div
            className={`px-4 py-1 rounded-full ${
              isLegendary
                ? "bg-yellow-900/50 text-yellow-400 border border-yellow-500"
                : isEpic
                ? "bg-purple-900/50 text-purple-400 border border-purple-500"
                : isRare
                ? "bg-blue-900/50 text-blue-400 border border-blue-500"
                : "bg-gray-800/50 text-gray-400 border border-gray-500"
            } mb-6 animate-fadeIn-delay-2`}
          >
            {currentReward.rarity}
          </div>
          <button
            onClick={handleNext}
            className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-8 py-3 rounded-md font-medium hover:from-purple-700 hover:to-purple-900 transition-all duration-300 animate-fadeIn-delay-3"
          >
            {currentRewardIndex < rewards.length - 1 ? "Next" : rewards.length === 1 ? "Done" : "View All"}
          </button>
        </div>
      )}

      {showSummary && (
        <div className="flex flex-col items-center z-10 w-full max-w-4xl p-4 animate-fadeIn">
          <h2 className="text-3xl font-bold mb-6 text-center">
            <span className="text-white">Your Rewards</span>
            <span className="text-gray-400 text-xl ml-2">({rewards.length} items)</span>
          </h2>
          <div className="w-full px-4 mb-6">
            <div className="grid grid-cols-5 gap-4">
              {sortedRewards.slice(0, 5).map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="relative w-20 h-20 mb-2">
                    <div
                      className={`absolute -inset-1 bg-gradient-radial ${
                        item.rarity === "Legendary"
                          ? "from-yellow-500/0 via-yellow-500/30 to-yellow-500/0"
                          : item.rarity === "Epic"
                          ? "from-purple-500/0 via-purple-500/30 to-purple-500/0"
                          : item.rarity === "Rare"
                          ? "from-blue-500/0 via-blue-500/30 to-blue-500/0"
                          : "from-gray-500/0 via-gray-500/30 to-gray-500/0"
                      } rounded-full animate-pulse-slow`}
                    ></div>
                    <Image
                      src={`https://gateway.pinata.cloud/ipfs/${item.image}` || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <p className={`${getRarityColor(item.rarity)} text-sm font-medium text-center`}>{item.name}</p>
                  <span className={`text-xs ${getRarityColor(item.rarity)}`}>{item.rarity}</span>
                </div>
              ))}
            </div>
            {sortedRewards.length > 5 && (
              <div className="grid grid-cols-5 gap-4 mt-6">
                {sortedRewards.slice(5, 10).map((item, index) => (
                  <div key={index + 5} className="flex flex-col items-center">
                    <div className="relative w-20 h-20 mb-2">
                      <div
                        className={`absolute -inset-1 bg-gradient-radial ${
                          item.rarity === "Legendary"
                            ? "from-yellow-500/0 via-yellow-500/30 to-yellow-500/0"
                            : item.rarity === "Epic"
                            ? "from-purple-500/0 via-purple-500/30 to-purple-500/0"
                            : item.rarity === "Rare"
                            ? "from-blue-500/0 via-blue-500/30 to-blue-500/0"
                            : "from-gray-500/0 via-gray-500/30 to-gray-500/0"
                        } rounded-full animate-pulse-slow`}
                      ></div>
                      <Image
                        src={`https://gateway.pinata.cloud/ipfs/${item.image}` || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <p className={`${getRarityColor(item.rarity)} text-sm font-medium text-center`}>{item.name}</p>
                    <span className={`text-xs ${getRarityColor(item.rarity)}`}>{item.rarity}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleCollectAll}
            className="mt-6 bg-gradient-to-r from-purple-600 to-purple-800 text-white px-8 py-3 rounded-md font-medium hover:from-purple-700 hover:to-purple-900 transition-all duration-300 flex items-center"
          >
            <Gift className="mr-2" size={20} />
            Collect All
          </button>
        </div>
      )}

      {animationStage === 4 && (
        <div className="absolute inset-0 overflow-hidden">
          {Array(30)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className={`absolute w-2 h-2 rounded-full ${particleColor}`}
                style={{
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  animation: `particle-fly-${Math.floor(Math.random() * 4)} 1s forwards`,
                  animationDelay: `${Math.random() * 0.5}s`,
                }}
              />
            ))}
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInDelay {
          0% {
            transform: translateY(10px);
          }
          50% {
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInDelay2 {
          0% {
            transform: translateY(10px);
          }
          60% {
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInDelay3 {
          0% {
            transform: translateY(10px);
          }
          70% {
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0px);
          }
        }
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.7;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes pulseSlow {
          0% {
            transform: scale(0.95);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.8;
          }
          100% {
            transform: scale(0.95);
            opacity: 0.6;
          }
        }
        @keyframes twinkle {
          0% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.3;
          }
        }
        @keyframes chestShake {
          0% {
            transform: rotate(0deg);
          }
          20% {
            transform: rotate(-5deg);
          }
          40% {
            transform: rotate(5deg);
          }
          60% {
            transform: rotate(-3deg);
          }
          80% {
            transform: rotate(3deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }
        @keyframes rayRotate {
          0% {
            opacity: 0;
            height: 0;
          }
          20% {
            opacity: 0.7;
            height: 300px;
          }
          100% {
            opacity: 0.7;
            height: 300px;
            transform: translate(-50%, -100%) rotate(calc(var(--rotation) + 360deg));
          }
        }
        @keyframes flash {
          0% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
        @keyframes particle-fly-0 {
          0% {
            transform: translate(-50%, -50%);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -300%);
            opacity: 0;
          }
        }
        @keyframes particle-fly-1 {
          0% {
            transform: translate(-50%, -50%);
            opacity: 1;
          }
          100% {
            transform: translate(-200%, -200%);
            opacity: 0;
          }
        }
        @keyframes particle-fly-2 {
          0% {
            transform: translate(-50%, -50%);
            opacity: 1;
          }
          100% {
            transform: translate(100%, -200%);
            opacity: 0;
          }
        }
        @keyframes particle-fly-3 {
          0% {
            transform: translate(-50%, -50%);
            opacity: 1;
          }
          100% {
            transform: translate(0%, -250%);
            opacity: 0;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .animate-fadeIn-delay {
          animation: fadeInDelay 1.2s ease-out forwards;
        }
        .animate-fadeIn-delay-2 {
          animation: fadeInDelay2 1.5s ease-out forwards;
        }
        .animate-fadeIn-delay-3 {
          animation: fadeInDelay3 1.8s ease-out forwards;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulseSlow 3s ease-in-out infinite;
        }
        .animate-chest-shake {
          animation: chestShake 0.5s ease-in-out infinite;
        }
        .animate-ray-rotate {
          --rotation: 0deg;
          animation: rayRotate 3s ease-out forwards;
        }
        .animate-flash {
          animation: flash 0.5s ease-in-out forwards;
        }
        .stars-container > div {
          animation: twinkle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

//////////////////////////////////////////
// History Modal Component
//////////////////////////////////////////
interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: any[];
}

function HistoryModal({ isOpen, onClose, history }: HistoryModalProps) {
  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 bg-black/20 bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Wish History</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto flex-grow">
          <table className="w-full">
            <thead className="border-b border-gray-700">
              <tr>
                <th className="text-left py-2 px-4 text-gray-400">Item</th>
                <th className="text-left py-2 px-4 text-gray-400">Type</th>
                <th className="text-left py-2 px-4 text-gray-400">Rarity</th>
                <th className="text-left py-2 px-4 text-gray-400">Date</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id} className="border-b border-gray-800">
                  <td className="py-3 px-4">{item.name}</td>
                  <td className="py-3 px-4 capitalize">{item.type}</td>
                  <td className={`py-3 px-4 ${getRarityColor(item.rarity)}`}>{item.rarity}</td>
                  <td className="py-3 px-4 text-gray-400">
                    {new Date(item.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

//////////////////////////////////////////
// Details Modal Component
//////////////////////////////////////////
interface DetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bannerId: string;
}

function DetailsModal({ isOpen, onClose, bannerId }: DetailsModalProps) {
  if (!isOpen) return null;

  const banner = bannerData.find((b) => b.id === bannerId);
  if (!banner) return null;

  return (
    <div className="fixed inset-0 bg-black/20 bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{banner.name} Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto flex-grow">
          <div className="mb-6">
            <h4 className="text-lg font-bold text-yellow-400 mb-2">Legendary Items (1.6% Chance)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {banner.itemDetails.Legendary.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-10 h-10 relative mr-2">
                    <Image
                      src={`https://gateway.pinata.cloud/ipfs/${item.image}` || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <h4 className="text-lg font-bold text-purple-400 mb-2">Epic Items (13% Chance)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {banner.itemDetails.Epic.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-10 h-10 relative mr-2">
                    <Image
                      src={`https://gateway.pinata.cloud/ipfs/${item.image}` || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <h4 className="text-lg font-bold text-blue-400 mb-2">Rare Items (35.4% Chance)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {banner.itemDetails.Rare.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-10 h-10 relative mr-2">
                    <Image
                      src={`https://gateway.pinata.cloud/ipfs/${item.image}` || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <h4 className="text-lg font-bold text-gray-400 mb-2">Common Items (50% Chance)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {banner.itemDetails.Common.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-10 h-10 relative mr-2">
                    <Image
                      src={`https://gateway.pinata.cloud/ipfs/${item.image}` || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h4 className="font-bold mb-2">Pity System</h4>
            <ul className="list-disc pl-5 space-y-2 text-gray-300">
              <li>Guaranteed Epic or higher item every 10 wishes</li>
              <li>Guaranteed Legendary item every 90 wishes</li>
              <li>Pity counter is shared across all banners</li>
              <li>Featured Legendary item has a 50% chance when a Legendary is pulled</li>
              <li>
                If the Legendary item is not the featured one, the next Legendary is guaranteed to be the featured item
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

//////////////////////////////////////////
// Main EarnNFTs Component
//////////////////////////////////////////
export default function EarnNFTs() {
  // Khởi tạo state ban đầu, vì dữ liệu sẽ được tải từ API
  const [activeBannerId, setActiveBannerId] = useState(bannerData[0].id);
  const [userKeys, setUserKeys] = useState(0);
  const [userPity, setUserPity] = useState({
    current: 0,
    guaranteedEpic: 0,
    guaranteedLegendary: 0,
  });
  const [userHistory, setUserHistory] = useState<any[]>([]);
  const [isWishAnimationOpen, setIsWishAnimationOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [currentRewards, setCurrentRewards] = useState<any[]>([]);
  const bannerRef = useRef<HTMLDivElement>(null);
  const { wallet, address } = useWalletContext();

  const activeBanner = bannerData.find((banner) => banner.id === activeBannerId) || bannerData[0];

  // Lấy dữ liệu người dùng từ API khi address thay đổi
  useEffect(() => {
    if (address !== "Not connected") {
      fetch(`http://localhost/earnnfts/getUserData.php?address=${address}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            console.error("Error fetching user data:", data.error);
          } else {
            setUserKeys(data.user.currentkeys);
            setUserPity({
              current: data.user.pity_current,
              guaranteedEpic: data.user.pity_guaranteedEpic,
              guaranteedLegendary: data.user.pity_guaranteedLegendary,
            });
            setUserHistory(data.history);
          }
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    } else {
      // Nếu chưa connect hoặc disconnect thì reset dữ liệu người dùng
      setUserKeys(0);
      setUserPity({ current: 0, guaranteedEpic: 0, guaranteedLegendary: 0 });
      setUserHistory([]);
    }
  }, [address]);

  // Hàm cập nhật dữ liệu người dùng lên server
  const updateUserDataOnServer = (updatedData: any, newHistory?: any) => {
    fetch("http://localhost/earnnfts/updateUserData.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        address: address,
        currentkeys: String(updatedData.keys),
        pity_current: String(updatedData.pity.current),
        pity_guaranteedEpic: String(updatedData.pity.guaranteedEpic),
        pity_guaranteedLegendary: String(updatedData.pity.guaranteedLegendary),
        ...(newHistory ? { new_history: JSON.stringify(newHistory) } : {}),
      }),
    })
      .then((res) => res.json())
      .then((response) => {
        if (response.error) {
          console.error("Error updating user data:", response.error);
        } else {
          console.log("User data updated:", response.message);
        }
      })
      .catch((error) => {
        console.error("Error updating user data:", error);
      });
  };

  const handleTransaction = async (txHashes: string[]) => {
    await getNft(txHashes);
  };

  const getNft = async (txHashes: string[]) => {
    const redeemer = "GameBlockChainNeverDie!";
    const datum = 'dc703457ef9d14e1d77d050b158868b9ab9c59110f437474a3294b7d8b81051c';
    const { scriptCbor } = getScript();
    const txBuilder = getTxBuilder();
    const utxos = await wallet.getUtxos();
    console.debug("getNft called with txHashes:", txHashes);
  
    for (const txHash of txHashes) {
      const scriptUtxo = await getUtxoByTxHash("2e73d95671bc0f2904bbd68d0ae7e9d4c526df03428f048655c73aab99ffb387");
      await txBuilder
        .spendingPlutusScript("V3")
          .txIn(
            scriptUtxo.input.txHash,
            scriptUtxo.input.outputIndex,
            scriptUtxo.output.amount,
            scriptUtxo.output.address
          )
          .txInScript(scriptCbor)
          .txInDatumValue(mConStr0([datum]))
          .txInRedeemerValue(mConStr0([stringToHex(redeemer)]))
        }
          
    const collateral = (await wallet.getCollateral())[0];
    await txBuilder
      .txInCollateral(
        collateral.input.txHash,
        collateral.input.outputIndex,
        collateral.output.amount,
        collateral.output.address
      )
      .changeAddress(address)
      .selectUtxosFrom(utxos);
  
    await txBuilder.complete();
    const unsignedTx = txBuilder.txHex;
    const signedTx = await wallet.signTx(unsignedTx);
    const txHash = await wallet.submitTx(signedTx);
  };

  // Function thực hiện wish
  const performWish = async (count: number) => {
    const cost = count * 16;
    if (userKeys >= cost) {
      const pets = await fetchNFTsFromDB();
  
      const allItems = [
        ...pets.Legendary,
        ...pets.Epic,
        ...pets.Rare,
        ...pets.Common,
      ];
  
      const selectedRewards = [];
      const newPity = { ...userPity };
  
      for (let i = 0; i < count && allItems.length > 0; i++) {
        newPity.current += 1;
        newPity.guaranteedEpic += 1;
  
        let rarity = "Common";
        if (newPity.current >= 90) {
          rarity = "Legendary";
          newPity.current = 0;
        } else if (newPity.guaranteedEpic >= 10) {
          rarity = "Epic";
          newPity.guaranteedEpic = 0;
        } else {
          const rand = Math.random() * 100;
          if (rand < 1.6) {
            rarity = "Legendary";
            newPity.current = 0;
          } else if (rand < 14.6) {
            rarity = "Epic";
            newPity.guaranteedEpic = 0;
          } else if (rand < 50) {
            rarity = "Rare";
          }
        }
  
        const possibleItems = pets[rarity as keyof typeof pets];
        if (possibleItems.length === 0) continue; // Tránh lỗi nếu rarity trống
  
        const randomIndex = Math.floor(Math.random() * possibleItems.length);
        const item = possibleItems.splice(randomIndex, 1)[0];
  
        selectedRewards.push(item);
        await updateNFTStatus(item.txhash, "processing"); // cập nhật trạng thái processing
      }
  
      setUserKeys(userKeys - cost);
      setUserPity(newPity);
      setCurrentRewards(selectedRewards);
      setIsWishAnimationOpen(true);
  
      const newHistoryItems = selectedRewards.map((item) => ({
        id: new Date().getTime() + Math.random(),
        name: item.name,
        type: item.type,
        rarity: item.rarity,
        date: new Date().toISOString(),
      }));
  
      updateUserDataOnServer({ keys: userKeys - cost, pity: newPity }, newHistoryItems);
      setUserHistory((prevHistory) => [...newHistoryItems, ...prevHistory]);
    }
  };
  

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Main Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Wish</h1>
          <div className="flex items-center bg-gray-900 px-4 py-2 rounded-lg">
            <Key size={20} className="text-purple-400 mr-2" />
            <span className="text-xl font-bold">{userKeys}</span>
            <button className="ml-3 text-sm bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded">
              + Get Keys
            </button>
          </div>
        </div>
      </div>

      {/* Banner Selection & Display */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 relative">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Featured Banners</h2>
          </div>
          <div
            className={`grid gap-4 ${
              bannerData.length === 1
                ? "grid-cols-1"
                : bannerData.length === 2
                ? "grid-cols-1 sm:grid-cols-2"
                : bannerData.length === 3
                ? "grid-cols-1 sm:grid-cols-3"
                : "grid-cols-1 sm:grid-cols-2 md:grid-cols-4"
            }`}
          >
            {bannerData.slice(0, 4).map((banner) => (
              <button
                key={banner.id}
                onClick={() => setActiveBannerId(banner.id)}
                className={`relative overflow-hidden rounded-xl transition-all duration-300 ${
                  activeBannerId === banner.id
                    ? "ring-2 ring-offset-2 ring-offset-gray-900 ring-white scale-105 z-10"
                    : "opacity-80 hover:opacity-100"
                }`}
              >
                <div className="relative h-32 w-full">
                  <div className="absolute inset-0"></div>
                  <div className={`absolute inset-0 bg-gradient-to-r ${banner.themeColor} opacity-70`}></div>
                  <div className="absolute inset-0 p-4 flex flex-col justify-center items-center text-center">
                    <h3 className="font-bold text-white text-lg mb-1">{banner.name}</h3>
                    <p className="text-xs text-white text-opacity-90 line-clamp-2">{banner.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="flex justify-center mt-4 space-x-2">
            {bannerData.slice(0, 4).map((banner) => (
              <button
                key={banner.id}
                onClick={() => setActiveBannerId(banner.id)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  activeBannerId === banner.id
                    ? `w-6 bg-gradient-to-r ${banner.buttonColor}`
                    : "bg-gray-600 hover:bg-gray-500"
                }`}
                aria-label={`Select ${banner.name} banner`}
              />
            ))}
          </div>
        </div>

        <div
          ref={bannerRef}
          className="relative rounded-xl overflow-hidden mb-8 bg-gray-900 shadow-2xl shadow-black/50"
        >
          <div className="absolute inset-0 z-0 transform scale-110"></div>
          <div className={`absolute inset-0 bg-gradient-to-r ${activeBanner.themeColor} opacity-30 z-10`}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent z-10"></div>
          <div className="relative z-20 flex flex-col md:flex-row min-h-[600px]">
            <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center">
              <div className="mb-4 flex items-center">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${activeBanner.buttonColor} flex items-center justify-center mr-3`}>
                  <Sparkles className="text-white" size={20} />
                </div>
                <h2 className={`text-3xl font-bold ${activeBanner.accentColor}`}>{activeBanner.name}</h2>
              </div>
              <p className="text-gray-300 mb-6 text-lg">{activeBanner.description}</p>
              <div className="mb-6">
                <h3 className="text-sm text-gray-400 mb-3 uppercase tracking-wider font-semibold">
                  Featured Items:
                </h3>
                <div className="flex items-center mb-4 bg-gray-800 bg-opacity-95 p-4 rounded-lg border-2 border-yellow-500">
                  <div className="w-16 h-16 relative mr-4">
                    <div className="absolute -inset-1 bg-gradient-radial from-yellow-500/0 via-yellow-500/30 to-yellow-500/0 rounded-full animate-pulse-slow"></div>
                    <Image
                      src={`https://gateway.pinata.cloud/ipfs/${activeBanner.featuredLegendary.image}` || "/placeholder.svg"}
                      alt={activeBanner.featuredLegendary.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <div className="flex items-center">
                      <p className="font-bold text-yellow-400 mr-2 text-lg">
                        {activeBanner.featuredLegendary.name}
                      </p>
                      <span className="text-xs bg-yellow-900/50 text-yellow-400 border border-yellow-500 px-2 py-1 rounded-full">
                        Legendary
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mt-1 line-clamp-2">
                      {activeBanner.featuredLegendary.description}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {activeBanner.featuredEpics.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center bg-gray-800 bg-opacity-95 p-3 rounded-lg border-2 border-purple-500"
                    >
                      <div className="w-12 h-12 relative mb-2">
                        <div className="absolute -inset-1 bg-gradient-radial from-purple-500/0 via-purple-500/20 to-purple-500/0 rounded-full animate-pulse-slow"></div>
                        <Image src={`https://gateway.pinata.cloud/ipfs/${item.image}` || "/placeholder.svg"} alt={item.name} fill className="object-contain" />
                      </div>
                      <p className="text-xs text-purple-400 text-center font-medium">{item.name}</p>
                      <span className="text-xs bg-purple-900/50 text-purple-400 border border-purple-500 px-2 py-0.5 rounded-full mt-1">
                        Epic
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-800 bg-opacity-95 p-4 rounded-lg mb-6 border border-white border-2">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium">Pity Counter:</p>
                  <p className="text-sm text-yellow-400">{userPity.current}/90</p>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2.5 mb-1">
                  <div
                    className={`bg-gradient-to-r ${activeBanner.buttonColor} h-2.5 rounded-full`}
                    style={{ width: `${(userPity.current / 90) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-400">
                  Guaranteed Legendary in {90 - userPity.current} wishes
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => performWish(1)}
                  disabled={userKeys < 16}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                    userKeys >= 16
                      ? `bg-gradient-to-r ${activeBanner.buttonColor} hover:${activeBanner.buttonHoverColor} text-white shadow-lg shadow-${activeBanner.buttonColor}/20`
                      : "bg-gray-800 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <span className="mr-2">Wish x1</span>
                    <div className="flex items-center bg-black bg-opacity-30 px-2 py-1 rounded">
                      <Key size={14} className="mr-1" />
                      <span>16</span>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => performWish(10)}
                  disabled={userKeys < 160}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                    userKeys >= 160
                      ? "bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white shadow-lg shadow-amber-900/20"
                      : "bg-gray-800 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <span className="mr-2">Wish x10</span>
                    <div className="flex items-center bg-black bg-opacity-30 px-2 py-1 rounded">
                      <Key size={14} className="mr-1" />
                      <span>160</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>
            <div className="w-full md:w-1/2 relative flex items-center justify-center p-6">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative h-[400px] w-[300px]">
                  <div className="absolute -inset-10 bg-gradient-radial from-yellow-500/0 via-yellow-500/10 to-yellow-500/0 rounded-full animate-pulse-slow"></div>
                  <Image
                    src={`https://gateway.pinata.cloud/ipfs/${activeBanner.featuredLegendary.image}` || "/placeholder.svg"}
                    alt={activeBanner.featuredLegendary.name}
                    fill
                    className="object-contain animate-float"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-4 right-4 flex space-x-2 z-20">
            <button
              onClick={() => setIsDetailsModalOpen(true)}
              className="bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-70 transition-all"
              aria-label="Details"
            >
              <Info size={20} />
            </button>
            <button
              onClick={() => setIsHistoryModalOpen(true)}
              className="bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-70 transition-all"
              aria-label="History"
            >
              <History size={20} />
            </button>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 mb-8 border border-gray-800 shadow-lg">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Info className="mr-2 text-purple-400" size={20} />
            Banner Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-yellow-500/50 transition-colors">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center mr-2">
                  <Star className="text-yellow-900" size={16} />
                </div>
                <h3 className="font-bold text-yellow-400">Legendary: 1.6%</h3>
              </div>
              <p className="text-sm text-gray-300">Featured Legendary has 50% chance</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-colors">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-purple-400 rounded-full flex items-center justify-center mr-2">
                  <Star className="text-purple-900" size={16} />
                </div>
                <h3 className="font-bold text-purple-400">Epic: 13%</h3>
              </div>
              <p className="text-sm text-gray-300">Featured Epics have higher drop rates</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-blue-500/50 transition-colors">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center mr-2">
                  <Star className="text-blue-900" size={16} />
                </div>
                <h3 className="font-bold text-blue-400">Rare: 35.4%</h3>
              </div>
              <p className="text-sm text-gray-300">Uncommon items with special abilities</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-gray-500/50 transition-colors">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center mr-2">
                  <Star className="text-gray-900" size={16} />
                </div>
                <h3 className="font-bold text-gray-400">Common: 50%</h3>
              </div>
              <p className="text-sm text-gray-300">Basic items with standard abilities</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-lg">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Key className="mr-2 text-purple-400" size={20} />
            How to Get Keys
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 p-5 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-colors flex">
              <div className="mr-4 bg-gradient-to-r from-purple-600 to-purple-800 p-3 rounded-full">
                <Trophy size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold mb-2 text-lg">Complete Daily Quests</h3>
                <p className="text-sm text-gray-300">
                  Earn up to 60 keys per day by completing daily quests and challenges
                </p>
                <button className="mt-3 text-purple-400 hover:text-purple-300 flex items-center text-sm font-medium">
                  Go to Quests <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
            </div>
            <div className="bg-gray-800 p-5 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-colors flex">
              <div className="mr-4 bg-gradient-to-r from-purple-600 to-purple-800 p-3 rounded-full">
                <Key size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold mb-2 text-lg">Purchase Keys</h3>
                <p className="text-sm text-gray-300">
                  Buy keys directly using ADA to make wishes instantly
                </p>
                <button className="mt-3 text-purple-400 hover:text-purple-300 flex items-center text-sm font-medium">
                  Buy Keys <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <WishAnimation
        isOpen={isWishAnimationOpen}
        onClose={() => setIsWishAnimationOpen(false)}
        rewards={currentRewards}
        onSubmit={handleTransaction}
        updateUserData={updateUserDataOnServer} // truyền hàm update
        userKeys={userKeys} // truyền biến userKeys
        userPity={userPity}
        activeBanner={activeBanner}
      />
      <HistoryModal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} history={userHistory} />
      <DetailsModal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} bannerId={activeBannerId} />

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInDelay {
          0% {
            transform: translateY(10px);
          }
          50% {
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInDelay2 {
          0% {
            transform: translateY(10px);
          }
          60% {
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInDelay3 {
          0% {
            transform: translateY(10px);
          }
          70% {
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0px);
          }
        }
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.7;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes pulseSlow {
          0% {
            transform: scale(0.95);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.8;
          }
          100% {
            transform: scale(0.95);
            opacity: 0.6;
          }
        }
        @keyframes twinkle {
          0% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.3;
          }
        }
        @keyframes chestShake {
          0% {
            transform: rotate(0deg);
          }
          20% {
            transform: rotate(-5deg);
          }
          40% {
            transform: rotate(5deg);
          }
          60% {
            transform: rotate(-3deg);
          }
          80% {
            transform: rotate(3deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }
        @keyframes rayRotate {
          0% {
            opacity: 0;
            height: 0;
          }
          20% {
            opacity: 0.7;
            height: 300px;
          }
          100% {
            opacity: 0.7;
            height: 300px;
            transform: translate(-50%, -100%) rotate(calc(var(--rotation) + 360deg));
          }
        }
        @keyframes flash {
          0% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
        @keyframes particle-fly-0 {
          0% {
            transform: translate(-50%, -50%);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -300%);
            opacity: 0;
          }
        }
        @keyframes particle-fly-1 {
          0% {
            transform: translate(-50%, -50%);
            opacity: 1;
          }
          100% {
            transform: translate(-200%, -200%);
            opacity: 0;
          }
        }
        @keyframes particle-fly-2 {
          0% {
            transform: translate(-50%, -50%);
            opacity: 1;
          }
          100% {
            transform: translate(100%, -200%);
            opacity: 0;
          }
        }
        @keyframes particle-fly-3 {
          0% {
            transform: translate(-50%, -50%);
            opacity: 1;
          }
          100% {
            transform: translate(0%, -250%);
            opacity: 0;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .animate-fadeIn-delay {
          animation: fadeInDelay 1.2s ease-out forwards;
        }
        .animate-fadeIn-delay-2 {
          animation: fadeInDelay2 1.5s ease-out forwards;
        }
        .animate-fadeIn-delay-3 {
          animation: fadeInDelay3 1.8s ease-out forwards;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulseSlow 3s ease-in-out infinite;
        }
        .animate-chest-shake {
          animation: chestShake 0.5s ease-in-out infinite;
        }
        .animate-ray-rotate {
          --rotation: 0deg;
          animation: rayRotate 3s ease-out forwards;
        }
        .animate-flash {
          animation: flash 0.5s ease-in-out forwards;
        }
        .stars-container > div {
          animation: twinkle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
