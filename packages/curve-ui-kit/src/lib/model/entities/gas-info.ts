import { getEthereumCustomFeeDataValues } from '@ui/utils'
import { getLib, requireLib, useWallet } from '@ui-kit/features/connect-wallet'
import { queryFactory, rootKeys, type ChainParams, type ChainQuery } from '@ui-kit/lib/model/query'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib/validation'
import { Chain, gweiToWai } from '@ui-kit/utils'
import { chainValidationGroup } from '../query/chain-validation'
import { providerValidationGroup } from '../query/provider-validation'

export type GasInfoQuery<T = number> = ChainQuery<T> & {
  /** Network dependent url for fetching the latest gas prices */
  gasPricesUrl: string
  /** Network dependent url for fetching the latest gas prices for L2 prices (if network is an L2) */
  gasPricesUrlL2?: string
}

export type GasInfoParams<T = number> = FieldsOf<GasInfoQuery<T>>

type GasInfo = {
  gasPrice: number | null
  max: number[]
  priority: number[]
  basePlusPriority: number[]
  basePlusPriorityL1?: number[] | undefined
  l1GasPriceWei?: number
  l2GasPriceWei?: number
}

const QUERY_KEY_IDENTIFIER = 'gasInfo' as const

/** Small utility function to immediately convert fetch results into a JSON response. */
const httpFetcher = (uri: string) => fetch(uri).then((res) => res.json())

const getCurve = () => getLib('curveApi') ?? requireLib('llamaApi')
type CurveApi = ReturnType<typeof getCurve>

const getProvider = () => useWallet.getState().provider!
type Provider = ReturnType<typeof getProvider>

const createQueryKey = ({ gasPricesUrl, gasPricesUrlL2, ...params }: GasInfoParams) =>
  [...rootKeys.chain(params), { gasPricesUrl }, { gasPricesUrlL2 }, QUERY_KEY_IDENTIFIER] as const

/**
 * We're dealing with a query here that's not read-only and has side-effects.
 * Specifically, `curve.setCustomFeeData` is being called which has an affect
 * on the gas prices used in plenty of (all?) CurveJS contract call.
 *
 * Untangling this mess is *not* part of the current ticket at the time of writing.
 * The goal here is to simply use TanStack's caching ability to prevent unnecessary gas fetches.
 * At a later point we can remove the side-effect and perhaps post it in a `useEffect` at the layout level.
 *
 * As a result, you might find `fetchGasInfoAndUpdateLib` calls sprinkled in places where
 * the data returned is not being used, simply for its side-effect.
 * The exported function names have the 'andUpdateLib' suffix to indicate this behavior.
 */
const { useQuery: useGasInfoAndUpdateLibBase, fetchQuery: fetchGasInfoAndUpdateLibBase } = queryFactory({
  queryKey: createQueryKey,
  queryFn: async ({ chainId, gasPricesUrl, gasPricesUrlL2 }: GasInfoQuery): Promise<GasInfo> => {
    const curve = getCurve()
    const provider = getProvider()

    let parsedGasInfo

    if (chainId === Chain.Ethereum) {
      // Ethereum uses api
      const json = await httpFetcher(gasPricesUrl)
      const { eip1559Gas: gasInfo, gas } = json?.data ?? {}

      if (gasInfo) {
        parsedGasInfo = parseEthereumGasInfo(gasInfo, gas)
        const customFeeDataValues = getEthereumCustomFeeDataValues(gasInfo)
        if (customFeeDataValues) {
          curve.setCustomFeeData(customFeeDataValues)
        }
      }
    } else if (chainId === Chain.Polygon) {
      // Polygon uses api
      const json = await httpFetcher(gasPricesUrl)

      if (json?.fast) {
        parsedGasInfo = parsePolygonGasInfo(json)
      }

      if (json) {
        curve.setCustomFeeData({
          maxFeePerGas: json.fast.maxFee,
          maxPriorityFeePerGas: json.fast.maxPriorityFee,
        })
      }
    } else if (chainId === Chain.XLayer) {
      const { l2GasPrice } = await fetchL2GasPrice(curve)
      parsedGasInfo = await parseGasInfo(curve, provider, gasPricesUrlL2)

      if (parsedGasInfo) {
        parsedGasInfo.gasInfo.l2GasPriceWei = gweiToWai(l2GasPrice)
      }

      if (l2GasPrice) {
        curve.setCustomFeeData({
          gasPrice: l2GasPrice, // in gwei
          // @ts-ignore
          maxFeePerGas: null,
          // @ts-ignore
          maxPriorityFeePerGas: null,
        })
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

    return (parsedGasInfo ? Promise.resolve(parsedGasInfo) : parseGasInfo(curve, provider, gasPricesUrlL2)).then(
      (x) => x.gasInfo,
    )
  },
  staleTime: '5m',
  refetchInterval: '1m',
  validationSuite: createValidationSuite(<TChainId extends number>(params: ChainParams<TChainId>) => {
    chainValidationGroup(params)
    providerValidationGroup()
  }),
})

async function fetchCustomGasFees(curve: CurveApi) {
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

async function fetchL2GasPrice(curve: CurveApi) {
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

async function fetchL1AndL2GasPrice(curve: CurveApi) {
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

function parsePolygonGasInfo(gasInfo: {
  estimatedBaseFee: number
  safeLow: { maxFee: number; maxPriorityFee: number }
  standard: { maxFee: number; maxPriorityFee: number }
  fast: { maxFee: number; maxPriorityFee: number }
}) {
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
        basePlusPriority: priority.map((p) => base + p),
      },
      label: ['fast', 'medium', 'slow'],
    }
  }
}

async function parseGasInfo(curve: CurveApi, provider: Provider, l2GasUrl?: string) {
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
    const fetchedData = await httpFetcher(l2GasUrl)
    const { eip1559Gas: gasInfo } = fetchedData?.data ?? {}

    baseInfo.basePlusPriority = gasFeeDataWei.gasPrice ? [gasFeeDataWei.gasPrice] : []
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

/** Helper function to create required query options based on network configs. */
export function createGasInfoQueryOptions<TChainId extends number>({
  chainId,
  networks,
}: {
  chainId: TChainId
  networks: Record<TChainId, Network>
}): GasInfoQuery<TChainId> {
  const network = networks[chainId]

  return {
    chainId,
    gasPricesUrl: network.gasPricesUrl,
    // It seems that in the original code the Ethereum mainnet gas prices URL was used for L2 price fetching.
    // I do not question whether this is right or not. I just re-use what was already being used.
    gasPricesUrlL2: network.gasL2 ? networks[1 as TChainId].gasPricesUrl : undefined,
  }
}

/**
 * Fetches gas info and updates the library. This wrapper exists as the base query requires query options
 * derived from network config objects. Having to import and use `createGasInfoQueryOptions` is cumbersome.
 */
export const fetchGasInfoAndUpdateLib = <TChainId extends number>({
  chainId,
  networks,
}: {
  chainId: TChainId
  networks: Record<TChainId, Network>
}) => fetchGasInfoAndUpdateLibBase(createGasInfoQueryOptions({ chainId, networks }))

/**
 * Fetches gas info and updates the library. This wrapper exists as the base query requires query options
 * derived from network config objects. Having to import and use `createGasInfoQueryOptions` is cumbersome.
 */
export const useGasInfoAndUpdateLib = <TChainId extends number>({
  chainId,
  networks,
}: {
  chainId: TChainId
  networks: Record<TChainId, Network>
}) => useGasInfoAndUpdateLibBase(createGasInfoQueryOptions({ chainId, networks }))
