import { PublicKey } from "@solana/web3.js";
import { AccountLayout, NATIVE_MINT, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  ApiV3PoolInfoConcentratedItem,
  ApiV3PoolInfoStandardItem,
  AmmV4Keys,
  AmmV5Keys,
} from "@/api/type";
import { Token, TokenAmount, Percent } from "@/module";
import { toToken } from "../token";
import { BN_ZERO, divCeil } from "@/common/bignumber";
import { getATAAddress } from "@/common/pda";
import { InstructionType, TxVersion } from "@/common/txTool/txType";
import { MakeMultiTxData, MakeTxData } from "@/common/txTool/txTool";
import { BNDivCeil } from "@/common/transfer";
import { getMultipleAccountsInfoWithCustomFlags } from "@/common/accountInfo";
import ModuleBase, { ModuleBaseProps } from "../moduleBase";
import {
  AmountSide,
  AddLiquidityParams,
  RemoveParams,
  CreatePoolParam,
  CreatePoolAddress,
  ComputeAmountOutParam,
  SwapParam,
  AmmRpcData,
} from "./type";
import {
  makeAddLiquidityInstruction,
  removeLiquidityInstruction,
  createPoolV4InstructionV2,
  makeAMMSwapInstruction,
} from "./instruction";
import { ComputeBudgetConfig } from "../type";
import { ClmmInstrument } from "../clmm/instrument";
import { getAssociatedPoolKeys, getAssociatedConfigId, toAmmComputePoolInfo } from "./utils";
import { createPoolFeeLayout, liquidityStateV4Layout } from "./layout";

import { StableLayout, getStablePrice, getDyByDxBaseIn, getDxByDyBaseIn } from "./stable";
import { LIQUIDITY_FEES_NUMERATOR, LIQUIDITY_FEES_DENOMINATOR } from "./constant";

import BN from "bn.js";
import Decimal from "decimal.js";
import { WSOLMint } from "@/common";

export default class LiquidityModule extends ModuleBase {
  public stableLayout: StableLayout;

  constructor(params: ModuleBaseProps) {
    super(params);
    this.stableLayout = new StableLayout({ connection: this.scope.connection });
  }

  public async initLayout(): Promise<void> {
    await this.stableLayout.initStableModelLayout();
  }

  public async load(): Promise<void> {
    this.checkDisabled();
  }

  public computePairAmount({
    poolInfo,
    amount,
    // anotherToken,
    slippage,
    baseIn,
  }: {
    poolInfo: ApiV3PoolInfoStandardItem;
    amount: string | Decimal;
    slippage: Percent;
    baseIn?: boolean;
  }): { anotherAmount: TokenAmount; maxAnotherAmount: TokenAmount; liquidity: BN } {
    const inputAmount = new BN(new Decimal(amount).mul(10 ** poolInfo[baseIn ? "mintA" : "mintB"].decimals).toFixed(0));
    const _anotherToken = toToken(poolInfo[baseIn ? "mintB" : "mintA"]);

    const [baseReserve, quoteReserve] = [
      new BN(new Decimal(poolInfo.mintAmountA).mul(10 ** poolInfo.mintA.decimals).toString()),
      new BN(new Decimal(poolInfo.mintAmountB).mul(10 ** poolInfo.mintB.decimals).toString()),
    ];
    const lpAmount = new BN(
      new Decimal(poolInfo.lpAmount).mul(10 ** poolInfo.lpMint.decimals).toFixed(0, Decimal.ROUND_DOWN),
    );
    this.logDebug("baseReserve:", baseReserve.toString(), "quoteReserve:", quoteReserve.toString());

    this.logDebug(
      "tokenIn:",
      baseIn ? poolInfo.mintA.symbol : poolInfo.mintB.symbol,
      "amountIn:",
      inputAmount.toString(),
      "anotherToken:",
      baseIn ? poolInfo.mintB.symbol : poolInfo.mintA.symbol,
      "slippage:",
      `${slippage.toSignificant()}%`,
      "baseReserve",
      baseReserve.toString(),
      "quoteReserve",
      quoteReserve.toString(),
    );

    // input is fixed
    const input = baseIn ? "base" : "quote";
    this.logDebug("input side:", input);

    // round up
    let amountRaw = BN_ZERO;
    if (!inputAmount.isZero()) {
      amountRaw =
        input === "base"
          ? divCeil(inputAmount.mul(quoteReserve), baseReserve)
          : divCeil(inputAmount.mul(baseReserve), quoteReserve);
    }

    this.logDebug("amountRaw:", amountRaw.toString(), "lpAmount:", lpAmount.toString());

    const liquidity = divCeil(inputAmount.mul(lpAmount), input === "base" ? baseReserve : quoteReserve);

    this.logDebug("liquidity:", liquidity.toString());

    const _slippage = new Percent(new BN(1)).add(slippage);
    const slippageAdjustedAmount = _slippage.mul(amountRaw).quotient;

    const _anotherAmount = new TokenAmount(_anotherToken, amountRaw);
    const _maxAnotherAmount = new TokenAmount(_anotherToken, slippageAdjustedAmount);
    this.logDebug("anotherAmount:", _anotherAmount.toFixed(), "maxAnotherAmount:", _maxAnotherAmount.toFixed());

    return {
      anotherAmount: _anotherAmount,
      maxAnotherAmount: _maxAnotherAmount,
      liquidity,
    };
  }

  public async getAmmPoolKeys(poolId: string): Promise<AmmV4Keys | AmmV5Keys> {
    return ((await this.scope.api.fetchPoolKeysById({ idList: [poolId] })) as (AmmV4Keys | AmmV5Keys)[])[0];
  }

  public async addLiquidity<T extends TxVersion>(params: AddLiquidityParams<T>): Promise<MakeTxData<T>> {
    const {
      poolInfo,
      poolKeys: propPoolKeys,
      amountInA,
      amountInB,
      fixedSide,
      config,
      txVersion,
      computeBudgetConfig,
    } = params;

    if (this.scope.availability.addStandardPosition === false)
      this.logAndCreateError("add liquidity feature disabled in your region");

    this.logDebug("amountInA:", amountInA, "amountInB:", amountInB);
    if (amountInA.isZero() || amountInB.isZero())
      this.logAndCreateError("amounts must greater than zero", "amountInA & amountInB", {
        amountInA: amountInA.toFixed(),
        amountInB: amountInB.toFixed(),
      });
    const { account } = this.scope;
    const { bypassAssociatedCheck, checkCreateATAOwner } = {
      // default
      ...{ bypassAssociatedCheck: false, checkCreateATAOwner: false },
      // custom
      ...config,
    };
    const [tokenA, tokenB] = [amountInA.token, amountInB.token];
    const tokenAccountA = await account.getCreatedTokenAccount({
      mint: tokenA.mint,
      associatedOnly: false,
    });
    const tokenAccountB = await account.getCreatedTokenAccount({
      mint: tokenB.mint,
      associatedOnly: false,
    });
    if (!tokenAccountA && !tokenAccountB)
      this.logAndCreateError("cannot found target token accounts", "tokenAccounts", account.tokenAccounts);

    const lpTokenAccount = await account.getCreatedTokenAccount({
      mint: new PublicKey(poolInfo.lpMint.address),
    });

    const tokens = [tokenA, tokenB];
    const _tokenAccounts = [tokenAccountA, tokenAccountB];
    const rawAmounts = [amountInA.raw, amountInB.raw];

    // handle amount a & b and direction
    const sideA = amountInA.token.mint.toBase58() === poolInfo.mintA.address ? "base" : "quote";
    let _fixedSide: AmountSide = "base";
    if (!["quote", "base"].includes(sideA)) this.logAndCreateError("invalid fixedSide", "fixedSide", fixedSide);
    if (sideA === "quote") {
      tokens.reverse();
      _tokenAccounts.reverse();
      rawAmounts.reverse();
      _fixedSide = fixedSide === "a" ? "quote" : "base";
    } else if (sideA === "base") {
      _fixedSide = fixedSide === "a" ? "base" : "quote";
    }

    const [baseToken, quoteToken] = tokens;
    const [baseTokenAccount, quoteTokenAccount] = _tokenAccounts;
    const [baseAmountRaw, quoteAmountRaw] = rawAmounts;

    const poolKeys = propPoolKeys ?? (await this.getAmmPoolKeys(poolInfo.id));

    const txBuilder = this.createTxBuilder();

    const { tokenAccount: _baseTokenAccount, ...baseInstruction } = await account.handleTokenAccount({
      side: "in",
      amount: baseAmountRaw,
      mint: baseToken.mint,
      tokenAccount: baseTokenAccount,
      bypassAssociatedCheck,
      checkCreateATAOwner,
    });
    txBuilder.addInstruction(baseInstruction);
    const { tokenAccount: _quoteTokenAccount, ...quoteInstruction } = await account.handleTokenAccount({
      side: "in",
      amount: quoteAmountRaw,
      mint: quoteToken.mint,
      tokenAccount: quoteTokenAccount,
      bypassAssociatedCheck,
      checkCreateATAOwner,
    });
    txBuilder.addInstruction(quoteInstruction);
    const { tokenAccount: _lpTokenAccount, ...lpInstruction } = await account.handleTokenAccount({
      side: "out",
      amount: 0,
      mint: new PublicKey(poolInfo.lpMint.address),
      tokenAccount: lpTokenAccount,
      bypassAssociatedCheck,
      checkCreateATAOwner,
    });
    txBuilder.addInstruction(lpInstruction);
    txBuilder.addInstruction({
      instructions: [
        makeAddLiquidityInstruction({
          poolInfo,
          poolKeys: poolKeys as AmmV4Keys | AmmV5Keys,
          userKeys: {
            baseTokenAccount: _baseTokenAccount!,
            quoteTokenAccount: _quoteTokenAccount!,
            lpTokenAccount: _lpTokenAccount!,
            owner: this.scope.ownerPubKey,
          },
          baseAmountIn: baseAmountRaw,
          quoteAmountIn: quoteAmountRaw,
          fixedSide: _fixedSide,
        }),
      ],
      instructionTypes: [
        poolInfo.pooltype.includes("StablePool")
          ? InstructionType.AmmV5AddLiquidity
          : InstructionType.AmmV4AddLiquidity,
      ],
      lookupTableAddress: poolKeys.lookupTableAccount ? [poolKeys.lookupTableAccount] : [],
    });
    txBuilder.addCustomComputeBudget(computeBudgetConfig);
    if (txVersion === TxVersion.V0) (await txBuilder.buildV0()) as MakeTxData<T>;
    return txBuilder.build() as MakeTxData<T>;
  }

  public async removeLiquidity<T extends TxVersion>(params: RemoveParams<T>): Promise<Promise<MakeTxData<T>>> {
    if (this.scope.availability.removeStandardPosition === false)
      this.logAndCreateError("remove liquidity feature disabled in your region");
    const { poolInfo, poolKeys: propPoolKeys, amountIn, config, txVersion, computeBudgetConfig } = params;
    const poolKeys = propPoolKeys ?? (await this.getAmmPoolKeys(poolInfo.id));
    const [baseMint, quoteMint, lpMint] = [
      new PublicKey(poolInfo.mintA.address),
      new PublicKey(poolInfo.mintB.address),
      new PublicKey(poolInfo.lpMint.address),
    ];
    this.logDebug("amountIn:", amountIn);
    if (amountIn.isZero()) this.logAndCreateError("amount must greater than zero", "amountIn", amountIn.toString());

    const { account } = this.scope;
    const lpTokenAccount = await account.getCreatedTokenAccount({
      mint: lpMint,
      associatedOnly: false,
    });
    if (!lpTokenAccount) this.logAndCreateError("cannot found lpTokenAccount", "tokenAccounts", account.tokenAccounts);

    const baseTokenAccount = await account.getCreatedTokenAccount({
      mint: baseMint,
    });
    const quoteTokenAccount = await account.getCreatedTokenAccount({
      mint: quoteMint,
    });

    const txBuilder = this.createTxBuilder();
    const { bypassAssociatedCheck, checkCreateATAOwner } = {
      // default
      ...{ bypassAssociatedCheck: false, checkCreateATAOwner: false },
      // custom
      ...config,
    };

    const { tokenAccount: _baseTokenAccount, ...baseInstruction } = await account.handleTokenAccount({
      side: "out",
      amount: 0,
      mint: baseMint,
      tokenAccount: baseTokenAccount,
      bypassAssociatedCheck,
      checkCreateATAOwner,
    });
    txBuilder.addInstruction(baseInstruction);
    const { tokenAccount: _quoteTokenAccount, ...quoteInstruction } = await account.handleTokenAccount({
      side: "out",
      amount: 0,
      mint: quoteMint,
      tokenAccount: quoteTokenAccount,
      bypassAssociatedCheck,
      checkCreateATAOwner,
    });
    txBuilder.addInstruction(quoteInstruction);

    txBuilder.addInstruction({
      instructions: [
        removeLiquidityInstruction({
          poolInfo,
          poolKeys,
          userKeys: {
            lpTokenAccount: lpTokenAccount!,
            baseTokenAccount: _baseTokenAccount!,
            quoteTokenAccount: _quoteTokenAccount!,
            owner: this.scope.ownerPubKey,
          },
          amountIn,
        }),
      ],
      lookupTableAddress: poolKeys.lookupTableAccount ? [poolKeys.lookupTableAccount] : [],
      instructionTypes: [
        poolInfo.pooltype.includes("StablePool")
          ? InstructionType.AmmV5RemoveLiquidity
          : InstructionType.AmmV4RemoveLiquidity,
      ],
    });
    txBuilder.addCustomComputeBudget(computeBudgetConfig);
    if (txVersion === TxVersion.V0) return (await txBuilder.buildV0()) as MakeTxData<T>;
    return txBuilder.build() as MakeTxData<T>;
  }

  public async removeAllLpAndCreateClmmPosition<T extends TxVersion>({
    poolInfo,
    clmmPoolInfo,
    removeLpAmount,
    createPositionInfo,
    farmInfo,
    userFarmLpAmount,
    base,
    computeBudgetConfig,
    payer,
    userAuxiliaryLedgers,
    tokenProgram = TOKEN_PROGRAM_ID,
    checkCreateATAOwner = true,
    getEphemeralSigners,
    txVersion,
  }: {
    poolInfo: ApiV3PoolInfoStandardItem;
    clmmPoolInfo: ApiV3PoolInfoConcentratedItem;
    removeLpAmount: BN;
    createPositionInfo: {
      tickLower: number;
      tickUpper: number;
      baseAmount: BN;
      otherAmountMax: BN;
    };
    farmInfo?: any;
    userFarmLpAmount?: BN;
    userAuxiliaryLedgers?: PublicKey[];
    base: "MintA" | "MintB";
    payer?: PublicKey;
    computeBudgetConfig?: ComputeBudgetConfig;
    tokenProgram?: PublicKey;
    checkCreateATAOwner?: boolean;
    txVersion?: T;
    getEphemeralSigners?: (k: number) => any;
  }): Promise<MakeMultiTxData<T>> {
    if (
      this.scope.availability.removeStandardPosition === false ||
      this.scope.availability.createConcentratedPosition === false
    )
      this.logAndCreateError("remove liquidity or create position feature disabled in your region");

    if (
      !(poolInfo.mintA.address === clmmPoolInfo.mintA.address || poolInfo.mintA.address === clmmPoolInfo.mintB.address)
    )
      throw Error("mint check error");
    if (
      !(poolInfo.mintB.address === clmmPoolInfo.mintA.address || poolInfo.mintB.address === clmmPoolInfo.mintB.address)
    )
      throw Error("mint check error");

    const txBuilder = this.createTxBuilder();
    txBuilder.addCustomComputeBudget(computeBudgetConfig);
    const mintToAccount: { [mint: string]: PublicKey } = {};
    for (const item of this.scope.account.tokenAccountRawInfos) {
      if (
        mintToAccount[item.accountInfo.mint.toString()] === undefined ||
        getATAAddress(this.scope.ownerPubKey, item.accountInfo.mint, TOKEN_PROGRAM_ID).publicKey.equals(item.pubkey)
      ) {
        mintToAccount[item.accountInfo.mint.toString()] = item.pubkey;
      }
    }

    const lpTokenAccount = mintToAccount[poolInfo.lpMint.address];
    if (lpTokenAccount === undefined) throw Error("find lp account error in trade accounts");

    const amountIn = removeLpAmount.add(userFarmLpAmount ?? new BN(0));
    const mintBaseUseSOLBalance = poolInfo.mintA.address === Token.WSOL.mint.toString();
    const mintQuoteUseSOLBalance = poolInfo.mintB.address === Token.WSOL.mint.toString();

    const { account: baseTokenAccount, instructionParams: ownerTokenAccountBaseInstruction } =
      await this.scope.account.getOrCreateTokenAccount({
        tokenProgram: TOKEN_PROGRAM_ID,
        mint: new PublicKey(poolInfo.mintA.address),
        owner: this.scope.ownerPubKey,

        createInfo: mintBaseUseSOLBalance
          ? {
              payer: this.scope.ownerPubKey,
            }
          : undefined,
        skipCloseAccount: !mintBaseUseSOLBalance,
        notUseTokenAccount: mintBaseUseSOLBalance,
        associatedOnly: true,
        checkCreateATAOwner,
      });
    txBuilder.addInstruction(ownerTokenAccountBaseInstruction || {});
    if (baseTokenAccount === undefined) throw new Error("base token account not found");

    const { account: quoteTokenAccount, instructionParams: ownerTokenAccountQuoteInstruction } =
      await this.scope.account.getOrCreateTokenAccount({
        tokenProgram: TOKEN_PROGRAM_ID,
        mint: new PublicKey(poolInfo.mintB.address),
        owner: this.scope.ownerPubKey,
        createInfo: mintQuoteUseSOLBalance
          ? {
              payer: this.scope.ownerPubKey!,
              amount: 0,
            }
          : undefined,
        skipCloseAccount: !mintQuoteUseSOLBalance,
        notUseTokenAccount: mintQuoteUseSOLBalance,
        associatedOnly: true,
        checkCreateATAOwner,
      });
    txBuilder.addInstruction(ownerTokenAccountQuoteInstruction || {});
    if (quoteTokenAccount === undefined) throw new Error("quote token account not found");

    mintToAccount[poolInfo.mintA.address] = baseTokenAccount;
    mintToAccount[poolInfo.mintB.address] = quoteTokenAccount;
      const insParams = {
        userAuxiliaryLedgers,
        amount: userFarmLpAmount!,
        owner: this.scope.ownerPubKey,
        farmInfo,
        lpAccount: lpTokenAccount,
        rewardAccounts: [],
      };

      const insType = {
        3: InstructionType.FarmV3Withdraw,
        5: InstructionType.FarmV5Withdraw,
        6: InstructionType.FarmV6Withdraw,
      };

    const poolKeys = await this.getAmmPoolKeys(poolInfo.id);

    const removeIns = removeLiquidityInstruction({
      poolInfo,
      poolKeys,
      userKeys: {
        lpTokenAccount,
        baseTokenAccount,
        quoteTokenAccount,
        owner: this.scope.ownerPubKey,
      },
      amountIn,
    });

    txBuilder.addInstruction({
      instructions: [removeIns],
      instructionTypes: [
        !poolInfo.pooltype.includes("StablePool")
          ? InstructionType.AmmV4RemoveLiquidity
          : InstructionType.AmmV5RemoveLiquidity,
      ],
      lookupTableAddress: poolKeys.lookupTableAccount ? [poolKeys.lookupTableAccount] : [],
    });

    const [tokenAccountA, tokenAccountB] =
      poolInfo.mintA.address === clmmPoolInfo.mintA.address
        ? [baseTokenAccount, quoteTokenAccount]
        : [quoteTokenAccount, baseTokenAccount];

    const clmmPoolKeys = await this.scope.clmm.getClmmPoolKeys(poolInfo.id);

    const createPositionIns = await ClmmInstrument.openPositionFromBaseInstructions({
      poolInfo: clmmPoolInfo,
      poolKeys: clmmPoolKeys,
      ownerInfo: {
        feePayer: this.scope.ownerPubKey,
        wallet: this.scope.ownerPubKey,
        tokenAccountA,
        tokenAccountB,
      },
      withMetadata: "create",
      ...createPositionInfo,
      base,
      getEphemeralSigners,
    });

    txBuilder.addInstruction({
      instructions: [...createPositionIns.instructions],
      signers: createPositionIns.signers,
      instructionTypes: [...createPositionIns.instructionTypes],
      lookupTableAddress: clmmPoolKeys.lookupTableAccount ? [clmmPoolKeys.lookupTableAccount] : [],
    });

    if (txVersion === TxVersion.V0) return txBuilder.sizeCheckBuildV0() as Promise<MakeMultiTxData<T>>;
    return txBuilder.sizeCheckBuild() as Promise<MakeMultiTxData<T>>;
  }

  public async createPoolV4<T extends TxVersion>({
    programId,
    marketInfo,
    baseMintInfo,
    quoteMintInfo,
    baseAmount,
    quoteAmount,
    startTime,
    ownerInfo,
    associatedOnly = false,
    checkCreateATAOwner = false,
    tokenProgram,
    txVersion,
    feeDestinationId,
    computeBudgetConfig,
  }: CreatePoolParam<T>): Promise<MakeTxData<T, { address: CreatePoolAddress }>> {
    const payer = ownerInfo.feePayer || this.scope.owner?.publicKey;
    const mintAUseSOLBalance = ownerInfo.useSOLBalance && baseMintInfo.mint.equals(NATIVE_MINT);
    const mintBUseSOLBalance = ownerInfo.useSOLBalance && quoteMintInfo.mint.equals(NATIVE_MINT);

    const txBuilder = this.createTxBuilder();

    const { account: ownerTokenAccountBase, instructionParams: ownerTokenAccountBaseInstruction } =
      await this.scope.account.getOrCreateTokenAccount({
        mint: baseMintInfo.mint,
        owner: this.scope.ownerPubKey,
        createInfo: mintAUseSOLBalance
          ? {
              payer: payer!,
              amount: baseAmount,
            }
          : undefined,
        notUseTokenAccount: mintAUseSOLBalance,
        skipCloseAccount: !mintAUseSOLBalance,
        associatedOnly: mintAUseSOLBalance ? false : associatedOnly,
        checkCreateATAOwner,
      });
    txBuilder.addInstruction(ownerTokenAccountBaseInstruction || {});

    const { account: ownerTokenAccountQuote, instructionParams: ownerTokenAccountQuoteInstruction } =
      await this.scope.account.getOrCreateTokenAccount({
        mint: quoteMintInfo.mint,
        owner: this.scope.ownerPubKey,
        createInfo: mintBUseSOLBalance
          ? {
              payer: payer!,
              amount: quoteAmount,
            }
          : undefined,

        notUseTokenAccount: mintBUseSOLBalance,
        skipCloseAccount: !mintBUseSOLBalance,
        associatedOnly: mintBUseSOLBalance ? false : associatedOnly,
        checkCreateATAOwner,
      });
    txBuilder.addInstruction(ownerTokenAccountQuoteInstruction || {});

    if (ownerTokenAccountBase === undefined || ownerTokenAccountQuote === undefined)
      throw Error("you don't has some token account");

    const poolInfo = getAssociatedPoolKeys({
      version: 4,
      marketVersion: 3,
      marketId: marketInfo.marketId,
      baseMint: baseMintInfo.mint,
      quoteMint: quoteMintInfo.mint,
      baseDecimals: baseMintInfo.decimals,
      quoteDecimals: quoteMintInfo.decimals,
      programId,
      marketProgramId: marketInfo.programId,
    });

    const createPoolKeys = {
      programId,
      ammId: poolInfo.id,
      ammAuthority: poolInfo.authority,
      ammOpenOrders: poolInfo.openOrders,
      lpMint: poolInfo.lpMint,
      coinMint: poolInfo.baseMint,
      pcMint: poolInfo.quoteMint,
      coinVault: poolInfo.baseVault,
      pcVault: poolInfo.quoteVault,
      withdrawQueue: poolInfo.withdrawQueue,
      ammTargetOrders: poolInfo.targetOrders,
      poolTempLp: poolInfo.lpVault,
      marketProgramId: poolInfo.marketProgramId,
      marketId: poolInfo.marketId,
      ammConfigId: poolInfo.configId,
      feeDestinationId,
    };

    const { instruction, instructionType } = createPoolV4InstructionV2({
      ...createPoolKeys,
      userWallet: this.scope.ownerPubKey,
      userCoinVault: ownerTokenAccountBase,
      userPcVault: ownerTokenAccountQuote,
      userLpVault: getATAAddress(this.scope.ownerPubKey, poolInfo.lpMint, tokenProgram).publicKey,

      nonce: poolInfo.nonce,
      openTime: startTime,
      coinAmount: baseAmount,
      pcAmount: quoteAmount,
    });

    txBuilder.addInstruction({
      instructions: [instruction],
      instructionTypes: [instructionType],
    });

    txBuilder.addCustomComputeBudget(computeBudgetConfig);

    return txBuilder.versionBuild({
      txVersion,
      extInfo: {
        address: createPoolKeys,
      },
    }) as Promise<MakeTxData<T, { address: CreatePoolAddress }>>;
  }

  public async getCreatePoolFee({ programId }: { programId: PublicKey }): Promise<BN> {
    const configId = getAssociatedConfigId({ programId });

    const account = await this.scope.connection.getAccountInfo(configId, { dataSlice: { offset: 536, length: 8 } });
    if (account === null) throw Error("get config account error");

    return createPoolFeeLayout.decode(account.data).fee;
  }

  public computeAmountOut({
    poolInfo,
    amountIn,
    mintIn: propMintIn,
    mintOut: propMintOut,
    slippage,
  }: ComputeAmountOutParam): {
    amountOut: BN;
    minAmountOut: BN;
    currentPrice: Decimal;
    executionPrice: Decimal;
    priceImpact: Decimal;
    fee: BN;
  } {
    const [mintIn, mintOut] = [propMintIn.toString(), propMintOut.toString()];
    if (mintIn !== poolInfo.mintA.address && mintIn !== poolInfo.mintB.address) throw new Error("toke not match");
    if (mintOut !== poolInfo.mintA.address && mintOut !== poolInfo.mintB.address) throw new Error("toke not match");

    const { baseReserve, quoteReserve } = poolInfo;

    const reserves = [baseReserve, quoteReserve];

    // input is fixed
    const input = mintIn == poolInfo.mintA.address ? "base" : "quote";
    if (input === "quote") {
      reserves.reverse();
    }

    const [reserveIn, reserveOut] = reserves;
    const isVersion4 = poolInfo.version === 4;
    let currentPrice: Decimal;
    if (isVersion4) {
      currentPrice = new Decimal(reserveOut.toString()).div(reserveIn.toString());
    } else {
      const p = getStablePrice(
        this.stableLayout.stableModelData,
        baseReserve.toNumber(),
        quoteReserve.toNumber(),
        false,
      );
      if (input === "quote") currentPrice = new Decimal(1e6).div(p * 1e6);
      else currentPrice = new Decimal(p * 1e6).div(1e6);
    }

    const amountInRaw = amountIn;
    let amountOutRaw = new BN(0);
    let feeRaw = new BN(0);

    if (!amountInRaw.isZero()) {
      if (isVersion4) {
        feeRaw = BNDivCeil(amountInRaw.mul(LIQUIDITY_FEES_NUMERATOR), LIQUIDITY_FEES_DENOMINATOR);
        const amountInWithFee = amountInRaw.sub(feeRaw);

        const denominator = reserveIn.add(amountInWithFee);
        amountOutRaw = reserveOut.mul(amountInWithFee).div(denominator);
      } else {
        feeRaw = amountInRaw.mul(new BN(2)).div(new BN(10000));
        const amountInWithFee = amountInRaw.sub(feeRaw);
        if (input === "quote")
          amountOutRaw = new BN(
            getDyByDxBaseIn(
              this.stableLayout.stableModelData,
              quoteReserve.toNumber(),
              baseReserve.toNumber(),
              amountInWithFee.toNumber(),
            ),
          );
        else {
          amountOutRaw = new BN(
            getDxByDyBaseIn(
              this.stableLayout.stableModelData,
              quoteReserve.toNumber(),
              baseReserve.toNumber(),
              amountInWithFee.toNumber(),
            ),
          );
        }
      }
    }

    const minAmountOutRaw = new BN(new Decimal(amountOutRaw.toString()).mul(1 - slippage).toFixed(0));

    const amountOut = amountOutRaw;
    const minAmountOut = minAmountOutRaw;

    let executionPrice = new Decimal(amountOutRaw.toString()).div(
      new Decimal(amountInRaw.sub(feeRaw).toString()).toFixed(0),
    );
    if (!amountInRaw.isZero() && !amountOutRaw.isZero()) {
      // executionPrice = new Price(currencyIn, amountInRaw.sub(feeRaw), currencyOut, amountOutRaw);
      executionPrice = new Decimal(amountOutRaw.toString()).div(amountInRaw.sub(feeRaw).toString());
    }

    const priceImpact = currentPrice.sub(executionPrice).div(currentPrice).mul(100);

    // logger.debug("priceImpact:", `${priceImpact.toSignificant()}%`);

    const fee = feeRaw;

    return {
      amountOut,
      minAmountOut,
      currentPrice,
      executionPrice,
      priceImpact,
      fee,
    };
  }

  public async swap<T extends TxVersion>({
    poolInfo,
    poolKeys: propPoolKeys,
    amountIn,
    amountOut,
    inputMint,
    fixedSide,
    txVersion,
    config,
    computeBudgetConfig,
  }: SwapParam<T>): Promise<MakeTxData<T>> {
    const txBuilder = this.createTxBuilder();
    const { associatedOnly = true, inputUseSolBalance = true, outputUseSolBalance = true } = config || {};

    const [tokenIn, tokenOut] =
      inputMint === poolInfo.mintA.address ? [poolInfo.mintA, poolInfo.mintB] : [poolInfo.mintB, poolInfo.mintA];

    const inputTokenUseSolBalance = inputUseSolBalance && tokenIn.address === WSOLMint.toBase58();
    const outputTokenUseSolBalance = outputUseSolBalance && tokenOut.address === WSOLMint.toBase58();

    const { account: _tokenAccountIn, instructionParams: ownerTokenAccountBaseInstruction } =
      await this.scope.account.getOrCreateTokenAccount({
        tokenProgram: TOKEN_PROGRAM_ID,
        mint: new PublicKey(tokenIn.address),
        owner: this.scope.ownerPubKey,

        createInfo: inputTokenUseSolBalance
          ? {
              payer: this.scope.ownerPubKey,
              amount: amountIn,
            }
          : undefined,
        skipCloseAccount: !inputTokenUseSolBalance,
        notUseTokenAccount: inputTokenUseSolBalance,
        associatedOnly,
      });
    txBuilder.addInstruction(ownerTokenAccountBaseInstruction || {});

    if (!_tokenAccountIn)
      this.logAndCreateError("input token account not found", {
        token: tokenIn.symbol || tokenIn.address,
        tokenAccountIn: _tokenAccountIn,
        inputTokenUseSolBalance,
        associatedOnly,
      });

    const { account: _tokenAccountOut, instructionParams: ownerTokenAccountQuoteInstruction } =
      await this.scope.account.getOrCreateTokenAccount({
        tokenProgram: TOKEN_PROGRAM_ID,
        mint: new PublicKey(tokenOut.address),
        owner: this.scope.ownerPubKey,
        createInfo: {
          payer: this.scope.ownerPubKey!,
          amount: 0,
        },
        skipCloseAccount: !outputTokenUseSolBalance,
        notUseTokenAccount: outputTokenUseSolBalance,
        associatedOnly: outputTokenUseSolBalance ? false : associatedOnly,
      });
    txBuilder.addInstruction(ownerTokenAccountQuoteInstruction || {});
    if (_tokenAccountOut === undefined)
      this.logAndCreateError("output token account not found", {
        token: tokenOut.symbol || tokenOut.address,
        tokenAccountOut: _tokenAccountOut,
        outputTokenUseSolBalance,
        associatedOnly,
      });

    const poolKeys = propPoolKeys || (await this.getAmmPoolKeys(poolInfo.id));
    let version = 4;
    if (poolInfo.pooltype.includes("StablePool")) version = 5;

    txBuilder.addInstruction({
      instructions: [
        makeAMMSwapInstruction({
          version,
          poolKeys,
          userKeys: {
            tokenAccountIn: _tokenAccountIn!,
            tokenAccountOut: _tokenAccountOut!,
            owner: this.scope.ownerPubKey,
          },
          amountIn,
          amountOut,
          fixedSide,
        }),
      ],
      instructionTypes: [version === 4 ? InstructionType.AmmV4SwapBaseIn : InstructionType.AmmV5SwapBaseIn],
    });

    txBuilder.addCustomComputeBudget(computeBudgetConfig);

    return txBuilder.versionBuild({
      txVersion,
    }) as Promise<MakeTxData<T>>;
  }

  public async getRpcPoolInfo(poolId: string): Promise<AmmRpcData> {
    return (await this.getRpcPoolInfos([poolId]))[poolId];
  }

  public async getRpcPoolInfos(
    poolIds: (string | PublicKey)[],
    config?: { batchRequest?: boolean; chunkCount?: number },
  ): Promise<{
    [poolId: string]: AmmRpcData;
  }> {
    const accounts = await getMultipleAccountsInfoWithCustomFlags(
      this.scope.connection,
      poolIds.map((i) => ({ pubkey: new PublicKey(i) })),
      config,
    );
    const poolInfos: { [poolId: string]: ReturnType<typeof liquidityStateV4Layout.decode> & { programId: PublicKey } } =
      {};

    const needFetchVaults: PublicKey[] = [];

    for (let i = 0; i < poolIds.length; i++) {
      const item = accounts[i];
      if (item === null || !item.accountInfo) throw Error("fetch pool info error: " + String(poolIds[i]));
      const rpc = liquidityStateV4Layout.decode(item.accountInfo.data);
      poolInfos[String(poolIds[i])] = {
        ...rpc,
        programId: item.accountInfo.owner,
      };

      needFetchVaults.push(rpc.baseVault, rpc.quoteVault);
    }

    const vaultInfo: { [vaultId: string]: BN } = {};
    const vaultAccountInfo = await getMultipleAccountsInfoWithCustomFlags(
      this.scope.connection,
      needFetchVaults.map((i) => ({ pubkey: new PublicKey(i) })),
      config,
    );

    for (let i = 0; i < needFetchVaults.length; i++) {
      const vaultItemInfo = vaultAccountInfo[i].accountInfo;
      if (vaultItemInfo === null) throw Error("fetch vault info error: " + needFetchVaults[i]);

      vaultInfo[String(needFetchVaults[i])] = new BN(AccountLayout.decode(vaultItemInfo.data).amount.toString());
    }

    const returnData: { [poolId: string]: AmmRpcData } = {};

    for (const [id, info] of Object.entries(poolInfos)) {
      const baseReserve = vaultInfo[info.baseVault.toString()].sub(info.baseNeedTakePnl);
      const quoteReserve = vaultInfo[info.quoteVault.toString()].sub(info.quoteNeedTakePnl);
      returnData[id] = {
        ...info,
        baseReserve,
        mintAAmount: vaultInfo[info.baseVault.toString()],
        mintBAmount: vaultInfo[info.quoteVault.toString()],
        quoteReserve,
        poolPrice: new Decimal(quoteReserve.toString())
          .div(new Decimal(10).pow(info.quoteDecimal.toString()))
          .div(new Decimal(baseReserve.toString()).div(new Decimal(10).pow(info.baseDecimal.toString()))),
      };
    }

    return returnData;
  }

  public async getPoolInfoFromRpc({ poolId }: { poolId: string }): Promise<{
    poolRpcData: AmmRpcData;
    poolInfo: ComputeAmountOutParam["poolInfo"];
    poolKeys: AmmV4Keys | AmmV5Keys;
  }> {
    const rpcData = await this.getRpcPoolInfo(poolId);
    const computeData = toAmmComputePoolInfo({ [poolId]: rpcData });
    const poolInfo = computeData[poolId];
    const allKeys = await this.scope.tradeV2.computePoolToPoolKeys({
      pools: [computeData[poolId]],
      ammRpcData: { [poolId]: rpcData },
    });
    return {
      poolRpcData: rpcData,
      poolInfo,
      poolKeys: allKeys[0] as AmmV4Keys | AmmV5Keys,
    };
  }
}
