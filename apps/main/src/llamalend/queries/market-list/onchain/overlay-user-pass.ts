import { formatUnits, type ContractFunctionParameters } from 'viem'
import { type LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { LlamaMarketType } from '@ui-kit/types/market'
import { type Address as UiAddress } from '@ui-kit/utils'
import { lendControllerAbi, mintControllerAbi } from './overlay-abi'
import { createOnchainMarketKey } from './overlay-market-pass'

type UserBatchMeta = { kind: 'userState'; key: string } | { kind: 'health'; key: string }

type ChainMulticallBatch = {
  contracts: ContractFunctionParameters[]
  meta: UserBatchMeta[]
}

type OverlayUserStats = {
  health?: number
  debt?: number
  collateral?: number
  borrowed?: number
  softLiquidation?: boolean
}

type RawBorrowUserState = { state?: readonly bigint[]; health?: bigint }

export type ParsedChainUserBatch = {
  userStatsByKey: Record<string, OverlayUserStats>
  errorsByKey: Record<string, string>
}

const getSuccessResult = <T>(value: unknown): T | undefined => {
  const item = value as { status: 'success'; result: unknown } | { status: 'failure'; error: Error }
  return item?.status === 'success' ? (item.result as T) : undefined
}

const getFailureError = (value: unknown): Error | undefined => {
  const item = value as { status: 'success'; result: unknown } | { status: 'failure'; error: Error }
  return item?.status === 'failure' ? item.error : undefined
}

const toFloat = (value: bigint, decimals: number) => Number(formatUnits(value, decimals))
const sanitizeNumber = (value: number | null | undefined) =>
  value != null && Number.isFinite(value) ? value : undefined

export const buildChainUserBatch = ({
  chainMarkets,
  userAddress,
}: {
  chainMarkets: LlamaMarket[]
  userAddress: UiAddress
}): ChainMulticallBatch => {
  const contracts: ContractFunctionParameters[] = []
  const meta: UserBatchMeta[] = []

  chainMarkets.forEach((market) => {
    if (!market.userHasPositions?.Borrow) return

    const key = createOnchainMarketKey(market.chain, market.controllerAddress)
    const controllerAbi = market.type === LlamaMarketType.Lend ? lendControllerAbi : mintControllerAbi

    contracts.push({
      address: market.controllerAddress,
      abi: controllerAbi,
      functionName: 'user_state',
      args: [userAddress],
    })
    meta.push({ kind: 'userState', key })

    contracts.push({
      address: market.controllerAddress,
      abi: controllerAbi,
      functionName: 'health',
      args: [userAddress, true],
    })
    meta.push({ kind: 'health', key })
  })

  return { contracts, meta }
}

export const parseChainUserBatch = ({
  chainMarkets,
  meta,
  results,
  tokenDecimalsByAddress,
}: {
  chainMarkets: LlamaMarket[]
  meta: UserBatchMeta[]
  results: readonly unknown[]
  tokenDecimalsByAddress: Record<string, number>
}): ParsedChainUserBatch => {
  const userStatsByKey: Record<string, OverlayUserStats> = {}
  const errorsByKey: Record<string, string> = {}
  const rawBorrowByKey: Record<string, RawBorrowUserState> = {}

  results.forEach((result, index) => {
    const callMeta = meta[index]
    if (!callMeta) return

    if (callMeta.kind === 'health') {
      const health = getSuccessResult<bigint>(result)
      if (health != null) {
        rawBorrowByKey[callMeta.key] = { ...(rawBorrowByKey[callMeta.key] ?? {}), health }
      } else {
        const error = getFailureError(result)
        if (error) errorsByKey[callMeta.key] = error.message
      }
      return
    }

    const state = getSuccessResult<readonly bigint[]>(result)
    if (state) {
      rawBorrowByKey[callMeta.key] = { ...(rawBorrowByKey[callMeta.key] ?? {}), state }
    } else {
      const error = getFailureError(result)
      if (error) errorsByKey[callMeta.key] = error.message
    }
  })

  chainMarkets.forEach((market) => {
    if (!market.userHasPositions?.Borrow) return

    const key = createOnchainMarketKey(market.chain, market.controllerAddress)
    const raw = rawBorrowByKey[key]
    if (!raw?.state || raw.health == null) return

    const collateralRaw = raw.state[0]
    const borrowedRaw = raw.state[1]
    const debtRaw = raw.state[2]
    if (collateralRaw == null || borrowedRaw == null || debtRaw == null) return

    const collateralDecimals = tokenDecimalsByAddress[market.assets.collateral.address.toLowerCase()] ?? 18
    const borrowedDecimals = tokenDecimalsByAddress[market.assets.borrowed.address.toLowerCase()] ?? 18

    const collateral = toFloat(collateralRaw, collateralDecimals)
    const borrowed = toFloat(borrowedRaw, borrowedDecimals)
    const debt = toFloat(debtRaw, borrowedDecimals)
    const health = Number(formatUnits(raw.health * 100n, 18))

    userStatsByKey[key] = {
      collateral: sanitizeNumber(collateral),
      borrowed: sanitizeNumber(borrowed),
      debt: sanitizeNumber(debt),
      health: sanitizeNumber(health),
      softLiquidation: borrowed > 0,
    }
  })

  return { userStatsByKey, errorsByKey }
}
