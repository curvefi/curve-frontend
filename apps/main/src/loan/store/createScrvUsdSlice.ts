import BigNumber from 'bignumber.js'
import lodash from 'lodash'
import type { StoreApi } from 'zustand'
import type { DepositWithdrawModule, StatisticsChart } from '@/loan/components/PageCrvUsdStaking/types'
import { SCRVUSD_GAS_ESTIMATE } from '@/loan/constants'
import type { ScrvUsdUserBalances } from '@/loan/entities/scrvusd-userBalances'
import { invalidateScrvUsdUserBalances } from '@/loan/entities/scrvusd-userBalances'
import { networks } from '@/loan/networks'
import type { State } from '@/loan/store/useStore'
import { type ChainId, FetchStatus, TransactionStatus } from '@/loan/types/loan.types'
import { scanTxPath } from '@ui/utils'
import { getLib, notify, useWallet } from '@ui-kit/features/connect-wallet'
import { queryClient } from '@ui-kit/lib/api/query-client'
import { t } from '@ui-kit/lib/i18n'
import type { TimeOption } from '@ui-kit/lib/types/scrvusd'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  estGas: { gas: number; fetchStatus: FetchStatus }
  depositApproval: { approval: boolean; allowance: string; fetchStatus: FetchStatus }
  preview: { fetchStatus: FetchStatus; value: string }
  stakingModule: DepositWithdrawModule
  selectedStatisticsChart: StatisticsChart
  revenueChartTimeOption: TimeOption
  inputAmount: string
  scrvUsdExchangeRate: { fetchStatus: FetchStatus; value: string }
  crvUsdSupplies: { fetchStatus: FetchStatus; crvUSD: string; scrvUSD: string }
  approveInfinite: boolean
  approveDepositTransaction: { transactionStatus: TransactionStatus; transaction: string | null; errorMessage: string }
  depositTransaction: { transactionStatus: TransactionStatus; transaction: string | null; errorMessage: string }
  withdrawTransaction: { transactionStatus: TransactionStatus; transaction: string | null; errorMessage: string }
}

type PreviewFlag = 'deposit' | 'withdraw' | 'redeem'

const sliceKey = 'scrvusd'

export type ScrvUsdSlice = {
  [sliceKey]: SliceState & {
    checkApproval: { depositApprove: (amount: string) => Promise<void> }
    estimateGas: {
      depositApprove: (amount: string) => Promise<void>
      deposit: (amount: string) => Promise<void>
      withdraw: (amount: string) => Promise<void>
      redeem: (amount: string) => Promise<void>
    }
    previewAction: (flag: PreviewFlag, amount: string) => void
    deploy: {
      depositApprove: (amount: string) => Promise<boolean | undefined>
      deposit: (amount: string) => Promise<void>
      withdraw: (amount: string) => Promise<void>
      redeem: (amount: string) => Promise<void>
    }
    fetchExchangeRate: () => void
    fetchCrvUsdSupplies: () => void
    setStakingModule: (stakingModule: DepositWithdrawModule) => void
    setSelectedStatisticsChart: (chart: StatisticsChart) => void
    setRevenueChartTimeOption: (timeOption: TimeOption) => void
    setInputAmount: (amount: string) => void
    setApproveInfinite: () => void
    setPreviewReset: () => void
    setStakingModuleChangeReset: () => void
    setTransactionsReset: () => void
    getInputAmountApproved: () => boolean
    getEstimateGas: (userAddress: string) => number

    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  estGas: { gas: 0, fetchStatus: '' },
  depositApproval: { approval: false, allowance: '', fetchStatus: '' },
  stakingModule: 'deposit',
  selectedStatisticsChart: 'savingsRate',
  revenueChartTimeOption: '1M',
  inputAmount: '0',
  preview: { fetchStatus: '', value: '0' },
  scrvUsdExchangeRate: { fetchStatus: 'loading', value: '' },
  crvUsdSupplies: { fetchStatus: 'loading', crvUSD: '', scrvUSD: '' },
  approveInfinite: false,
  approveDepositTransaction: { transactionStatus: '', transaction: null, errorMessage: '' },
  depositTransaction: { transactionStatus: '', transaction: null, errorMessage: '' },
  withdrawTransaction: { transactionStatus: '', transaction: null, errorMessage: '' },
}

export const createScrvUsdSlice = (_set: StoreApi<State>['setState'], get: StoreApi<State>['getState']) => ({
  [sliceKey]: {
    ...DEFAULT_STATE,
    checkApproval: {
      depositApprove: async (amount: string) => {
        const lendApi = getLib('llamaApi')
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
      depositApprove: async (amount: string) => {
        get()[sliceKey].setStateByKey('estGas', { gas: 0, fetchStatus: 'loading' })

        const lendApi = getLib('llamaApi')
        const curve = getLib('llamaApi')

        if (!curve) return

        try {
          // only returns number[] on base or optimism
          const estimatedGas = (await lendApi?.st_crvUSD.estimateGas.depositApprove(amount)) as number

          get()[sliceKey].setStateByKey('estGas', { gas: estimatedGas, fetchStatus: 'success' })
        } catch (error) {
          console.error(error)
          get()[sliceKey].setStateByKey('estGas', { gas: 0, fetchStatus: 'error' })
        }
      },
      deposit: async (amount: string) => {
        get()[sliceKey].setStateByKey('estGas', { gas: 0, fetchStatus: 'loading' })

        const lendApi = getLib('llamaApi')
        const curve = getLib('llamaApi')

        if (!curve) return

        try {
          // only returns number[] on base or optimism
          const estimatedGas = (await lendApi?.st_crvUSD.estimateGas.deposit(amount)) as number

          get()[sliceKey].setStateByKey('estGas', { gas: estimatedGas, fetchStatus: 'success' })
        } catch (error) {
          console.error(error)
          get()[sliceKey].setStateByKey('estGas', { gas: 0, fetchStatus: 'error' })
        }
      },
      withdraw: async (amount: string) => {
        get()[sliceKey].setStateByKey('estGas', { gas: 0, fetchStatus: 'loading' })
        const lendApi = getLib('llamaApi')
        const curve = getLib('llamaApi')
        if (!curve) return

        try {
          // only returns number[] on base or optimism
          const estimatedGas = (await lendApi?.st_crvUSD.estimateGas.withdraw(amount)) as number

          get()[sliceKey].setStateByKey('estGas', { gas: estimatedGas, fetchStatus: 'success' })
        } catch (error) {
          console.error(error)
          get()[sliceKey].setStateByKey('estGas', { gas: 0, fetchStatus: 'error' })
        }
      },
      redeem: async (amount: string) => {
        get()[sliceKey].setStateByKey('estGas', { gas: 0, fetchStatus: 'loading' })

        const lendApi = getLib('llamaApi')
        const curve = getLib('llamaApi')
        if (!curve) return

        try {
          // only returns number[] on base or optimism
          const estimatedGas = (await lendApi?.st_crvUSD.estimateGas.redeem(amount)) as number

          get()[sliceKey].setStateByKey('estGas', { gas: estimatedGas, fetchStatus: 'success' })
        } catch (error) {
          console.error(error)
          get()[sliceKey].setStateByKey('estGas', { gas: 0, fetchStatus: 'error' })
        }
      },
    },
    deploy: {
      depositApprove: async (amount: string) => {
        const lendApi = getLib('llamaApi')
        const curve = getLib('llamaApi')
        const { provider } = useWallet.getState()
        const approveInfinite = get()[sliceKey].approveInfinite

        // TODO: check so curve always is set when approving
        if (!lendApi || !curve || !provider) return

        const chainId = curve.chainId as ChainId

        let dismissNotificationHandler = notify(t`Please confirm to approve ${amount} crvUSD.`, 'pending').dismiss

        get()[sliceKey].setStateByKey('approveDepositTransaction', {
          transactionStatus: 'confirming',
          transaction: null,
          errorMessage: '',
        })

        try {
          const transactionHash = await lendApi.st_crvUSD.depositApprove(amount, approveInfinite)

          get()[sliceKey].setStateByKey('approveDepositTransaction', {
            transactionStatus: 'loading',
            transaction: scanTxPath(networks[chainId], transactionHash[0]),
            errorMessage: '',
          })
          dismissNotificationHandler()

          dismissNotificationHandler = notify(t`Approving ${amount} crvUSD...`, 'pending').dismiss

          await provider.waitForTransaction(transactionHash[0])

          get()[sliceKey].setStateByKey('approveDepositTransaction', {
            transactionStatus: 'success',
            transaction: scanTxPath(networks[chainId], transactionHash[0]),
            errorMessage: '',
          })
          dismissNotificationHandler()
          void get()[sliceKey].checkApproval.depositApprove(amount)

          const successNotificationMessage = t`Succesfully approved ${amount} crvUSD!`
          notify(successNotificationMessage, 'success', 15000)

          return true
        } catch (error) {
          dismissNotificationHandler()
          get()[sliceKey].setStateByKey('approveDepositTransaction', {
            transactionStatus: 'error',
            transaction: null,
            errorMessage: error.message,
          })
          console.warn(error)
          return false
        }
      },
      deposit: async (amount: string) => {
        const lendApi = getLib('llamaApi')
        const curve = getLib('llamaApi')
        const { provider } = useWallet.getState()

        if (!lendApi || !curve || !provider) return

        const chainId = curve.chainId as ChainId

        let dismissNotificationHandler = notify(t`Please confirm to deposit ${amount} crvUSD.`, 'pending').dismiss

        get()[sliceKey].setStateByKey('depositTransaction', {
          transactionStatus: 'confirming',
          transaction: null,
          errorMessage: '',
        })

        try {
          const transactionHash = await lendApi.st_crvUSD.deposit(amount)

          get()[sliceKey].setStateByKey('depositTransaction', {
            transactionStatus: 'loading',
            transaction: scanTxPath(networks[chainId], transactionHash),
            errorMessage: '',
          })
          dismissNotificationHandler()

          dismissNotificationHandler = notify(t`Depositing ${amount} crvUSD...`, 'pending').dismiss

          await provider.waitForTransaction(transactionHash)

          get()[sliceKey].setStateByKey('depositTransaction', {
            transactionStatus: 'success',
            transaction: scanTxPath(networks[chainId], transactionHash),
            errorMessage: '',
          })
          dismissNotificationHandler()

          // invalidate user balances query
          invalidateScrvUsdUserBalances({ userAddress: useWallet.getState().wallet?.address })

          get()[sliceKey].setStakingModuleChangeReset()

          const successNotificationMessage = t`Succesfully deposited ${amount} crvUSD!`
          notify(successNotificationMessage, 'success', 15000)
        } catch (error) {
          dismissNotificationHandler()
          get()[sliceKey].setStateByKey('depositTransaction', {
            transactionStatus: 'error',
            transaction: null,
            errorMessage: error.message,
          })
          console.warn(error)
        }
      },
      withdraw: async (amount: string) => {
        const llamaApi = getLib('llamaApi')
        const { provider } = useWallet.getState()

        if (!llamaApi || !provider) return

        const chainId = llamaApi.chainId as ChainId

        let dismissNotificationHandler = notify(t`Please confirm to withdraw ${amount} scrvUSD.`, 'pending').dismiss

        get()[sliceKey].setStateByKey('withdrawTransaction', {
          transactionStatus: 'confirming',
          transaction: null,
          errorMessage: '',
        })

        try {
          const transactionHash = await llamaApi.st_crvUSD.withdraw(amount)

          get()[sliceKey].setStateByKey('withdrawTransaction', {
            transactionStatus: 'loading',
            transaction: scanTxPath(networks[chainId], transactionHash),
            errorMessage: '',
          })
          dismissNotificationHandler()

          const deployingNotificationMessage = t`Withdrawing ${amount} scrvUSD...`
          dismissNotificationHandler = notify(deployingNotificationMessage, 'pending').dismiss

          await provider.waitForTransaction(transactionHash)

          get()[sliceKey].setStateByKey('withdrawTransaction', {
            transactionStatus: 'success',
            transaction: scanTxPath(networks[chainId], transactionHash),
            errorMessage: '',
          })
          dismissNotificationHandler()

          // invalidate user balances query
          invalidateScrvUsdUserBalances({ userAddress: useWallet.getState().wallet?.address })

          get()[sliceKey].setStakingModuleChangeReset()

          const successNotificationMessage = t`Succesfully withdrew ${amount} scrvUSD!`
          notify(successNotificationMessage, 'success', 15000)
        } catch (error) {
          dismissNotificationHandler()
          get()[sliceKey].setStateByKey('withdrawTransaction', {
            transactionStatus: 'error',
            transaction: null,
            errorMessage: error.message,
          })
          console.warn(error)
        }
      },
      redeem: async (amount: string) => {
        const lendApi = getLib('llamaApi')
        const curve = getLib('llamaApi')
        const { provider } = useWallet.getState()
        if (!lendApi || !curve || !provider) return

        const chainId = curve.chainId as ChainId

        let dismissNotificationHandler = notify(t`Please confirm to withdraw ${amount} scrvUSD.`, 'pending').dismiss

        get()[sliceKey].setStateByKey('withdrawTransaction', {
          transactionStatus: 'confirming',
          transaction: null,
          errorMessage: '',
        })

        try {
          const transactionHash = await lendApi.st_crvUSD.redeem(amount)

          get()[sliceKey].setStateByKey('withdrawTransaction', {
            transactionStatus: 'loading',
            transaction: scanTxPath(networks[chainId], transactionHash),
            errorMessage: '',
          })
          dismissNotificationHandler()

          dismissNotificationHandler = notify(t`Withdrawing ${amount} scrvUSD...`, 'pending').dismiss

          await provider.waitForTransaction(transactionHash)

          get()[sliceKey].setStateByKey('withdrawTransaction', {
            transactionStatus: 'success',
            transaction: scanTxPath(networks[chainId], transactionHash),
            errorMessage: '',
          })
          dismissNotificationHandler()

          // invalidate user balances query
          invalidateScrvUsdUserBalances({ userAddress: useWallet.getState().wallet?.address })

          get()[sliceKey].setStakingModuleChangeReset()

          const successNotificationMessage = t`Succesfully withdrew ${amount} scrvUSD!`
          notify(successNotificationMessage, 'success', 15000)
        } catch (error) {
          dismissNotificationHandler()
          get()[sliceKey].setStateByKey('withdrawTransaction', {
            transactionStatus: 'error',
            transaction: null,
            errorMessage: error.message,
          })
          console.warn(error)
        }
      },
    },
    fetchExchangeRate: async () => {
      const lendApi = getLib('llamaApi')
      if (!lendApi) return

      get()[sliceKey].setStateByKey('scrvUsdExchangeRate', { fetchStatus: 'loading', value: '' })

      try {
        const response = await lendApi.st_crvUSD.convertToShares(1)

        get()[sliceKey].setStateByKey('scrvUsdExchangeRate', { fetchStatus: 'success', value: response })
      } catch (error) {
        console.error(error)
        get()[sliceKey].setStateByKey('scrvUsdExchangeRate', { fetchStatus: 'error', value: '' })
      }
    },
    fetchCrvUsdSupplies: async () => {
      const lendApi = getLib('llamaApi')
      if (!lendApi) return

      get()[sliceKey].setStateByKey('crvUsdSupplies', { fetchStatus: 'loading', crvUSD: '', scrvUSD: '' })

      try {
        const response = await lendApi.st_crvUSD.totalSupplyAndCrvUSDLocked()

        get()[sliceKey].setStateByKey('crvUsdSupplies', {
          fetchStatus: 'success',
          crvUSD: response.crvUSD,
          scrvUSD: response.st_crvUSD,
        })
      } catch (error) {
        console.error(error)
        get()[sliceKey].setStateByKey('crvUsdSupplies', { fetchStatus: 'error', crvUSD: '', scrvUSD: '' })
      }
    },
    previewAction: async (flag: PreviewFlag, amount: string) => {
      const signerAddress = useWallet.getState().wallet?.address.toLowerCase()
      get()[sliceKey].setStateByKey('preview', { fetchStatus: 'loading', value: '0' })

      const lendApi = getLib('llamaApi')
      if (!lendApi || !signerAddress) return

      const userBalance: ScrvUsdUserBalances = queryClient.getQueryData([
        'useScrvUsdUserBalances',
        { userAddress: signerAddress },
      ]) ?? { crvUSD: '0', scrvUSD: '0' }

      try {
        let response
        if (flag === 'deposit') {
          response = await lendApi.st_crvUSD.previewDeposit(amount)
        } else if (amount === userBalance.scrvUSD) {
          response = await lendApi.st_crvUSD.previewRedeem(amount)
        } else {
          response = await lendApi.st_crvUSD.previewRedeem(amount)
        }

        get()[sliceKey].setStateByKey('preview', { fetchStatus: 'success', value: response })
      } catch (error) {
        console.error(error)
        get()[sliceKey].setStateByKey('preview', { fetchStatus: 'error', value: '0' })
      }
    },
    setStakingModule: (stakingModule: DepositWithdrawModule) => {
      get()[sliceKey].setStateByKey('stakingModule', stakingModule)
      get()[sliceKey].setStakingModuleChangeReset()
    },
    setSelectedStatisticsChart: (chart: StatisticsChart) => {
      get()[sliceKey].setStateByKey('selectedStatisticsChart', chart)
    },
    setRevenueChartTimeOption: (timeOption: TimeOption) => {
      get()[sliceKey].setStateByKey('revenueChartTimeOption', timeOption)
    },
    setInputAmount: (amount: string) => {
      if (!amount) {
        get()[sliceKey].setStateByKey('inputAmount', '0')
        return
      }

      get()[sliceKey].setStateByKey('inputAmount', amount)
    },
    setApproveInfinite: () => {
      get()[sliceKey].setStateByKey('approveInfinite', !get()[sliceKey].approveInfinite)
    },
    setPreviewReset: () => {
      get()[sliceKey].setStateByKey('preview', { fetchStatus: '', value: '0' })
    },
    setStakingModuleChangeReset: () => {
      get()[sliceKey].setStateByKey('inputAmount', '0')
      get()[sliceKey].setPreviewReset()
    },
    setTransactionsReset: () => {
      get()[sliceKey].setStateByKey('depositTransaction', {
        transactionStatus: '',
        transaction: null,
        errorMessage: '',
      })
      get()[sliceKey].setStateByKey('approveDepositTransaction', {
        transactionStatus: '',
        transaction: null,
        errorMessage: '',
      })
      get()[sliceKey].setStateByKey('withdrawTransaction', {
        transactionStatus: '',
        transaction: null,
        errorMessage: '',
      })
    },
    getInputAmountApproved: () => {
      const allowance = get()[sliceKey].depositApproval.allowance ?? '0'
      const inputAmount = get()[sliceKey].inputAmount

      return new BigNumber(allowance).isGreaterThanOrEqualTo(inputAmount)
    },
    getEstimateGas: (userAddress: string) => {
      const stakingModule = get()[sliceKey].stakingModule
      const getInputAmountApproved = get()[sliceKey].getInputAmountApproved()
      const gas = get()[sliceKey].estGas.gas
      const userBalance: ScrvUsdUserBalances = queryClient.getQueryData([
        'useScrvUsdUserBalances',
        { userAddress: userAddress.toLowerCase() },
      ]) ?? { crvUSD: '0', scrvUSD: '0' }

      if (!getInputAmountApproved && stakingModule === 'deposit') {
        if (new BigNumber(userBalance.crvUSD).isGreaterThan('0')) {
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
    setStateByKeys: (sliceState: Partial<SliceState>) => {
      get().setAppStateByKeys(sliceKey, sliceState)
    },
    resetState: () => {
      get().resetAppState(sliceKey, lodash.cloneDeep(DEFAULT_STATE))
    },
  },
})
