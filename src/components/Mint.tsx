import React, { useState, useEffect } from "react";
import {
  deserializeAddress,
  ForgeScript,
  MeshTxBuilder,
  resolveScriptHash,
  stringToHex,
  Transaction,
} from "@meshsdk/core";
import { useWalletContext } from "~/context/WalletContext";
import { PinataSDK } from "pinata-web3";
import { BlockfrostProvider } from "@meshsdk/core";

const PINATA_JWT =
  process.env.NEXT_PUBLIC_PINATA_JWT || process.env.PINATA_JWT || "";
const PINATA_GATEWAY =
  process.env.NEXT_PUBLIC_PINATA_GATEWAY || process.env.PINATA_GATEWAY || "";

export default function Mint() {
  const [credit, setCredit] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [rarity, setRarity] = useState("Legendary");
  const [atk, setAtk] = useState(100);
  const [atkspeed, setAtkSpeed] = useState(30);
  const [mpconsume, setMpConsume] = useState(10);
  const [critrate, setCritRate] = useState(60);
  const [rechargeable, setRechargeable] = useState(1);
  const [multishoot, setMultiShoot] = useState(1);
  const [typeProp, setTypeProp] = useState("pets");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onFileUploadHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredit(e.target.files?.[0] || null);
  };

  const handleClick = () => {
    document.getElementById("upload-file")?.click();
  };

  const { wallet, connected } = useWalletContext();

  const pinata = new PinataSDK({
    pinataJwt: PINATA_JWT,
    pinataGateway: PINATA_GATEWAY,
  });

  async function mintToken() {
    if (loading) return;
    setMessage(null);
    setLoading(true);
    try {
      if (!credit) {
        setMessage("No file selected");
        setLoading(false);
        return;
      }
      if (!connected || !wallet) {
        setMessage("Wallet not connected");
        setLoading(false);
        return;
      }
      if (!title || title.trim().length === 0) {
        setMessage("Please enter a title for your asset");
        setLoading(false);
        return;
      }
      const cleanTitle = title.trim().substring(0, 32);
      const byteLength = new TextEncoder().encode(cleanTitle).length;
      if (byteLength > 32) {
        setMessage(
          `Title is too long. Maximum 32 bytes allowed, current: ${byteLength} bytes`
        );
        setLoading(false);
        return;
      }
      if (cleanTitle.length !== title.length) {
        setMessage(
          `Title will be truncated to ${cleanTitle.length} characters`
        );
        setLoading(false);
        return;
      }
      console.log("Starting mint process...");
      const usedAddress = await wallet.getUsedAddresses();
      if (!usedAddress || usedAddress.length === 0) {
        throw new Error("No wallet address found");
      }
      const utxos = await wallet.getUtxos();
      if (!utxos || utxos.length === 0) {
        throw new Error("No UTXOs found in wallet");
      }
      const blockchainProvider = new BlockfrostProvider(
        "previewNNOxQObPDs5JqClb5To9DKf6JpqxSiTQ"
      );
      const address = usedAddress[0];
      const { pubKeyHash: keyHash } = deserializeAddress(address);
      console.log("Wallet address:", address);
      console.log("UTXOs count:", utxos.length);
      const nativeScript: any = {
        type: "all",
        scripts: [
          {
            type: "before",
            slot: "99999999",
          },
          {
            type: "sig",
            keyHash: keyHash,
          },
        ],
      };
      const forgingScript = ForgeScript.fromNativeScript(nativeScript);
      const policyId = resolveScriptHash(forgingScript);
      console.log("Uploading file to IPFS...");
      const formData = new FormData();
      formData.append("file", credit);
      const response = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${PINATA_JWT}` },
          body: formData,
        }
      );
      if (!response.ok) {
        let errorMsg = `IPFS upload failed: ${response.status} ${response.statusText}`;
        try {
          const errorJson = await response.json();
          errorMsg += ` | ${JSON.stringify(errorJson)}`;
        } catch {}
        throw new Error(errorMsg);
      }
      const upload = await response.json();
      const ipfsHash = upload.IpfsHash;
      console.log("File uploaded to IPFS:", ipfsHash);
      const tokenName = title;
      if (!tokenName || tokenName.trim().length === 0) {
        throw new Error("Token name cannot be empty");
      }
      const cleanTokenName = tokenName.trim().substring(0, 32);
      if (cleanTokenName.length !== tokenName.length) {
        console.warn(
          `Token name truncated from ${tokenName.length} to ${cleanTokenName.length} characters`
        );
      }
      const tokenNameByteLength = new TextEncoder().encode(
        cleanTokenName
      ).length;
      if (tokenNameByteLength > 32) {
        throw new Error(
          `Token name byte length (${tokenNameByteLength}) exceeds 32 bytes limit`
        );
      }
      const tokenNameHex = stringToHex(cleanTokenName);
      const isVideo = credit.type.startsWith("video/");
      const mediaType = isVideo ? credit.type : "image/jpg";
      const metadata = {
        [policyId]: {
          [cleanTokenName]: {
            name: cleanTokenName,
            image: ipfsHash,
            mediaType: mediaType,
            rarity: rarity,
            atk: atk,
            atkspeed: atkspeed,
            mpconsume: mpconsume,
            critrate: critrate,
            rechargeable: rechargeable,
            multishoot: multishoot,
            type: typeProp,
          },
        },
      };
      console.log("Building transaction...");
      const txBuilder = new MeshTxBuilder({
        fetcher: blockchainProvider,
        verbose: true,
      });
      const unsignedTx = await txBuilder
        .mint(quantity.toString(), policyId, tokenNameHex)
        .mintingScript(forgingScript)
        .metadataValue("721", metadata)
        .changeAddress(address)
        .invalidHereafter(99999999)
        .selectUtxosFrom(utxos)
        .complete();
      console.log("Transaction built, signing...");
      const signedTx = await wallet.signTx(unsignedTx);
      console.log("Transaction signed, submitting...");
      const txHash = await wallet.submitTx(signedTx);
      console.log("Transaction submitted successfully:", txHash);
      setMessage(`Mint successful! Transaction hash: ${txHash}`);
      // Gợi ý: Gọi API backend để lưu NFT vào nfts_cache ở đây nếu muốn
      // await fetch("/api/inventory/nfts_cache", { method: "POST", ... })
      // Reset form
      setCredit(null);
      setTitle("");
      setDescription("");
      setQuantity(1);
      setRarity("Legendary");
      setAtk(100);
      setAtkSpeed(30);
      setMpConsume(10);
      setCritRate(60);
      setRechargeable(1);
      setMultiShoot(1);
      setTypeProp("pets");
    } catch (e: any) {
      setMessage(`Mint failed: ${e.message}`);
      console.error("Error during minting:", e);
    }
    setLoading(false);
  }

  useEffect(() => {
    setTitle("");
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <main className="flex flex-col items-center py-8">
        <h1 className="text-3xl font-bold text-[#1E834B] mb-4">
          Mint Your Asset
        </h1>
        <section className="w-full max-w-2xl p-4">
          <h2 className="text-xl font-semibold mb-2">
            Upload Your Asset (Image or Video)
          </h2>
          {message && (
            <div className="mb-4 text-center text-sm text-blue-700 bg-blue-100 rounded p-2">
              {message}
            </div>
          )}
          <div className="border-2 border-dashed border-gray-400 p-8 mb-4 text-center">
            <p className="text-gray-500 mb-4">
              {credit ? credit.name : "UPLOAD YOUR ASSET (IMAGE OR VIDEO)"}
            </p>
            <button
              onClick={handleClick}
              className="bg-[#1E834B] text-white cursor-pointer px-4 py-2 rounded"
              disabled={loading}
            >
              Upload
            </button>
            <input
              hidden
              type="file"
              id="upload-file"
              accept="image/*,video/*"
              onChange={onFileUploadHandler}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="title" className="block mb-1 font-semibold">
              Your Title (Max 32 characters)
            </label>
            <input
              id="title"
              placeholder="Enter your title"
              className="w-full border px-2 py-1 rounded"
              value={title}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 32) {
                  setTitle(value);
                }
              }}
              maxLength={32}
            />
            <div className="text-sm text-gray-500 mt-1">
              {title.length}/32 characters
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block mb-1 font-semibold">
              Description
            </label>
            <textarea
              id="description"
              placeholder="Description of your asset"
              className="w-full border px-2 py-1 rounded"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          {/* New input fields for metadata */}
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="rarity" className="block mb-1 font-semibold">
                Rarity
              </label>
              <input
                id="rarity"
                placeholder="Rarity"
                className="w-full border px-2 py-1 rounded"
                value={rarity}
                onChange={(e) => setRarity(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="atk" className="block mb-1 font-semibold">
                ATK
              </label>
              <input
                id="atk"
                type="number"
                placeholder="ATK"
                className="w-full border px-2 py-1 rounded"
                value={atk}
                onChange={(e) => setAtk(parseInt(e.target.value, 10))}
              />
            </div>
            <div>
              <label htmlFor="atkspeed" className="block mb-1 font-semibold">
                Atk Speed
              </label>
              <input
                id="atkspeed"
                type="number"
                placeholder="Attack Speed"
                className="w-full border px-2 py-1 rounded"
                value={atkspeed}
                onChange={(e) => setAtkSpeed(parseInt(e.target.value, 10))}
              />
            </div>
            <div>
              <label htmlFor="mpconsume" className="block mb-1 font-semibold">
                MP Consume
              </label>
              <input
                id="mpconsume"
                type="number"
                placeholder="MP Consume"
                className="w-full border px-2 py-1 rounded"
                value={mpconsume}
                onChange={(e) => setMpConsume(parseInt(e.target.value, 10))}
              />
            </div>
            <div>
              <label htmlFor="critrate" className="block mb-1 font-semibold">
                Crit Rate
              </label>
              <input
                id="critrate"
                type="number"
                placeholder="Crit Rate"
                className="w-full border px-2 py-1 rounded"
                value={critrate}
                onChange={(e) => setCritRate(parseInt(e.target.value, 10))}
              />
            </div>
            <div>
              <label
                htmlFor="rechargeable"
                className="block mb-1 font-semibold"
              >
                Rechargeable
              </label>
              <input
                id="rechargeable"
                type="number"
                placeholder="Rechargeable"
                className="w-full border px-2 py-1 rounded"
                value={rechargeable}
                onChange={(e) => setRechargeable(parseInt(e.target.value, 10))}
              />
            </div>
            <div>
              <label htmlFor="multishoot" className="block mb-1 font-semibold">
                Multi Shoot
              </label>
              <input
                id="multishoot"
                type="number"
                placeholder="Multi Shoot"
                className="w-full border px-2 py-1 rounded"
                value={multishoot}
                onChange={(e) => setMultiShoot(parseInt(e.target.value, 10))}
              />
            </div>
            <div>
              <label htmlFor="typeProp" className="block mb-1 font-semibold">
                Type
              </label>
              <input
                id="typeProp"
                placeholder="Type"
                className="w-full border px-2 py-1 rounded"
                value={typeProp}
                onChange={(e) => setTypeProp(e.target.value)}
              />
            </div>
          </div>
          <div className="mb-4 flex items-center space-x-3">
            <label htmlFor="quantity" className="block font-semibold">
              Quantity:
            </label>
            <input
              id="quantity"
              type="number"
              className="w-25 text-center border px-2 py-1 rounded"
              value={quantity.toString()}
              onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
            />
          </div>
          {credit && connected ? (
            <button
              onClick={() => mintToken()}
              className="bg-[#1E834B] text-white w-full px-4 py-2 rounded"
              disabled={loading}
            >
              {loading ? "Minting..." : "Mint"}
            </button>
          ) : (
            <button
              className="bg-[#1E834B] text-white w-full px-4 py-2 rounded"
              disabled
            >
              Mint
            </button>
          )}
        </section>
      </main>
    </div>
  );
}
