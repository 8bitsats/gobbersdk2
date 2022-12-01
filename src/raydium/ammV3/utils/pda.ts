import { PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { findProgramAddress, METADATA_PROGRAM_ID } from "../../../common";

import { i32ToBytes, u16ToBytes } from "./util";

export const AMM_CONFIG_SEED = Buffer.from("amm_config", "utf8");
export const POOL_SEED = Buffer.from("pool", "utf8");
export const POOL_VAULT_SEED = Buffer.from("pool_vault", "utf8");
export const POOL_REWARD_VAULT_SEED = Buffer.from("pool_reward_vault", "utf8");
export const POSITION_SEED = Buffer.from("position", "utf8");
export const TICK_ARRAY_SEED = Buffer.from("tick_array", "utf8");
export const OPERATION_SEED = Buffer.from("operation", "utf8");

type ReturnType = { publicKey: PublicKey; nonce: number };

export function getPdaAmmConfigId(programId: PublicKey, index: number): ReturnType {
  return findProgramAddress([AMM_CONFIG_SEED, u16ToBytes(index)], programId);
}

export function getPdaPoolId(
  programId: PublicKey,
  ammConfigId: PublicKey,
  mintA: PublicKey,
  mintB: PublicKey,
): ReturnType {
  return findProgramAddress([POOL_SEED, ammConfigId.toBuffer(), mintA.toBuffer(), mintB.toBuffer()], programId);
}

export function getPdaPoolVaultId(programId: PublicKey, poolId: PublicKey, vaultMint: PublicKey): ReturnType {
  return findProgramAddress([POOL_VAULT_SEED, poolId.toBuffer(), vaultMint.toBuffer()], programId);
}

export function getPdaPoolRewardVaultId(programId: PublicKey, poolId: PublicKey, rewardMint: PublicKey): ReturnType {
  return findProgramAddress([POOL_REWARD_VAULT_SEED, poolId.toBuffer(), rewardMint.toBuffer()], programId);
}

export function getPdaTickArrayAddress(programId: PublicKey, poolId: PublicKey, startIndex: number): ReturnType {
  return findProgramAddress([TICK_ARRAY_SEED, poolId.toBuffer(), i32ToBytes(startIndex)], programId);
}

export function getPdaProtocolPositionAddress(
  programId: PublicKey,
  poolId: PublicKey,
  tickLower: number,
  tickUpper: number,
): ReturnType {
  return findProgramAddress(
    [POSITION_SEED, poolId.toBuffer(), i32ToBytes(tickLower), i32ToBytes(tickUpper)],
    programId,
  );
}

export function getPdaPersonalPositionAddress(programId: PublicKey, nftMint: PublicKey): ReturnType {
  return findProgramAddress([POSITION_SEED, nftMint.toBuffer()], programId);
}

export function getATAAddress(owner: PublicKey, mint: PublicKey): ReturnType {
  return findProgramAddress(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"),
  );
}

export function getPdaMetadataKey(mint: PublicKey): ReturnType {
  return findProgramAddress(
    [Buffer.from("metadata", "utf8"), METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    METADATA_PROGRAM_ID,
  );
}

export function getPdaOperationAccount(programId: PublicKey): ReturnType {
  return findProgramAddress([OPERATION_SEED], programId);
}