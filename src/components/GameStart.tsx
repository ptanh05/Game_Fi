"use client";
import { useUnityContext, Unity } from 'react-unity-webgl';
import { useRef, useEffect } from 'react';
import { useWalletContext } from '~/context/WalletContext';

const GameStart = () => {
  const { connected, address } = useWalletContext();
  const { unityProvider, loadingProgression, isLoaded, sendMessage } = useUnityContext({
    loaderUrl: '/Build/Test.loader.js',
    dataUrl: '/Build/Test.data',
    frameworkUrl: '/Build/Test.framework.js',
    codeUrl: '/Build/Test.wasm',
  });

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Gửi PlayerID khi Unity đã load và có address
  useEffect(() => {
    if (isLoaded && connected && address !== "Not connected") {
      try {
        sendMessage("EventSystem", "SetPlayerID", address);
        console.log("✅ PlayerID sent to Unity:", address);
      } catch (error) {
        console.error("❌ Failed to send PlayerID:", error);
      }
    }
  }, [isLoaded, connected, address, sendMessage]);

  return (
    <div ref={containerRef} className="game-container">
      {!isLoaded && (
        <div className="loading-overlay">
          <p className="text-2xl">
            Loading... {Math.round(loadingProgression * 100)}%
          </p>
        </div>
      )}
      <Unity unityProvider={unityProvider} className="unity-canvas" />
    </div>
  );
};

export default GameStart;