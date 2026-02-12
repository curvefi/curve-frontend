import { formatUnits, type Address, type ContractFunctionParameters, zeroAddress } from 'viem'
import { type LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { LlamaMarketType } from '@ui-kit/types/market'
import { type Address as UiAddress } from '@ui-kit/utils'
import { gaugeAbi, lendControllerAbi, mintControllerAbi, vaultAbi } from './overlay-abi'
import { createOnchainMarketKey } from './overlay-market-pass'

type UserBatchMeta =
  | { kind: 'userStateLend'; key: string }
  | { kind: 'userStateMint'; key: string }
  | { kind: 'health'; key: string }
  | { kind: 'vaultShares'; key: string }
  | { kind: 'vaultAssets'; key: string }
  | { kind: 'gaugeShares'; key: string }
  | { kind: 'workingBalance'; key: string }

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
  totalCurrentAssets?: number
  boostMultiplier?: number
}

type RawBorrowUserState = { state?: readonly bigint[]; health?: bigint }
type SupplyField = 'vaultShares' | 'vaultAssets' | 'gaugeShares' | 'workingBalance'

type SupplyAccumulator = {
  vaultShares?: bigint
  vaultAssets?: bigint
  gaugeShares?: bigint
  workingBalance?: bigint
  hasGaugeCalls?: true
  failed: Partial<Record<SupplyField, true>>
}

type ConvertFallbackRequest = {
  key: string
  vaultAddress: Address
  borrowedTokenAddress: Address
  totalShares: bigint
}

export type ParsedChainUserBatch = {
  userStatsByKey: Record<string, OverlayUserStats>
  errorsByKey: Record<string, string>
  convertFallbackRequests: ConvertFallbackRequest[]
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

const mergeStat = (statsByKey: Record<string, OverlayUserStats>, key: string, patch: Partial<OverlayUserStats>) => {
  statsByKey[key] = { ...(statsByKey[key] ?? {}), ...patch }
}

const getSupplyField = (kind: UserBatchMeta['kind']): SupplyField | undefined => {
  if (kind === 'vaultShares') return 'vaultShares'
  if (kind === 'vaultAssets') return 'vaultAssets'
  if (kind === 'gaugeShares') return 'gaugeShares'
  if (kind === 'workingBalance') return 'workingBalance'
  return undefined
}

const ensureSupplyAccumulator = (map: Record<string, SupplyAccumulator>, key: string) => {
  map[key] = map[key] ?? { failed: {} }
  return map[key]
}

export const buildChainUserBatch = ({
  chainMarkets,
  userAddress,
  gaugesByMarketKey,
}: {
  chainMarkets: LlamaMarket[]
  userAddress: UiAddress
  gaugesByMarketKey: Record<string, Address>
}): ChainMulticallBatch => {
  const contracts: ContractFunctionParameters[] = []
  const meta: UserBatchMeta[] = []

  chainMarkets.forEach((market) => {
    const key = createOnchainMarketKey(market.chain, market.controllerAddress)

    if (market.userHasPositions?.Borrow) {
      contracts.push({
        address: market.controllerAddress,
        abi: market.type === LlamaMarketType.Lend ? lendControllerAbi : mintControllerAbi,
        functionName: 'user_state',
        args: [userAddress],
      })
      meta.push({ kind: market.type === LlamaMarketType.Lend ? 'userStateLend' : 'userStateMint', key })

      contracts.push({
        address: market.controllerAddress,
        abi: market.type === LlamaMarketType.Lend ? lendControllerAbi : mintControllerAbi,
        functionName: 'health',
        args: [userAddress, true],
      })
      meta.push({ kind: 'health', key })
    }

    if (!market.userHasPositions?.Supply || !market.vaultAddress) return

    contracts.push({
      address: market.vaultAddress as Address,
      abi: vaultAbi,
      functionName: 'balanceOf',
      args: [userAddress],
    })
    meta.push({ kind: 'vaultShares', key })

    contracts.push({
      address: market.vaultAddress as Address,
      abi: vaultAbi,
      functionName: 'totalAssets',
      args: [userAddress],
    })
    meta.push({ kind: 'vaultAssets', key })

    const gaugeAddress = gaugesByMarketKey[key]
    if (!gaugeAddress || gaugeAddress === zeroAddress) return

    contracts.push({ address: gaugeAddress, abi: gaugeAbi, functionName: 'balanceOf', args: [userAddress] })
    meta.push({ kind: 'gaugeShares', key })

    contracts.push({ address: gaugeAddress, abi: gaugeAbi, functionName: 'working_balances', args: [userAddress] })
    meta.push({ kind: 'workingBalance', key })
  })

  return { contracts, meta }
}

export const parseChainUserBatch = ({
  chainMarkets,
  meta,
  results,
  tokenDecimalsByAddress,
  gaugeLookupFailedByKey,
}: {
  chainMarkets: LlamaMarket[]
  meta: UserBatchMeta[]
  results: readonly unknown[]
  tokenDecimalsByAddress: Record<string, number>
  gaugeLookupFailedByKey: Record<string, true>
}): ParsedChainUserBatch => {
  const userStatsByKey: Record<string, OverlayUserStats> = {}
  const errorsByKey: Record<string, string> = {}
  const rawBorrowByKey: Record<string, RawBorrowUserState> = {}
  const rawSupplyByKey: Record<string, SupplyAccumulator> = {}
  const convertFallbackRequests: ConvertFallbackRequest[] = []

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

    if (callMeta.kind === 'userStateLend' || callMeta.kind === 'userStateMint') {
      const state = getSuccessResult<readonly bigint[]>(result)
      if (state) {
        rawBorrowByKey[callMeta.key] = { ...(rawBorrowByKey[callMeta.key] ?? {}), state }
      } else {
        const error = getFailureError(result)
        if (error) errorsByKey[callMeta.key] = error.message
      }
      return
    }

    const field = getSupplyField(callMeta.kind)
    if (!field) return

    const current = ensureSupplyAccumulator(rawSupplyByKey, callMeta.key)
    if (field === 'gaugeShares' || field === 'workingBalance') current.hasGaugeCalls = true

    const value = getSuccessResult<bigint>(result)
    if (value == null) {
      current.failed[field] = true
      const error = getFailureError(result)
      if (error) errorsByKey[callMeta.key] = error.message
      return
    }

    current[field] = value
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

    mergeStat(userStatsByKey, key, {
      collateral: sanitizeNumber(collateral),
      borrowed: sanitizeNumber(borrowed),
      debt: sanitizeNumber(debt),
      health: sanitizeNumber(health),
      softLiquidation: borrowed > 0,
    })
  })

  chainMarkets.forEach((market) => {
    if (!market.userHasPositions?.Supply || !market.vaultAddress) return

    const key = createOnchainMarketKey(market.chain, market.controllerAddress)
    const supply = rawSupplyByKey[key] ?? { failed: {} }
    const borrowedDecimals = tokenDecimalsByAddress[market.assets.borrowed.address.toLowerCase()] ?? 18

    if (supply.hasGaugeCalls) {
      const gaugeFailed = !!(supply.failed.gaugeShares || supply.failed.workingBalance)
      const hasGaugeData = supply.gaugeShares != null && supply.workingBalance != null
      if (!gaugeFailed && hasGaugeData) {
        const gaugeShares = Number(supply.gaugeShares)
        const workingBalance = Number(supply.workingBalance)
        const boostMultiplier =
          gaugeShares > 0 ? sanitizeNumber(Math.max(1, Math.min(2.5, workingBalance / 0.4 / gaugeShares))) : 1
        if (boostMultiplier != null) mergeStat(userStatsByKey, key, { boostMultiplier })
      }
    } else if (!gaugeLookupFailedByKey[key]) {
      mergeStat(userStatsByKey, key, { boostMultiplier: 1 })
    }

    if (supply.hasGaugeCalls) {
      if (supply.failed.vaultShares || supply.failed.gaugeShares) return
      if (supply.vaultShares == null || supply.gaugeShares == null) return

      if (supply.gaugeShares === 0n) {
        if (!supply.failed.vaultAssets && supply.vaultAssets != null) {
          mergeStat(userStatsByKey, key, {
            totalCurrentAssets: sanitizeNumber(toFloat(supply.vaultAssets, borrowedDecimals)),
          })
        }
        return
      }

      const totalShares = supply.vaultShares + supply.gaugeShares
      if (totalShares > 0n) {
        convertFallbackRequests.push({
          key,
          vaultAddress: market.vaultAddress as Address,
          borrowedTokenAddress: market.assets.borrowed.address,
          totalShares,
        })
        return
      }

      if (!supply.failed.vaultAssets && supply.vaultAssets != null) {
        mergeStat(userStatsByKey, key, {
          totalCurrentAssets: sanitizeNumber(toFloat(supply.vaultAssets, borrowedDecimals)),
        })
      }
      return
    }

    if (!supply.failed.vaultAssets && supply.vaultAssets != null) {
      mergeStat(userStatsByKey, key, {
        totalCurrentAssets: sanitizeNumber(toFloat(supply.vaultAssets, borrowedDecimals)),
      })
    }
  })

  return { userStatsByKey, errorsByKey, convertFallbackRequests }
}

export const resolveConvertFallback = async ({
  chainId,
  requests,
  userStatsByKey,
  errorsByKey,
  tokenDecimalsByAddress,
  runMulticall,
}: {
  chainId: number
  requests: ConvertFallbackRequest[]
  userStatsByKey: Record<string, OverlayUserStats>
  errorsByKey: Record<string, string>
  tokenDecimalsByAddress: Record<string, number>
  runMulticall: (chainId: number, contracts: ContractFunctionParameters[]) => Promise<readonly unknown[]>
}) => {
  if (requests.length === 0) return

  const contracts: ContractFunctionParameters[] = requests.map((request) => ({
    address: request.vaultAddress,
    abi: vaultAbi,
    functionName: 'convertToAssets',
    args: [request.totalShares],
  }))

  const convertResults = await runMulticall(chainId, contracts)

  convertResults.forEach((result, index) => {
    const request = requests[index]
    if (!request) return

    const assetsRaw = getSuccessResult<bigint>(result)
    if (assetsRaw == null) {
      const error = getFailureError(result)
      if (error) errorsByKey[request.key] = error.message
      return
    }

    const borrowedDecimals = tokenDecimalsByAddress[request.borrowedTokenAddress.toLowerCase()] ?? 18
    mergeStat(userStatsByKey, request.key, {
      totalCurrentAssets: sanitizeNumber(toFloat(assetsRaw, borrowedDecimals)),
    })
  })
}
