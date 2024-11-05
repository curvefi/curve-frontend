import type { DepositWithdrawModule } from '@/components/PageCrvUsdStaking/types'
import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'

import { t } from '@lingui/macro'
import { SCRVUSD_GAS_ESTIMATE } from '@/constants'

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
  stakingModule: DepositWithdrawModule
  inputAmount: number
  crvUsdExchangeRate: {
    fetchStatus: FetchStatus
    value: string
  }
  transaction: {
    variant: TransactionVariant
    status: TransactionStatus
    transaction: string | null
    errorMessage: string
  }
}

type PreviewFlag = 'deposit' | 'withdraw' | 'redeem'
type TransactionVariant = 'revoke' | 'approve' | 'deposit' | 'withdraw' | ''

const sliceKey = 'scrvusd'

export type ScrvUsdSlice = {
  [sliceKey]: SliceState & {
    checkApproval: {
      depositApprove: (amount: number) => void
      deposit: (amount: number) => void
    }
    estimateGas: {
      depositApprove: (amount: number) => void
      deposit: (amount: number) => void
    }
    previewAction: (flag: PreviewFlag, amount: number) => void
    deploy: {
      depositApprove: (amount: number) => void
      deposit: (amount: number) => void
      withdrawApprove: (amount: number) => void
      withdraw: (amount: number) => void
    }
    fetchUserBalances: (address: string) => void
    getExchangeRate: () => void
    setMax: (userAddress: string, stakingModule: DepositWithdrawModule) => void
    setStakingModule: (stakingModule: DepositWithdrawModule) => void
    setInputAmount: (amount: number) => void
    setOutputAmount: (amount: number) => void
    setPreviewReset: () => void
    setStakingModuleChangeReset: () => void
    setEstimateGas: (userAddress: string) => number

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
  stakingModule: 'deposit',
  inputAmount: 0,
  preview: {
    fetchStatus: '',
    value: '',
  },
  crvUsdExchangeRate: {
    fetchStatus: 'loading',
    value: '',
  },
  transaction: {
    variant: '',
    status: '',
    transaction: null,
    errorMessage: '',
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
    deploy: {
      depositApprove: async (amount: number) => {
        const lendApi = get().lendApi
        const curve = get().curve
        const provider = get().wallet.provider

        // TODO: check so curve always is set when approving
        if (!lendApi || !curve || !provider) return

        const fetchGasInfo = get().gas.fetchGasInfo
        const notifyNotification = get().wallet.notifyNotification
        let dismissNotificationHandler

        const notifyPendingMessage = t`Please confirm to approve ${amount} crvUSD.`
        const { dismiss: dismissConfirm } = notifyNotification(notifyPendingMessage, 'pending')
        dismissNotificationHandler = dismissConfirm
        await fetchGasInfo(curve)

        get()[sliceKey].setStateByKey('transaction', {
          variant: 'approve',
          status: 'confirming',
          transaction: null,
          errorMessage: '',
        })

        try {
          const transactionHash = await lendApi.st_crvUSD.depositApprove(amount, false)

          get()[sliceKey].setStateByKey('transaction', {
            variant: 'approve',
            status: 'loading',
            transaction: transactionHash,
            errorMessage: '',
          })
          dismissConfirm()

          const deployingNotificationMessage = t`Approving ${amount} crvUSD...`
          const { dismiss: dismissDeploying } = notifyNotification(deployingNotificationMessage, 'pending')
          dismissNotificationHandler = dismissDeploying

          const receipt = await provider.waitForTransaction(transactionHash[0])
          get()[sliceKey].setStateByKey('transaction', {
            variant: '',
            status: '',
            transaction: null,
            errorMessage: '',
          })
          dismissDeploying()

          const successNotificationMessage = t`Succesfully approved ${amount} crvUSD!`
          notifyNotification(successNotificationMessage, 'success', 15000)
        } catch (error) {
          dismissNotificationHandler()
          get()[sliceKey].setStateByKey('transaction', {
            variant: 'approve',
            status: 'error',
            transaction: null,
            errorMessage: error.message,
          })
          console.log(error)
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
    setStakingModule: (stakingModule: DepositWithdrawModule) => {
      get()[sliceKey].setStateByKey('stakingModule', stakingModule)
      get()[sliceKey].setStakingModuleChangeReset()
    },
    setMax: (userAddress: string, stakingModule: DepositWithdrawModule) => {
      if (stakingModule === 'deposit') {
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
    setStakingModuleChangeReset: () => {
      get()[sliceKey].setStateByKey('inputAmount', 0)
      get()[sliceKey].setPreviewReset()
    },
    setEstimateGas: (userAddress: string) => {
      const stakingModule = get()[sliceKey].stakingModule
      const depositApproval = get()[sliceKey].depositApproval
      const inputAmount = get()[sliceKey].inputAmount
      const approvedAmount = +depositApproval.allowance
      const gas = get()[sliceKey].estGas.gas
      const userBalance = get()[sliceKey].userBalances[userAddress]?.scrvUSD ?? 0

      const approved = depositApproval && approvedAmount > inputAmount

      if (!approved && stakingModule === 'deposit') {
        if (+userBalance > 0) {
          return gas + SCRVUSD_GAS_ESTIMATE.FIRST_DEPOSIT
        }
        return gas + SCRVUSD_GAS_ESTIMATE.FOLLOWING_DEPOSIT
      }

      return gas
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
