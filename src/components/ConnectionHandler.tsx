import { useState } from 'react';
import { useWalletList } from "@meshsdk/react";
import { useWalletContext } from '../context/WalletContext';

interface Props {
  isDisabled: boolean;
}

export default function ConnectionHandler(props: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { connected, connect, disconnect } = useWalletContext();
  const wallets = useWalletList();

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <>
      {connected ? (
        <button
          onClick={disconnect}
          disabled={props.isDisabled}
          className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-6 py-2 rounded-md font-medium shadow-lg hover:from-purple-700 hover:to-purple-900 transition-all duration-300 border border-purple-500 hover:shadow-purple-900/30 disabled:opacity-50"
        >
          Disconnect Wallet
        </button>
      ) : (
        <>
          <button
            onClick={handleOpen}
            disabled={props.isDisabled}
            className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-6 py-2 rounded-md font-medium shadow-lg hover:from-purple-700 hover:to-purple-900 transition-all duration-300 border border-purple-500 hover:shadow-purple-900/30 disabled:opacity-50"
          >
            Connect Wallet
          </button>

          {isOpen && (
            <div
              onClick={handleClose}
              className="fixed inset-0 z-40 flex items-center justify-center bg-black/30"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="z-50 bg-gray-900 rounded-lg p-6 w-full max-w-md mx-4 shadow-lg"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-100">Choose a Wallet</h2>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3">
                  {wallets.map((wallet, index) => (
                    <div
                      key={index}
                      onClick={async () => {
                        await connect(wallet.name)
                        handleClose()
                      }}
                      className="flex items-center justify-between p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-all duration-200 transform hover:scale-105"
                    >
                      <span className="font-bold text-gray-300 uppercase">{wallet.name}</span>
                      <img
                        src={wallet.icon}
                        alt={`${wallet.name} icon`}
                        className="w-12 h-12 object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}