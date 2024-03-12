import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'
import type { GasInfo } from '@/store/types'

import cloneDeep from 'lodash/cloneDeep'

import { getEthereumCustomFeeDataValues } from '@/ui/utils/utilsGas'
import { gweiToWai, weiToGwei } from '@/ui/utils/utilsWeb3'
import { helpers } from '@/lib/apiLending'
import { httpFetcher, log } from '@/utils/helpers'
import networks from '@/networks'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  gasInfo: GasInfo | null
  label: string[]
  gasValue: { [key: string]: string }
}

const sliceKey = 'gas'

// prettier-ignore
export type GasSlice = {
  [sliceKey]: SliceState & {
    fetchGasInfo(api: Api): Promise<void>

    // helpers
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(sliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  gasInfo: null,
  label: [],
  gasValue: { type: 'fast' as 'fast' },
}

// units of gas used * (base fee + priority fee)
// estimatedGas * (base fee * maxPriorityFeePerGas)

const createGasSlice = (set: SetState<State>, get: GetState<State>): GasSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    fetchGasInfo: async (api) => {
      if (!api) return

      const { chainId } = api
      log('fetchGasInfo', chainId)

      try {
        let parsedGasInfo
        const url = networks[chainId].gasPricesUrl

        if (chainId === 1) {
          // ethereum uses api
          const fetchedData = await httpFetcher(url)
          const { eip1559Gas: gasInfo, gas } = fetchedData?.data ?? {}

          if (gasInfo) {
            parsedGasInfo = parseEthereumGasInfo(gasInfo, gas)
            const customFeeDataValues = getEthereumCustomFeeDataValues(gasInfo)
            if (customFeeDataValues) {
              api.setCustomFeeData(customFeeDataValues)
            }
          }
        } else if (chainId === 137) {
          // polygon uses api
          const fetchedData = await httpFetcher(url)

          if (fetchedData?.fast) {
            parsedGasInfo = parsePolygonGasInfo(fetchedData)
          }

          // set apijs's custom fee data for polygon
          if (fetchedData) {
            api.setCustomFeeData({
              maxFeePerGas: fetchedData.fast.maxFee,
              maxPriorityFeePerGas: fetchedData.fast.maxPriorityFee,
            })
          }
        } else if (chainId === 42161) {
          const provider = get().wallet.provider

          if (provider) {
            parsedGasInfo = await parseGasInfo(api, provider)

            if (parsedGasInfo) {
              const { l2GasPriceWei } = await helpers.fetchL2GasPrice(api)
              parsedGasInfo.gasInfo.l2GasPriceWei = l2GasPriceWei

              if (l2GasPriceWei) {
                api.setCustomFeeData({
                  maxFeePerGas: 2 * weiToGwei(l2GasPriceWei),
                  maxPriorityFeePerGas: weiToGwei(l2GasPriceWei),
                })
              }
            }
          }
        }

        if (parsedGasInfo) {
          get()[sliceKey].setStateByKeys(parsedGasInfo)
        } else {
          const provider = get().wallet.provider
          if (provider && chainId) {
            const parsedGasInfo = await parseGasInfo(api, provider)
            if (parsedGasInfo) {
              get()[sliceKey].setStateByKeys(parsedGasInfo)
            }
          }
        }
      } catch (error) {
        console.error(error)
      }
    },

    setStateByKey: (key, value) => {
      get().setAppStateByKey(sliceKey, key, value)
    },
    setStateByKeys: (sliceState) => {
      get().setAppStateByKeys(sliceKey, sliceState)
    },
    resetState: () => {
      get().resetAppState(sliceKey, cloneDeep(DEFAULT_STATE))
    },
  },
})

export default createGasSlice

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

async function parseGasInfo(api: Api, provider: Provider) {
  if (provider) {
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

    return {
      gasInfo: {
        ...gasFeeDataWei,
        ...(await calcBasePlusPriority(api, gasFeeDataWei)),
      },
      label: ['fast'],
    }
  }
}

async function calcBasePlusPriority(
  api: Api,
  gasFeeDataWei: {
    gasPrice: number | null
    max: number[] | null
    priority: number[] | null
  }
) {
  let result: Pick<GasInfo, 'basePlusPriority' | 'basePlusPriorityL1' | 'l1GasPriceWei' | 'l2GasPriceWei'> = {
    basePlusPriority: [] as number[],
  }

  if (networks[api.chainId].gasL2) {
    const url = networks['1'].gasPricesUrl
    const fetchedData = await httpFetcher(url)
    const { eip1559Gas: gasInfo } = fetchedData?.data ?? {}

    result.basePlusPriority = gasFeeDataWei.gasPrice ? [gasFeeDataWei.gasPrice] : []
    result.basePlusPriorityL1 = [gasInfo.base * 6000]

    const { l2GasPriceWei, l1GasPriceWei } = await helpers.fetchL1AndL2GasPrice(api)
    result.l1GasPriceWei = l1GasPriceWei
    result.l2GasPriceWei = l2GasPriceWei
  } else if (gasFeeDataWei.gasPrice) {
    result.basePlusPriority = [+gasFeeDataWei.gasPrice]
  }
  return result
}
