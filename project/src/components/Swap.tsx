import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";

import { GrinSwap } from "../../../src/swap";

import "./Swap.css";

const SOL_MINT = "So11111111111111111111111111111111111111112";
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

// Get slippage settings from environment
const DEFAULT_SLIPPAGE = Number(import.meta.env.VITE_DEFAULT_SLIPPAGE || 0.5);
const MAX_SLIPPAGE = Number(import.meta.env.VITE_MAX_SLIPPAGE || 5);

export const Swap = () => {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [amount, setAmount] = useState("1");
  const [route, setRoute] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [swap, setSwap] = useState<GrinSwap | null>(null);
  const [slippage, setSlippage] = useState(DEFAULT_SLIPPAGE);
  const [txSignature, setTxSignature] = useState<string | null>(null);

  useEffect(() => {
    const initSwap = async () => {
      const swapInstance = new GrinSwap();
      await swapInstance.initialize();
      setSwap(swapInstance);
    };

    initSwap();
  }, []);

  const getRoute = async () => {
    if (!swap) return;

    setLoading(true);
    setError("");
    try {
      const routeInfo = await swap.getRoute(SOL_MINT, USDC_MINT, Number(amount));
      setRoute(routeInfo);
    } catch (err) {
      console.error("Route error:", err);
      setError(err instanceof Error ? err.message : "Failed to get route");
    }
    setLoading(false);
  };

  const executeSwap = async () => {
    if (!swap || !route || !publicKey) return;

    setLoading(true);
    setError("");
    try {
      const tx = await swap.swap(SOL_MINT, USDC_MINT, Number(amount));
      const signature = tx.transaction.signatures[0].signature?.toString("base64") || "";
      setTxSignature(signature);
      console.log("Transaction successful:", signature);

      // Analyze transaction
      const analysis = await swap.analyzeTransaction(signature);
      console.log("Transaction analysis:", analysis);

      // Clear route after successful swap
      setRoute(null);
    } catch (err) {
      console.error("Swap error:", err);
      setError(err instanceof Error ? err.message : "Swap failed");
    }
    setLoading(false);
  };

  const handleSlippageChange = (value: string) => {
    const newSlippage = Number(value);
    if (newSlippage >= 0 && newSlippage <= MAX_SLIPPAGE) {
      setSlippage(newSlippage);
    }
  };

  return (
    <div className="swap-container">
      <h1>Grin Gobbler Swap</h1>

      <div className="wallet-section">
        <WalletMultiButton />
      </div>

      {connected ? (
        <div className="swap-section">
          <div className="input-section">
            <label htmlFor="amount-input">Amount (SOL)</label>
            <input
              id="amount-input"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.1"
              aria-label="Enter amount in SOL"
              placeholder="Enter amount to swap"
            />
          </div>

          <div className="slippage-section">
            <label htmlFor="slippage-input">Slippage Tolerance (%)</label>
            <input
              id="slippage-input"
              type="number"
              value={slippage}
              onChange={(e) => handleSlippageChange(e.target.value)}
              min="0"
              max={MAX_SLIPPAGE}
              step="0.1"
              aria-label="Set slippage tolerance"
            />
          </div>

          <div className="token-section" role="group" aria-label="Token selection">
            <div className="token-item">
              <span className="token-label">From:</span>
              <span className="token-value">SOL</span>
            </div>
            <div className="token-divider">→</div>
            <div className="token-item">
              <span className="token-label">To:</span>
              <span className="token-value">USDC</span>
            </div>
          </div>

          <button onClick={getRoute} disabled={loading || !amount} className="route-button" aria-label="Get swap route">
            {loading ? "Calculating..." : "Get Route"}
          </button>

          {route && (
            <div className="route-info" role="region" aria-label="Swap route information">
              <h3>Route Information</h3>
              <div className="route-details">
                <div className="route-item">
                  <span className="route-label">Input Amount:</span>
                  <span className="route-value">{route.inputAmount} SOL</span>
                </div>
                <div className="route-item">
                  <span className="route-label">Output Amount:</span>
                  <span className="route-value">{route.outputAmount} USDC</span>
                </div>
                <div className="route-item">
                  <span className="route-label">Price Impact:</span>
                  <span className="route-value">{route.priceImpact}%</span>
                </div>
                <div className="route-item">
                  <span className="route-label">Fee:</span>
                  <span className="route-value">{route.fee}</span>
                </div>
                <div className="route-item">
                  <span className="route-label">Slippage Tolerance:</span>
                  <span className="route-value">{slippage}%</span>
                </div>
              </div>

              <button onClick={executeSwap} disabled={loading} className="swap-button" aria-label="Execute swap">
                {loading ? "Swapping..." : "Swap"}
              </button>
            </div>
          )}

          {error && (
            <div className="error" role="alert">
              {error}
            </div>
          )}

          {txSignature && (
            <div className="success" role="status">
              Transaction successful! Signature: {txSignature.slice(0, 8)}...
            </div>
          )}

          {loading && (
            <div className="loading" role="status">
              <span className="loading-spinner"></span>
              <span className="loading-text">Processing...</span>
            </div>
          )}
        </div>
      ) : (
        <div className="connect-prompt">Please connect your wallet to start swapping</div>
      )}
    </div>
  );
};
