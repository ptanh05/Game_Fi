import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import ConnectionHandler from "./ConnectionHandler";
import { useRouter } from "next/router";
import { useWalletContext } from '../context/WalletContext';

export default function Header() {
  const router = useRouter();
  const currentPath = router.pathname;
  const { address } = useWalletContext();

  const getLinkClass = (path: string) => {
    return currentPath === path
      ? "text-purple-400 border-b-2 border-purple-400 pb-1"
      : "text-white hover:text-gray-300";
  };

  return (
    <>
      <Head>
        <title>Bruhtato Games - Gaming on the Cardano Blockchain</title>
        <meta
          name="description"
          content="Experience the future of gaming on the Cardano blockchain"
        />
      </Head>

      <header className="px-4 py-4 bg-[#212b3a] flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center space-x-2">
          <Image
            src="/img/Bruhtato.jpg"
            alt="Bruhtato Logo"
            width={48}
            height={48}
            className="rounded-full bg-green-500"
          />
          <span className="text-xl font-bold text-white">Bruhtato</span>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8 flex-1 justify-center">
          <Link href="/" className={getLinkClass("/")}>
            HOME
          </Link>
          <Link href="/MyAccount" className={getLinkClass("/MyAccount")}>MY ACCOUNT</Link>
          <Link href="/Marketplace" className={getLinkClass("/Marketplace")}>MARKETPLACE</Link>
          <Link href="/EarnNFTs" className={getLinkClass("/EarnNFTs")}>EARN NFTS</Link>
        </nav>

        {/* Connect Wallet Button + Address */}
        <div className="flex items-center space-x-4">
          {address && address !== "Not connected" && (
            <span className="text-xs text-purple-300 font-mono truncate max-w-[160px] hidden md:inline-block" title={address}>
              {address.substring(0, 10)}...{address.substring(address.length - 13)}
            </span>
          )}
          <div className="w-47 flex-shrink-0 flex justify-end">
            <ConnectionHandler isDisabled={false} />
          </div>
        </div>
      </header>
    </>
  );
}
