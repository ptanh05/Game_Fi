import {
  applyParamsToScript,
  BlockfrostProvider,
  MeshTxBuilder,
  serializePlutusScript,
  UTxO,
} from "@meshsdk/core";
import blueprint from "../../public/plutus.json";

export const blockchainProvider = new BlockfrostProvider(
  "previewNNOxQObPDs5JqClb5To9DKf6JpqxSiTQ"
);

export function getScript() {
  const scriptCbor = applyParamsToScript(
    blueprint.validators[0].compiledCode,
    []
  );

  const scriptAddr = serializePlutusScript({
    code: scriptCbor,
    version: "V3",
  }).address;

  console.log("Script address: ", scriptAddr);
  console.log("Script CBOR: ", scriptCbor);
  return { scriptCbor, scriptAddr };
}

export function getTxBuilder() {
  return new MeshTxBuilder({
    fetcher: blockchainProvider,
    submitter: blockchainProvider,
  });
}

// reusable function to get a UTxO by transaction hash
export async function getUtxoByTxHash(txHash: string): Promise<UTxO> {
  const utxos = await blockchainProvider.fetchUTxOs(txHash);
  if (utxos.length === 0) {
    throw new Error("UTxO not found");
  }
  return utxos[0];
}
