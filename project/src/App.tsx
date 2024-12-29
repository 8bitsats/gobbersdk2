import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { useMemo } from "react";

import { Swap } from "./components/Swap";

// Default styles that can be overridden by your app
require("@solana/wallet-adapter-react-ui/styles.css");

function App() {
  // Get network from environment variables
  const network = (import.meta.env.VITE_SOLANA_NETWORK || "mainnet-beta") as WalletAdapterNetwork;

  // Get RPC endpoint from environment variables
  const endpoint = import.meta.env.VITE_HELIUS_RPC_URL || clusterApiUrl(network);

  // Initialize all the wallets you want to use
  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter({ network })], [network]);

  // Enable logging if specified in environment
  if (import.meta.env.VITE_ENABLE_LOGGING === "true") {
    console.log("Network:", network);
    console.log("Endpoint:", endpoint);
  }

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="App fade-in">
            <Swap />
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
