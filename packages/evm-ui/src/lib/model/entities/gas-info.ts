import { useCallback } from 'react'
import { enforce, group, test } from 'vest'
import { ethAddress } from 'viem'
import { getLib, useWallet } from '@evm-ui/features/connect-wallet'
import { AnyCurveApi } from '@evm-ui/features/connect-wallet/lib/types'
import type { Provider } from '@evm-ui/lib/ethers'
import { type ChainQuery, queryFactory, rootKeys } from '@evm-ui/lib/model/query'
import { combineQueries, pickQuery, useCombinedQueries } from '@evm-ui/lib/queries/combine'
import { createValidationSuite, type FieldsOf } from '@evm-ui/lib/validation'
import { constQ, type Query as QueryResult } from '@evm-ui/types/util'
import { Chain, formatNumber, formatToken, gweiToEther, gweiToWai, weiToGwei } from '@evm-ui/utils'
import { type BaseConfig } from '@legacy-ui/utils'
import type { Amount, Decimal } from '@primitives/decimal.utils'
import { assert, maybe } from '@primitives/objects.utils'
import { chainValidationGroup } from '../query/chain-validation'
import { useTokenUsdRate } from './token-usd-rate'

type GasInfoQuery<T = number> = ChainQuery<T> & {
  /** Network dependent url for fetching the latest gas prices */
  gasPricesUrl: string
  /** Network dependent url for fetching the latest gas prices for L2 prices (if network is an L2) */
  gasPricesUrlL2?: string
}

type GasInfoParams<T = number> = FieldsOf<GasInfoQuery<T>>

export type GasInfo = {
  gasPrice: number | null
  max: number[]
  priority: number[]
  basePlusPriority: number[]
  basePlusPriorityL1?: number[] | undefined
  l1GasPriceWei?: number
  l2GasPriceWei?: number
}

/* List of L2 networks with different gas pricing */
const L2_NETWORKS_WITH_GAS_PRICE = [Chain.Arbitrum, Chain.XLayer, Chain.Mantle] as const

/** Small utility function to immediately convert fetch results into a JSON response. */
const httpFetcher = (uri: string) => fetch(uri).then(res => res.json())

const getAnyCurve = (chainId: number): AnyCurveApi | undefined => {
  const curveApi = getLib('curveApi')
  if (curveApi?.chainId === chainId) return curveApi
  const llamaApi = getLib('llamaApi')
  if (llamaApi?.chainId === chainId) return llamaApi
}

const getProvider = () =>
  assert(
    useWallet.getState().provider,
    'Provider not available, make sure the wallet is connected before calling this query',
  )

/**
 * We're dealing with a query here that's not read-only and has side effects.
 * Specifically, `curve.setCustomFeeData` is being called which affects the gas prices used in
 * plenty of (all?) CurveJS contract calls.
 *
 * Untangling this mess is *not* part of the current ticket at the time of writing.
 * The goal here is to simply use TanStack's caching ability to prevent unnecessary gas fetches.
 * At a later point we can remove the side effect and perhaps post it in a `useEffect` at the layout level.
 *
 * As a result, you might find `fetchGasInfoAndUpdateLib` calls sprinkled in places where
 * the data returned is not being used, simply for its side effect.
 * The exported function names have the 'andUpdateLib' suffix to indicate this behavior.
 */
const {
  useQuery: useGasInfoAndUpdateLibBase,
  fetchQuery: fetchGasInfoAndUpdateLibBase,
  setQueryData: setGasInfoAndUpdateLibBase,
} = queryFactory({
  queryKey: ({ gasPricesUrl, gasPricesUrlL2, ...params }: GasInfoParams) =>
    [...rootKeys.chain(params), { gasPricesUrl }, { gasPricesUrlL2 }, 'gasInfo'] as const,
  queryFn: async ({ chainId: chain, gasPricesUrl, gasPricesUrlL2 }: GasInfoQuery): Promise<GasInfo> => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const chainId = chain as Chain
    const curve = getAnyCurve(chainId)!
    const provider = getProvider()

    let parsedGasInfo

    if (chainId === Chain.Ethereum) {
      // Ethereum uses api
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Existing violation before enabling this rule.
      const json = await httpFetcher(gasPricesUrl)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
      const { eip1559Gas: gasInfo, gas } = json?.data ?? {}

      if (gasInfo) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- Existing violation before enabling this rule.
        parsedGasInfo = parseEthereumGasInfo(gasInfo, gas)
      }
    } else if (chainId === Chain.Polygon) {
      // Polygon uses api
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Existing violation before enabling this rule.
      const json: PolygonGasInfo = await httpFetcher(gasPricesUrl)
      if (json?.fast) {
        parsedGasInfo = parsePolygonGasInfo(json)
      }
      if (json) {
        curve.setCustomFeeData({ maxFeePerGas: json.fast.maxFee, maxPriorityFeePerGas: json.fast.maxPriorityFee })
      }
    } else if (chainId === Chain.XLayer) {
      const { l2GasPrice } = await fetchL2GasPrice(curve)
      parsedGasInfo = await parseGasInfo(curve, provider, gasPricesUrlL2)

      if (parsedGasInfo) {
        parsedGasInfo.gasInfo.l2GasPriceWei = gweiToWai(l2GasPrice)
      }

      if (l2GasPrice) {
        const maxFeePerGas = null as unknown as undefined // todo: fix `undefined` type in curvejs, it actually checks `=== null`
        curve.setCustomFeeData({ gasPrice: l2GasPrice /*in gwei*/, maxFeePerGas, maxPriorityFeePerGas: maxFeePerGas })
      }
    } else if (chainId === Chain.Arbitrum || chainId === Chain.Mantle) {
      const { customFeeData } = await fetchCustomGasFees(curve)
      parsedGasInfo = await parseGasInfo(curve, provider, gasPricesUrlL2)

      if (parsedGasInfo && customFeeData?.maxFeePerGas && customFeeData?.maxPriorityFeePerGas) {
        parsedGasInfo.gasInfo.max = [gweiToWai(customFeeData.maxFeePerGas)]
        parsedGasInfo.gasInfo.priority = [gweiToWai(customFeeData.maxPriorityFeePerGas)]
        curve.setCustomFeeData(customFeeData)
      }
    } else if (chainId === Chain.Fraxtal || chainId === Chain.Base) {
      // TODO: remove this hardcode value once it api is fixed
      parsedGasInfo = await parseGasInfo(curve, provider, gasPricesUrlL2)

      if (parsedGasInfo) {
        curve.setCustomFeeData({
          maxFeePerGas: 0.1,
          maxPriorityFeePerGas: 0.001,
        })
      }
    } else if (chainId === Chain.Optimism) {
      // TODO: remove this hardcode value once it api is fixed
      parsedGasInfo = await parseGasInfo(curve, provider, gasPricesUrlL2)

      if (parsedGasInfo) {
        curve.setCustomFeeData({
          maxFeePerGas: 0.2,
          maxPriorityFeePerGas: 0.001,
        })
      }
    }

    return (parsedGasInfo ?? (await parseGasInfo(curve, provider, gasPricesUrlL2))).gasInfo
  },
  category: 'global.gasInfo',
  validationSuite: createValidationSuite(<TChainId extends number>({ chainId }: GasInfoParams<TChainId>) => {
    chainValidationGroup({ chainId })
    group('libValidation', () => {
      test('lib', 'library loaded', () => {
        if (chainId) enforce(getAnyCurve(chainId)?.chainId).message('Library should be loaded').equals(chainId)
      })
    })
  }),
})

async function fetchCustomGasFees(curve: AnyCurveApi) {
  const resp: { customFeeData: Record<string, number | null> | null; error: string } = {
    customFeeData: null,
    error: '',
  }
  try {
    resp.customFeeData = await curve.getGasInfoForL2()
    return resp
  } catch (error) {
    console.error(error)
    resp.error = 'error-get-gas'
    return resp
  }
}

async function fetchL2GasPrice(curve: AnyCurveApi) {
  const resp = { l2GasPrice: 0, error: '' }
  try {
    resp.l2GasPrice = await curve.getGasPriceFromL2()
    return resp
  } catch (error) {
    console.error(error)
    resp.error = 'error-get-gas'
    return resp
  }
}

async function fetchL1AndL2GasPrice(curve: AnyCurveApi) {
  const resp = { l1GasPriceWei: 0, l2GasPriceWei: 0, error: '' }
  try {
    const [l2GasPriceWei, l1GasPriceWei] = await Promise.all([curve.getGasPriceFromL2(), curve.getGasPriceFromL1()])
    resp.l2GasPriceWei = l2GasPriceWei
    resp.l1GasPriceWei = l1GasPriceWei
    return resp
  } catch (error) {
    console.error(error)
    resp.error = 'error-get-gas'
    return resp
  }
}

function parseEthereumGasInfo(gasInfo: { base: number; prio: number[]; max: number[] }, gas: { rapid: number }) {
  if (gasInfo.base && gasInfo.prio && gasInfo.max) {
    const base = Math.trunc(gasInfo.base)
    const priority = gasInfo.prio.map(Math.trunc)
    const max = gasInfo.max.map(Math.trunc)

    return {
      gasInfo: {
        gasPrice: gas?.rapid || null,
        base,
        priority,
        max,
        basePlusPriority: priority.map((p: number) => base + p),
      },
      label: ['fastest', 'fast', 'medium', 'slow'],
    }
  }
}

type PolygonGasInfo = {
  estimatedBaseFee: number
  safeLow: { maxFee: number; maxPriorityFee: number }
  standard: { maxFee: number; maxPriorityFee: number }
  fast: { maxFee: number; maxPriorityFee: number }
}

function parsePolygonGasInfo(gasInfo: PolygonGasInfo) {
  const { estimatedBaseFee, safeLow, standard, fast } = gasInfo

  if (estimatedBaseFee && safeLow && standard && fast) {
    const base = gweiToWai(estimatedBaseFee)
    const max = [fast.maxFee, standard.maxFee, safeLow.maxFee].map(gweiToWai)
    const priority = [fast.maxPriorityFee, standard.maxPriorityFee, safeLow.maxPriorityFee].map(gweiToWai)

    return {
      gasInfo: {
        gasPrice: null,
        base,
        max,
        priority,
        basePlusPriority: priority.map(p => base + p),
      },
      label: ['fast', 'medium', 'slow'],
    }
  }
}

async function parseGasInfo(curve: AnyCurveApi, provider: Provider, l2GasUrl?: string) {
  // Returns the current recommended FeeData to use in a transaction.
  // For an EIP-1559 transaction, the maxFeePerGas and maxPriorityFeePerGas should be used.
  // For legacy transactions and networks which do not support EIP-1559, the gasPrice should be used.
  const gasFeeData = await provider.getFeeData()
  const { gasPrice, maxFeePerGas, maxPriorityFeePerGas } = gasFeeData

  const gasFeeDataWei = {
    gasPrice: gasPrice ? +BigInt(gasPrice).toString() : null,
    max: maxFeePerGas ? [+BigInt(maxFeePerGas).toString()] : [],
    priority: maxPriorityFeePerGas ? [+BigInt(maxPriorityFeePerGas).toString()] : [],
  }

  const baseInfo: Pick<GasInfo, 'basePlusPriority' | 'basePlusPriorityL1' | 'l1GasPriceWei' | 'l2GasPriceWei'> = {
    basePlusPriority: [] as number[],
  }

  if (l2GasUrl) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Existing violation before enabling this rule.
    const fetchedData = await httpFetcher(l2GasUrl)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
    const { eip1559Gas: gasInfo } = fetchedData?.data ?? {}

    baseInfo.basePlusPriority = gasFeeDataWei.gasPrice ? [gasFeeDataWei.gasPrice] : []
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
    baseInfo.basePlusPriorityL1 = [gasInfo.base * 6000]

    const { l2GasPriceWei, l1GasPriceWei } = await fetchL1AndL2GasPrice(curve)
    baseInfo.l1GasPriceWei = l1GasPriceWei
    baseInfo.l2GasPriceWei = l2GasPriceWei
  } else if (gasFeeDataWei.gasPrice) {
    baseInfo.basePlusPriority = [+gasFeeDataWei.gasPrice]
  }

  return {
    gasInfo: {
      ...gasFeeDataWei,
      ...baseInfo,
    },
    label: ['fast'],
  }
}

type Network = { gasPricesUrl: string; gasL2: boolean }

export type GasInfoQueryOptions<TChainId extends number = number> = {
  chainId?: TChainId | null
  networks: Record<TChainId, Network>
}

/** Helper function to create required query options based on network configs. */
function createGasInfoQueryOptions<TChainId extends number>({
  chainId,
  networks,
}: GasInfoQueryOptions<TChainId>): GasInfoParams<TChainId> {
  const network = chainId && networks[chainId]
  return {
    chainId,
    gasPricesUrl: network?.gasPricesUrl,
    // It seems that in the original code the Ethereum mainnet gas prices URL was used for L2 price fetching.
    // I do not question whether this is right or not. I just re-use what was already being used.
    gasPricesUrlL2: network?.gasL2 ? networks?.[1 as TChainId]?.gasPricesUrl : undefined,
  }
}

/**
 * Fetches gas info and updates the library. This wrapper exists as the base query requires query options
 * derived from network config objects. Having to import and use `createGasInfoQueryOptions` is cumbersome.
 */
export const fetchGasInfoAndUpdateLib = <TChainId extends number>({
  chainId,
  networks,
}: GasInfoQueryOptions<TChainId>) => fetchGasInfoAndUpdateLibBase(createGasInfoQueryOptions({ chainId, networks }))

/**
 * Fetches gas info and updates the library. This wrapper exists as the base query requires query options
 * derived from network config objects. Having to import and use `createGasInfoQueryOptions` is cumbersome.
 */
export const useGasInfoAndUpdateLib = <TChainId extends number>(
  { chainId, networks }: GasInfoQueryOptions<TChainId>,
  enabled?: boolean,
) => {
  const { provider } = useWallet() // validate provider manually because otherwise query won't get enabled when connected
  return useGasInfoAndUpdateLibBase(createGasInfoQueryOptions({ chainId, networks }), !!provider && enabled)
}

/** Sets gas info query data directly in the query cache. */
export const setGasInfoAndUpdateLib = <TChainId extends number>(
  { chainId, networks }: GasInfoQueryOptions<TChainId>,
  gasInfo: GasInfo,
) => setGasInfoAndUpdateLibBase(createGasInfoQueryOptions({ chainId, networks }), gasInfo)

// calculates L1+L2 gas for optimistic rollups
const calculateOptimisticRollupGas = (
  [l2Gas, l1Gas]: number[] | [Decimal, Decimal],
  [l2GasPriceWei, l1GasPriceWei]: [number, number],
) => +l2Gas * l2GasPriceWei + +l1Gas * l1GasPriceWei

/**
 * Calculate estimated gas costs with ETH+USD conversion and tooltip
 */
export function calculateGas(
  estimatedGas: Amount | [Decimal, Decimal] | number[] | null | undefined,
  gasInfo: GasInfo | undefined,
  chainTokenUsdRate: number | undefined,
  {
    chainId,
    symbol: networkSymbol,
    gasPricesUnit,
    gasL2: isL2Network,
    gasPricesDefault = 0,
  }: {
    chainId: number
    symbol: string
    gasPricesUnit: string
    gasL2: boolean
    gasPricesDefault: number | undefined
  },
): {
  estGasCost?: number
  estGasCostUsd?: number
  tooltip?: string
  gasCostInWei?: number
} {
  const basePlusPriority = gasInfo?.basePlusPriority?.[gasPricesDefault]
  if (!estimatedGas || !basePlusPriority) {
    return {}
  }

  const { l1GasPriceWei, l2GasPriceWei } = gasInfo
  const gasCostInWei =
    L2_NETWORKS_WITH_GAS_PRICE.includes(chainId) && l2GasPriceWei && !Array.isArray(estimatedGas)
      ? l2GasPriceWei * +estimatedGas
      : isL2Network && Array.isArray(estimatedGas) && l2GasPriceWei && l1GasPriceWei
        ? calculateOptimisticRollupGas(estimatedGas, [l2GasPriceWei, l1GasPriceWei])
        : Array.isArray(estimatedGas)
          ? 0
          : basePlusPriority * +estimatedGas // Default calculation for regular networks

  const estGasCost = gweiToEther(weiToGwei(gasCostInWei))
  const tooltip =
    `${formatToken(estGasCost, networkSymbol, 'amount')} at ` +
    `${formatNumber(weiToGwei(basePlusPriority), { maximumFractionDigits: 2, abbreviate: false })} ${gasPricesUnit}`
  return { estGasCost, tooltip, ...(chainTokenUsdRate != null && { estGasCostUsd: estGasCost * chainTokenUsdRate }) }
}

type GasEstimate = Amount | [Decimal, Decimal] | number[] | null | undefined

/** Converts an existing gas estimate query into native/USD gas cost info. */
const useEstimateGas = (
  networks: Record<number, BaseConfig>,
  chainId: number | null | undefined,
  estimate: QueryResult<GasEstimate>,
  enabled?: boolean,
) => {
  const ethRate = useTokenUsdRate({ chainId, tokenAddress: ethAddress }, enabled)
  const gasInfo = useGasInfoAndUpdateLib({ chainId, networks }, enabled)
  return useCombinedQueries(
    [estimate, gasInfo, ethRate],
    useCallback(
      (estimate, gasInfo, ethRate) =>
        maybe(chainId, chainId => calculateGas(estimate, gasInfo, ethRate, networks[chainId])),
      [chainId, networks],
    ),
  )
}

/**
 * Converts a raw gas estimate value into native/USD gas cost info.
 * @deprecated Prefer `useEstimateGas` for query results, or `createEstimateGasHook` for reusable estimate hooks.
 */
export const useEstimateGasValue = (
  networks: Record<number, BaseConfig>,
  chainId: number | null | undefined,
  estimate: GasEstimate,
  enabled?: boolean,
) => useEstimateGas(networks, chainId, constQ(estimate), enabled)

type NetworkDict = Record<number, BaseConfig>

type EstimateValue = number | number[] | null | undefined

type WithOptionalChainId = {
  chainId?: number | null | undefined
}

/** Builds a reusable gas-cost hook from a single estimate-gas query hook. */
export const createEstimateGasHook =
  <Query extends WithOptionalChainId, Estimate extends EstimateValue>(
    useEstimate: (query: Query, enabled?: boolean) => QueryResult<Estimate>,
  ) =>
  (networks: NetworkDict, query: Query & { chainId?: number | null | undefined }, enabled = true) => {
    const estimate = useEstimate(query, enabled)
    const converted = useEstimateGas(networks, query.chainId, estimate, enabled && estimate.data != null)
    return combineQueries([converted, estimate], data => data)
  }

/** Builds a reusable gas-cost hook for actions that may need approval first. */
export const createApprovedEstimateGasHook =
  <Query extends WithOptionalChainId, Estimate extends EstimateValue>({
    useIsApproved,
    useApproveEstimate,
    useActionEstimate,
  }: {
    useIsApproved: (query: Query, enabled?: boolean) => QueryResult<boolean>
    useApproveEstimate: (query: Query, enabled?: boolean) => QueryResult<Estimate>
    useActionEstimate: (query: Query, enabled?: boolean) => QueryResult<Estimate>
  }) =>
  (networks: NetworkDict, query: Query & { chainId?: number | null | undefined }, enabled = true) => {
    const isApproved = useIsApproved(query, enabled)
    const approveEstimate = useApproveEstimate(query, enabled && isApproved.data === false)
    const actionEstimate = useActionEstimate(query, enabled && isApproved.data === true)
    const estimate = pickQuery([actionEstimate, approveEstimate], ([action, approve]) =>
      isApproved.data ? action : approve,
    )
    const gas = useEstimateGas(networks, query.chainId, estimate, enabled)
    return combineQueries([isApproved, gas], (_, gas) => gas)
  }
