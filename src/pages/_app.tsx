import type { AppProps } from "next/app"
import '../styles/globals.css';
import Header from "../components/Header"
import Footer from "../components/Footer"
import { MeshProvider } from "@meshsdk/react"
import { WalletProvider } from "../context/WalletContext"
import { useRouter } from "next/router"
import { ContractProvider } from "~/context/ContractContext";
import { MarketProvider } from "~/context/MarketplaceContext";


function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // Hide header & footer if path starts with "/Game"
  const isGameRoute = router.pathname.startsWith("/Game");
  return (
    <MeshProvider>
      <WalletProvider>
      <MarketProvider>
      <ContractProvider> 
        {!isGameRoute && (
          <header>
            <Header />
          </header>
        )}

        <main>
          <Component {...pageProps} />
        </main>

        {!isGameRoute && (
          <footer>
            <Footer />
          </footer>
        )}

        </ContractProvider>
        </MarketProvider>
      </WalletProvider>
    </MeshProvider>
  )
}

export default MyApp