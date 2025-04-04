import { JsonRpcProvider } from 'ethers'
import cloneDeep from 'lodash/cloneDeep'
import type { GetState, SetState } from 'zustand'
import networks from '@/loan/networks'
import type { GasInfo } from '@/loan/store/types'
import type { State } from '@/loan/store/useStore'
import { ChainId, LlamalendApi } from '@/loan/types/loan.types'
import { httpFetcher } from '@/loan/utils/helpers'
import { getEthereumCustomFeeDataValues } from '@ui/utils/utilsGas'
import { log } from '@ui-kit/lib/logging'
import { gweiToWai } from '@ui-kit/utils'

type StateKey = keyof typeof DEFAULT_STATE

export type SliceState = {
  gasInfo: GasInfo | null
  label: string[]
  gasValue: { [key: string]: string }
}

const sliceKey = 'gas'

export interface GasSlice {
  [sliceKey]: SliceState & {
    fetchGasInfo(curve: LlamalendApi): Promise<void>

    // steps helper
    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  gasInfo: null,
  label: [],
  gasValue: { type: 'fast' as 'fast' },
}

const createGasSlice = (set: SetState<State>, get: GetState<State>) => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    fetchGasInfo: async (curve: LlamalendApi) => {
      const chainId = curve.chainId
      const rpcUrl = networks[chainId].rpcUrl
      log('fetchGasInfo', chainId)

      try {
        let parsedGasInfo: { gasInfo: GasInfo; label: string[] } | undefined

        if (chainId === 1) {
          const url = networks[1].gasPricesUrl
          const fetchedData = await httpFetcher(url)
          const { eip1559Gas: gasInfo } = fetchedData?.data ?? {}

          parsedGasInfo = gasInfo ? parseEthereumGasInfo(gasInfo, chainId) : await parseGasInfoFromRpcUrl(rpcUrl)

          const customFeeDataValues = getEthereumCustomFeeDataValues(gasInfo)
          if (customFeeDataValues) {
            curve.setCustomFeeData(customFeeDataValues)
          }
        } else {
          parsedGasInfo = await parseGasInfoFromRpcUrl(rpcUrl)
        }

        if (parsedGasInfo) {
          get().gas.setStateByKeys({ gasInfo: parsedGasInfo.gasInfo, label: parsedGasInfo.label })
        }
      } catch (error) {
        console.error(error)
      }
    },

    setStateByActiveKey: <T>(key: StateKey, activeKey: string, value: T) => {
      get().setAppStateByActiveKey(sliceKey, key, activeKey, value)
    },
    setStateByKey: <T>(key: StateKey, value: T) => {
      get().setAppStateByKey(sliceKey, key, value)
    },
    setStateByKeys: <T>(sliceState: Partial<SliceState>) => {
      get().setAppStateByKeys(sliceKey, sliceState)
    },
    resetState: () => {
      get().resetAppState(sliceKey, cloneDeep(DEFAULT_STATE))
    },
  },
})

export default createGasSlice

// @ts-ignore
function parseEthereumGasInfo(gasInfo, chainId: ChainId) {
  if (gasInfo.base && gasInfo.prio && gasInfo.max) {
    const base = Math.trunc(gasInfo.base)
    const priority = gasInfo.prio.map(Math.trunc)
    const max = gasInfo.max.map(Math.trunc)

    return {
      gasInfo: {
        base,
        priority,
        max,
        basePlusPriority: priority.map((p: number) => {
          const basePlusPriority = base + p
          if (chainId === 1) {
            return basePlusPriority
          }

          // temp hack to get reduced est gas cost for layer 2
          return basePlusPriority * 0.1
        }),
      },
      label: ['fastest', 'fast', 'medium', 'slow'],
    }
  }
}

async function parseGasInfoFromRpcUrl(rpcUrl: string) {
  if (rpcUrl) {
    const provider = new JsonRpcProvider(rpcUrl)

    const gasInfo = await provider.getFeeData()
    const { gasPrice, maxPriorityFeePerGas, maxFeePerGas } = gasInfo

    if (gasPrice) {
      const base = toNumber(gasPrice)

      if (maxPriorityFeePerGas && maxFeePerGas) {
        return {
          gasInfo: {
            base,
            priority: [toNumber(maxPriorityFeePerGas)],
            max: [toNumber(maxFeePerGas)],
            basePlusPriority: [toNumber(gasPrice + maxPriorityFeePerGas)],
          },
          label: ['fast'],
        }
      }
      return {
        gasInfo: {
          base,
          priority: [0],
          max: [0],
          basePlusPriority: [toNumber(gasPrice) + gweiToWai(25)],
        },
        label: ['fast'],
      }
    }
  }
}

const toNumber = (value: bigint) => {
  if (value <= Number.MAX_SAFE_INTEGER && value >= Number.MIN_SAFE_INTEGER) {
    return Number(value)
  }
  throw new Error(`Value: "${value}" is out of bounds to be a Number`)
}
