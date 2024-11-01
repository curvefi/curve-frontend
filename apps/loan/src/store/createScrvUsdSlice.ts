import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'
import type { DepositWithdrawModule } from '@/components/PageCrvUsdStaking/types'

import cloneDeep from 'lodash/cloneDeep'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  estGas: {
    gas: number
    fetchStatus: FetchStatus
  }
  userBalances: {
    [address: string]: {
      fetchStatus: FetchStatus
      crvUSD: string
      scrvUSD: string
    }
  }
  depositApproval: {
    approval: boolean
    allowance: string
    fetchStatus: FetchStatus
  }
  preview: {
    fetchStatus: FetchStatus
    value: string
  }
  module: DepositWithdrawModule
  inputAmount: number
  crvUsdExchangeRate: {
    fetchStatus: FetchStatus
    value: string
  }
}

type PreviewFlag = 'deposit' | 'withdraw' | 'redeem'

const sliceKey = 'scrvusd'

export type ScrvUsdSlice = {
  [sliceKey]: SliceState & {
    checkApproval: {
      depositApprove: (amount: number) => void
      deposit: (amount: number) => void
    }
    estimateGas: {
      depositApprove: (amount: number) => void
    }
    previewAction: (flag: PreviewFlag, amount: number) => void
    deploy: {
      deposit: (amount: number) => void
      withdraw: (amount: number) => void
    }
    fetchUserBalances: (address: string) => void
    getExchangeRate: () => void
    setMax: (userAddress: string, module: DepositWithdrawModule) => void
    setModule: (module: DepositWithdrawModule) => void
    setInputAmount: (amount: number) => void
    setOutputAmount: (amount: number) => void
    setPreviewReset: () => void
    setModuleChangeReset: () => void

    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  estGas: {
    gas: 0,
    fetchStatus: '',
  },
  userBalances: {},
  depositApproval: {
    approval: false,
    allowance: '',
    fetchStatus: '',
  },
  module: 'deposit',
  inputAmount: 0,
  preview: {
    fetchStatus: '',
    value: '',
  },
  crvUsdExchangeRate: {
    fetchStatus: 'loading',
    value: '',
  },
}

const createScrvUsdSlice = (set: SetState<State>, get: GetState<State>) => ({
  [sliceKey]: {
    ...DEFAULT_STATE,
    checkApproval: {
      depositApprove: async (amount: number) => {
        const lendApi = get().lendApi

        if (!lendApi) return

        get()[sliceKey].setStateByKey('depositApproval', { approval: false, allowance: '', fetchStatus: 'loading' })

        try {
          const [approvedResponse, allowanceResponse] = await Promise.all([
            lendApi.st_crvUSD.depositIsApproved(amount),
            lendApi.st_crvUSD.depositAllowance(),
          ])

          console.log(approvedResponse, allowanceResponse)

          get()[sliceKey].setStateByKey('depositApproval', {
            approval: approvedResponse,
            allowance: allowanceResponse[0],
            fetchStatus: 'success',
          })
        } catch (error) {
          console.error(error)
          get()[sliceKey].setStateByKey('depositApproval', { approval: false, allowance: '', fetchStatus: 'error' })
        }
      },
    },
    estimateGas: {
      depositApprove: async (amount: number) => {
        get()[sliceKey].setStateByKey('estGas', { gas: 0, fetchStatus: 'loading' })

        const lendApi = get().lendApi
        const curve = get().curve
        const fetchGasInfo = get().gas.fetchGasInfo

        if (!curve) return

        await fetchGasInfo(curve)

        try {
          // only returns number[] on base or optimism
          const estimatedGas = (await lendApi?.st_crvUSD.estimateGas.depositApprove(amount)) as number

          get()[sliceKey].setStateByKey('estGas', { gas: estimatedGas, fetchStatus: 'success' })
        } catch (error) {
          console.error(error)
          get()[sliceKey].setStateByKey('estGas', { gas: 0, fetchStatus: 'error' })
        }
      },
      deposit: async (amount: number) => {
        get()[sliceKey].setStateByKey('estGas', { gas: 0, fetchStatus: 'loading' })

        const lendApi = get().lendApi
        const curve = get().curve
        const fetchGasInfo = get().gas.fetchGasInfo

        if (!curve) return

        await fetchGasInfo(curve)

        try {
          // only returns number[] on base or optimism
          const estimatedGas = (await lendApi?.st_crvUSD.estimateGas.deposit(amount)) as number

          get()[sliceKey].setStateByKey('estGas', { gas: estimatedGas, fetchStatus: 'success' })
        } catch (error) {
          console.error(error)
          get()[sliceKey].setStateByKey('estGas', { gas: 0, fetchStatus: 'error' })
        }
      },
    },
    getExchangeRate: async () => {
      const lendApi = get().lendApi

      if (!lendApi) return

      get()[sliceKey].setStateByKey('crvUsdExchangeRate', { fetchStatus: 'loading', value: '' })

      try {
        const response = await lendApi.st_crvUSD.convertToShares(1)

        get()[sliceKey].setStateByKey('crvUsdExchangeRate', { fetchStatus: 'success', value: response })
      } catch (error) {
        console.error(error)
        get()[sliceKey].setStateByKey('crvUsdExchangeRate', { fetchStatus: 'error', value: '' })
      }
    },
    previewAction: async (flag: PreviewFlag, amount: number) => {
      get()[sliceKey].setStateByKey('preview', { fetchStatus: 'loading', value: '' })

      const lendApi = get().lendApi

      if (!lendApi) return

      try {
        let response = ''

        if (flag === 'deposit') {
          response = await lendApi.st_crvUSD.previewDeposit(amount)
        } else if (flag === 'withdraw') {
          response = await lendApi.st_crvUSD.previewWithdraw(amount)
        } else {
          response = await lendApi.st_crvUSD.previewRedeem(amount)
        }

        get()[sliceKey].setStateByKey('preview', { fetchStatus: 'success', value: response })
      } catch (error) {
        console.error(error)
        get()[sliceKey].setStateByKey('preview', { fetchStatus: 'error', value: '' })
      }
    },
    fetchUserBalances: async (address: string) => {
      const lendApi = get().lendApi
      const userAddress = address.toLowerCase()

      if (!lendApi) return

      try {
        get()[sliceKey].setStateByKey('userBalances', { [userAddress]: { fetchStatus: 'loading' } })

        const response = await lendApi.st_crvUSD.userBalances(userAddress)

        const balances = {
          crvUSD: response.crvUSD,
          scrvUSD: response.st_crvUSD,
        }

        get()[sliceKey].setStateByKey('userBalances', { [userAddress]: { fetchStatus: 'success', ...balances } })
      } catch (error) {
        console.error(error)
        get()[sliceKey].setStateByKey('userBalances', {
          [userAddress]: { crvUSD: '', scrvUSD: '', fetchStatus: 'error' },
        })
      }
    },
    setModule: (module: DepositWithdrawModule) => {
      get()[sliceKey].setStateByKey('module', module)
      get()[sliceKey].setModuleChangeReset()
    },
    setMax: (userAddress: string, module: DepositWithdrawModule) => {
      if (module === 'deposit') {
        const crvUsdBalance = get()[sliceKey].userBalances[userAddress].crvUSD

        get()[sliceKey].setStateByKey('inputAmount', +crvUsdBalance)
      } else {
        const scrvUsdBalance = get()[sliceKey].userBalances[userAddress].scrvUSD

        get()[sliceKey].setStateByKey('inputAmount', +scrvUsdBalance)
      }
    },
    setInputAmount: (amount: number) => {
      if (!amount) {
        get()[sliceKey].setStateByKey('inputAmount', 0)
        return
      }

      get()[sliceKey].setStateByKey('inputAmount', amount)
    },
    setPreviewReset: () => {
      get()[sliceKey].setStateByKey('preview', { fetchStatus: '', value: '' })
    },
    setModuleChangeReset: () => {
      get()[sliceKey].setStateByKey('inputAmount', 0)
      get()[sliceKey].setPreviewReset()
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
      get().resetAppState(sliceKey, cloneDeep(DEFAULT_STATE))
    },
  },
})

export default createScrvUsdSlice
