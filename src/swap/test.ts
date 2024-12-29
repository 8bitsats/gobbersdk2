import { SignaturePubkeyPair } from "@solana/web3.js";

import { GrinSwap } from "./index";

async function testSwap() {
  try {
    console.log("Initializing GrinSwap...");
    const swap = new GrinSwap();
    await swap.initialize();

    // Example: Swap SOL for USDC
    const SOL_MINT = "So11111111111111111111111111111111111111112";
    const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

    console.log("\nGetting route for SOL -> USDC swap...");
    const route = await swap.getRoute(SOL_MINT, USDC_MINT, 1); // Swap 1 SOL
    console.log("Route Info:", {
      inputAmount: route.inputAmount,
      outputAmount: route.outputAmount,
      priceImpact: route.priceImpact,
      fee: route.fee,
      poolId: route.pool.id,
      poolType: route.pool.type,
    });

    console.log("\nExecuting swap...");
    const tx = await swap.swap(SOL_MINT, USDC_MINT, 1);
    const signature = (tx.transaction.signatures[0] as SignaturePubkeyPair).signature?.toString("base64") || "";
    console.log("Transaction:", {
      signature,
      status: "success",
    });

    console.log("\nAnalyzing transaction...");
    const analysis = await swap.analyzeTransaction(signature);
    console.log("Analysis:", {
      success: analysis.success,
      inputToken: analysis.inputToken,
      outputToken: analysis.outputToken,
      amount: analysis.amount,
    });
  } catch (error) {
    console.error("Test error:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
    }
  }
}

// Run test
testSwap();
