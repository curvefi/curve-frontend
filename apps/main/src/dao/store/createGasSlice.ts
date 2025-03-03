import type { GetState, SetState } from 'zustand'
import type { State } from '@/dao/store/useStore'
import cloneDeep from 'lodash/cloneDeep'
import { getEthereumCustomFeeDataValues } from '@ui/utils/utilsGas'
import { httpFetcher } from '@/dao/utils'
import { log } from '@ui-kit/lib'
import networks from '@/dao/networks'
import { CurveApi, GasInfo, Provider } from '@/dao/types/dao.types'
import { useWallet } from '@ui-kit/features/connect-wallet'

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
    fetchGasInfo(curve: CurveApi): Promise<void>
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

    fetchGasInfo: async (curve) => {
      if (!curve) return

      const { chainId } = curve
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
              curve.setCustomFeeData(customFeeDataValues)
            }
          }
        }

        if (parsedGasInfo) {
          get()[sliceKey].setStateByKeys(parsedGasInfo)
        } else {
          const { provider } = useWallet.getState()
          if (provider && chainId) {
            const parsedGasInfo = await parseGasInfo(curve, provider)
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

async function parseGasInfo(curve: CurveApi, provider: Provider) {
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
        ...(await calcBasePlusPriority(gasFeeDataWei)),
      },
      label: ['fast'],
    }
  }
}

async function calcBasePlusPriority(gasFeeDataWei: {
  gasPrice: number | null
  max: number[] | null
  priority: number[] | null
}) {
  let result: Pick<GasInfo, 'basePlusPriority' | 'basePlusPriorityL1' | 'l1GasPriceWei' | 'l2GasPriceWei'> = {
    basePlusPriority: [] as number[],
  }

  if (gasFeeDataWei.gasPrice) {
    result.basePlusPriority = [+gasFeeDataWei.gasPrice]
  }
  return result
}
