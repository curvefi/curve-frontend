import { ethers } from 'ethers'
import type { GetState, SetState } from 'zustand'
import type { DetailsMapper, FormStatus } from '@/loan/components/PagePegKeepers/types'
import { DEFAULT_FORM_STATUS } from '@/loan/components/PagePegKeepers/utils'
import { PEG_KEEPERS_ADDRESSES } from '@/loan/constants'
import crvusdjsApi from '@/loan/lib/apiCrvusd'
import type { State } from '@/loan/store/useStore'
import { Curve, Provider } from '@/loan/types/loan.types'
import PromisePool from '@supercharge/promise-pool'
import { useWallet } from '@ui-kit/features/connect-wallet'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  formStatus: { [pegKeeper: string]: FormStatus }
  detailsMapper: DetailsMapper
}

const sliceKey = 'pegKeepers'

export type PegKeepersSlice = {
  [sliceKey]: SliceState & {
    fetchDetails(provider: Provider): Promise<void>
    fetchEstCallerProfit(provider: Provider, pegKeeperAddress: string): Promise<void>
    fetchUpdate(curve: Curve, pegKeeperAddress: string): Promise<{ hash: string; error: string }>

    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  formStatus: {},
  detailsMapper: {},
}

const createPegKeepersSlice = (set: SetState<State>, get: GetState<State>): PegKeepersSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    fetchDetails: async (provider) => {
      const state = get()
      const { detailsMapper, ...sliceState } = get()[sliceKey]

      try {
        if (Object.keys(detailsMapper).length > 0) return

        const contracts = await Promise.all(
          PEG_KEEPERS_ADDRESSES.map((p) => state.getContract('pegKeeper', p, provider)),
        )
        const debtCeilingContract = await state.getContract(
          'pegKeeperDebtCeiling',
          '0xC9332fdCB1C491Dcc683bAe86Fe3cb70360738BC',
          provider,
        )

        const results: DetailsMapper = {}

        await PromisePool.for(contracts)
          .handleError((error) => {
            console.error(error)
          })
          .process(async (contract, idx) => {
            if (!contract) return

            const pegKeeperAddress = PEG_KEEPERS_ADDRESSES[idx]
            const [debt, estCallerProfit, debtCeiling] = await Promise.all([
              contract.debt(),
              contract.estimate_caller_profit(),
              debtCeilingContract ? debtCeilingContract['debt_ceiling'](pegKeeperAddress) : () => '',
            ])
            results[pegKeeperAddress] = {
              debt: ethers.formatEther(debt),
              estCallerProfit: ethers.formatEther(estCallerProfit),
              debtCeiling: ethers.formatEther(debtCeiling),
            }
          })

        sliceState.setStateByKey('detailsMapper', results)
      } catch (error) {
        console.error(error)
      }
    },
    fetchEstCallerProfit: async (provider, pegKeeperAddress) => {
      const state = get()
      const { detailsMapper, ...sliceState } = get()[sliceKey]

      try {
        const idx = PEG_KEEPERS_ADDRESSES.indexOf(pegKeeperAddress)
        const contract = await state.getContract('pegKeeper', PEG_KEEPERS_ADDRESSES[idx], provider)
        if (!contract) return

        const estCallerProfit = await contract.estimate_caller_profit()
        sliceState.setStateByActiveKey('detailsMapper', pegKeeperAddress, {
          ...detailsMapper[pegKeeperAddress],
          estCallerProfit: ethers.formatEther(estCallerProfit),
        })
      } catch (error) {
        console.error(error)
      }
    },
    fetchUpdate: async (curve, pegKeeperAddress) => {
      const { gas, ...state } = get()
      const { formStatus, ...sliceState } = get()[sliceKey]

      const { provider } = useWallet.getState()
      if (!provider) return { hash: '', error: 'no provider' }

      const signer = await provider.getSigner()

      if (!signer) return { hash: '', error: 'No signer' }

      // loading
      sliceState.setStateByKey('formStatus', { [pegKeeperAddress]: { ...DEFAULT_FORM_STATUS, isInProgress: true } })

      const contract = await state.getContract('pegKeeper', pegKeeperAddress, signer)
      if (!contract) return { hash: '', error: 'Unable to get contract' }

      try {
        await gas.fetchGasInfo(curve)
        const hash = (await contract.update())?.hash
        if (hash) await crvusdjsApi.helpers.waitForTransaction(hash, provider)
        sliceState.setStateByKey('formStatus', { [pegKeeperAddress]: { ...DEFAULT_FORM_STATUS, isComplete: true } })

        // re-fetch data
        sliceState.fetchEstCallerProfit(provider, pegKeeperAddress)

        return { hash, error: '' }
      } catch (error) {
        console.error(error)
        const errorMessage = error?.message ?? ''
        sliceState.setStateByKey('formStatus', {
          [pegKeeperAddress]: { ...DEFAULT_FORM_STATUS, isComplete: true, error: errorMessage },
        })
        return { hash: '', error: errorMessage }
      }
    },

    // slice helpers
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
      get().resetAppState(sliceKey, { ...DEFAULT_STATE })
    },
  },
})

export default createPegKeepersSlice
