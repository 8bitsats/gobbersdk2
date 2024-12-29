import { Connection, PublicKey } from "@solana/web3.js";
import BN from "bn.js";

import { AmmV4Keys, ApiV3PoolInfoStandardItem } from "../api/type";
import { TokenAmount } from "../module/amount";
import { Token } from "../module/token";
import { Raydium } from "../raydium/raydium";

export class GrinSwap {
  private raydium!: Raydium;
  private connection: Connection;

  constructor() {
    this.connection = new Connection(process.env.HELIUS_RPC_URL || "", {
      commitment: "confirmed",
      wsEndpoint: process.env.HELIUS_WSS_URL,
    });
  }

  async initialize() {
    this.raydium = await Raydium.load({
      connection: this.connection,
      cluster: "mainnet",
      apiRequestTimeout: 30000,
    });
  }

  async getRoute(inputMint: string, outputMint: string, amount: number) {
    const inputTokenInfo = await this.raydium.token.getTokenInfo(new PublicKey(inputMint));
    if (!inputTokenInfo) throw new Error("Input token not found");
    const inputToken = new Token({
      mint: new PublicKey(inputTokenInfo.address),
      decimals: inputTokenInfo.decimals,
      symbol: inputTokenInfo.symbol,
      name: inputTokenInfo.name,
    });

    const outputTokenInfo = await this.raydium.token.getTokenInfo(new PublicKey(outputMint));
    if (!outputTokenInfo) throw new Error("Output token not found");

    const inputAmount = new TokenAmount(inputToken, amount);

    // Get pool information from Raydium
    const poolList = await this.raydium.api.getPoolList();
    const pool = poolList.data.find(
      (p) =>
        p.type === "Standard" &&
        ((p.mintA.address === inputMint && p.mintB.address === outputMint) ||
          (p.mintA.address === outputMint && p.mintB.address === inputMint)),
    ) as ApiV3PoolInfoStandardItem;

    if (!pool) throw new Error("No pool found for this pair");

    // Get pool keys
    const poolKeys = await this.raydium.api.fetchPoolKeysById({
      idList: [pool.id],
    });

    // Ensure we have AmmV4Keys
    const ammPoolKeys = poolKeys[0] as AmmV4Keys;
    if (!ammPoolKeys) throw new Error("Invalid pool keys");

    // Get pool info with reserves
    const poolInfo = {
      ...pool,
      baseReserve: new BN(pool.mintAmountA),
      quoteReserve: new BN(pool.mintAmountB),
      version: 4 as const,
      status: 1,
    };

    // Compute swap route
    const amountOuts = await this.raydium.liquidity.computeAmountOut({
      poolInfo,
      amountIn: inputAmount.raw,
      mintIn: inputToken.mint,
      mintOut: new PublicKey(outputMint),
      slippage: 0.5,
    });

    return {
      inputAmount: amountOuts.amountOut.toString(),
      outputAmount: amountOuts.minAmountOut.toString(),
      priceImpact: amountOuts.priceImpact.toString(),
      fee: amountOuts.fee.toString(),
      pool,
      poolKeys: ammPoolKeys,
    };
  }

  async swap(inputMint: string, outputMint: string, amount: number) {
    const route = await this.getRoute(inputMint, outputMint, amount);

    // Execute swap transaction
    const tx = await this.raydium.liquidity.swap({
      poolInfo: route.pool,
      poolKeys: route.poolKeys,
      amountIn: new BN(route.inputAmount),
      amountOut: new BN(route.outputAmount),
      fixedSide: "in",
      inputMint,
      config: {
        associatedOnly: true,
      },
    });

    return tx;
  }

  // AI Agent for transaction indexing and analysis
  async analyzeTransaction(signature: string) {
    const txInfo = await this.connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });

    if (!txInfo) throw new Error("Transaction not found");

    const logs = txInfo.meta?.logMessages || [];
    const swapLogs = logs.filter((log) => log.includes("Program log: Instruction: Swap"));

    // Parse swap details from logs
    const parsedSwap = {
      signature,
      timestamp: txInfo.blockTime,
      success: txInfo.meta?.err === null,
      logs: swapLogs,
      inputToken: this.parseTokenFromLogs(swapLogs, "input"),
      outputToken: this.parseTokenFromLogs(swapLogs, "output"),
      amount: this.parseAmountFromLogs(swapLogs),
    };

    return parsedSwap;
  }

  private parseTokenFromLogs(logs: string[], type: "input" | "output"): string | null {
    for (const log of logs) {
      if (log.includes(`${type} token:`)) {
        const match = log.match(new RegExp(`${type} token: (\\w+)`));
        if (match) return match[1];
      }
    }
    return null;
  }

  private parseAmountFromLogs(logs: string[]): string | null {
    for (const log of logs) {
      if (log.includes("amount:")) {
        const match = log.match(/amount: (\d+)/);
        if (match) return match[1];
      }
    }
    return null;
  }
}
