import type { DepositWithdrawModule } from '@/loan/components/PageCrvUsdStaking/types'
import type { PricesYieldData, PricesYieldDataResponse, Provider } from '@/loan/store/types'
import type { GetState, SetState } from 'zustand'
import type { State } from '@/loan/store/useStore'
import BigNumber from 'bignumber.js'
import { t } from '@ui-kit/lib/i18n'
import { SCRVUSD_GAS_ESTIMATE } from '@/loan/constants'
import networks from '@/loan/networks'
import { Contract } from 'ethers'
import cloneDeep from 'lodash/cloneDeep'
import { FetchStatus, TransactionStatus } from '@/loan/types/loan.types'
import { notify, useWallet } from '@ui-kit/features/connect-wallet'

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
  inputAmount: string
  crvUsdExchangeRate: {
    fetchStatus: FetchStatus
    value: string
  }
  crvUsdSupplies: {
    fetchStatus: FetchStatus
    crvUSD: string
    scrvUSD: string
  }
  approveInfinite: boolean
  approveDepositTransaction: {
    transactionStatus: TransactionStatus
    transaction: string | null
    errorMessage: string
  }
  depositTransaction: {
    transactionStatus: TransactionStatus
    transaction: string | null
    errorMessage: string
  }
  withdrawTransaction: {
    transactionStatus: TransactionStatus
    transaction: string | null
    errorMessage: string
  }
  pricesYieldData: {
    fetchStatus: FetchStatus
    data: PricesYieldData | null
  }
}

type PreviewFlag = 'deposit' | 'withdraw' | 'redeem'

const sliceKey = 'scrvusd'

export type ScrvUsdSlice = {
  [sliceKey]: SliceState & {
    checkApproval: {
      depositApprove: (amount: string) => Promise<void>
    }
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
    fetchUserBalances: () => void
    fetchExchangeRate: () => void
    fetchCrvUsdSupplies: () => void
    fetchSavingsYield: (provider?: Provider | null) => void
    setMax: (userAddress: string, stakingModule: DepositWithdrawModule) => void
    setStakingModule: (stakingModule: DepositWithdrawModule) => void
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
  inputAmount: '0',
  preview: {
    fetchStatus: '',
    value: '0',
  },
  crvUsdExchangeRate: {
    fetchStatus: 'loading',
    value: '',
  },
  crvUsdSupplies: {
    fetchStatus: 'loading',
    crvUSD: '',
    scrvUSD: '',
  },
  approveInfinite: false,
  approveDepositTransaction: {
    transactionStatus: '',
    transaction: null,
    errorMessage: '',
  },
  depositTransaction: {
    transactionStatus: '',
    transaction: null,
    errorMessage: '',
  },
  withdrawTransaction: {
    transactionStatus: '',
    transaction: null,
    errorMessage: '',
  },
  pricesYieldData: {
    fetchStatus: 'loading',
    data: null,
  },
}

const VAULT_ADDRESS = '0x0655977FEb2f289A4aB78af67BAB0d17aAb84367'
const YEAR = 86400 * 365.25 * 100
const VAULT_ABI = [
  {
    stateMutability: 'view',
    type: 'function',
    name: 'profitUnlockingRate',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'totalSupply',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
]

/**
 * Fetches the savings yield data from the Curve API.
 * If a provider is provided, the data is fetched from the vault contract directly.
 * That provides more accurate data and works even if our servers are down.
 */
async function _fetchSavingsYield(provider?: Provider | null): Promise<PricesYieldDataResponse> {
  if (provider) {
    const vault = new Contract(VAULT_ADDRESS, VAULT_ABI, provider)
    const [unlock_amount, supply, block] = await Promise.all([
      vault.profitUnlockingRate(),
      vault.totalSupply(),
      provider.getBlock('latest'),
    ])

    const unlockAmountNum = Number(unlock_amount)
    const supplyNum = Number(supply)

    return {
      last_updated: new Date(block?.timestamp ?? 0).toISOString(),
      last_updated_block: block?.number ?? 0,
      proj_apr: supplyNum > 0 ? (unlockAmountNum * 1e-12 * YEAR) / supplyNum : 0,
      supply: supplyNum / 1e18,
    }
  }

  const response = await fetch(`https://prices.curve.fi/v1/crvusd/savings/statistics`)
  return await response.json()
}

const createScrvUsdSlice = (set: SetState<State>, get: GetState<State>) => ({
  [sliceKey]: {
    ...DEFAULT_STATE,
    checkApproval: {
      depositApprove: async (amount: string) => {
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
      depositApprove: async (amount: string) => {
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
      deposit: async (amount: string) => {
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
      withdraw: async (amount: string) => {
        get()[sliceKey].setStateByKey('estGas', { gas: 0, fetchStatus: 'loading' })

        const lendApi = get().lendApi
        const curve = get().curve
        const fetchGasInfo = get().gas.fetchGasInfo

        if (!curve) return

        await fetchGasInfo(curve)

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

        const lendApi = get().lendApi
        const curve = get().curve
        const fetchGasInfo = get().gas.fetchGasInfo

        if (!curve) return

        await fetchGasInfo(curve)

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
        const lendApi = get().lendApi
        const curve = get().curve
        const { provider } = useWallet.getState()
        const approveInfinite = get()[sliceKey].approveInfinite

        // TODO: check so curve always is set when approving
        if (!lendApi || !curve || !provider) return

        const chainId = curve.chainId

        const fetchGasInfo = get().gas.fetchGasInfo
        let dismissNotificationHandler = notify(t`Please confirm to approve ${amount} crvUSD.`, 'pending').dismiss
        await fetchGasInfo(curve)

        get()[sliceKey].setStateByKey('approveDepositTransaction', {
          transactionStatus: 'confirming',
          transaction: null,
          errorMessage: '',
        })

        try {
          const transactionHash = await lendApi.st_crvUSD.depositApprove(amount, approveInfinite)

          get()[sliceKey].setStateByKey('approveDepositTransaction', {
            transactionStatus: 'loading',
            transaction: networks[chainId].scanTxPath(transactionHash[0]),
            errorMessage: '',
          })
          dismissNotificationHandler()

          dismissNotificationHandler = notify(t`Approving ${amount} crvUSD...`, 'pending').dismiss

          await provider.waitForTransaction(transactionHash[0])

          get()[sliceKey].setStateByKey('approveDepositTransaction', {
            transactionStatus: 'success',
            transaction: networks[chainId].scanTxPath(transactionHash[0]),
            errorMessage: '',
          })
          dismissNotificationHandler()
          get()[sliceKey].checkApproval.depositApprove(amount)

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
          console.log(error)
          return false
        }
      },
      deposit: async (amount: string) => {
        const lendApi = get().lendApi
        const curve = get().curve
        const { provider } = useWallet.getState()

        if (!lendApi || !curve || !provider) return

        const chainId = curve.chainId

        const fetchGasInfo = get().gas.fetchGasInfo

        let dismissNotificationHandler = notify(t`Please confirm to deposit ${amount} crvUSD.`, 'pending').dismiss
        await fetchGasInfo(curve)

        get()[sliceKey].setStateByKey('depositTransaction', {
          transactionStatus: 'confirming',
          transaction: null,
          errorMessage: '',
        })

        try {
          const transactionHash = await lendApi.st_crvUSD.deposit(amount)

          get()[sliceKey].setStateByKey('depositTransaction', {
            transactionStatus: 'loading',
            transaction: networks[chainId].scanTxPath(transactionHash),
            errorMessage: '',
          })
          dismissNotificationHandler()

          dismissNotificationHandler = notify(t`Depositing ${amount} crvUSD...`, 'pending').dismiss

          await provider.waitForTransaction(transactionHash)

          get()[sliceKey].setStateByKey('depositTransaction', {
            transactionStatus: 'success',
            transaction: networks[chainId].scanTxPath(transactionHash),
            errorMessage: '',
          })
          dismissNotificationHandler()
          get()[sliceKey].fetchUserBalances()
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
          console.log(error)
        }
      },
      withdraw: async (amount: string) => {
        const lendApi = get().lendApi
        const curve = get().curve
        const { provider } = useWallet.getState()

        if (!lendApi || !curve || !provider) return

        const chainId = curve.chainId

        const fetchGasInfo = get().gas.fetchGasInfo
        let dismissNotificationHandler = notify(t`Please confirm to withdraw ${amount} scrvUSD.`, 'pending').dismiss
        await fetchGasInfo(curve)

        get()[sliceKey].setStateByKey('withdrawTransaction', {
          transactionStatus: 'confirming',
          transaction: null,
          errorMessage: '',
        })

        try {
          const transactionHash = await lendApi.st_crvUSD.withdraw(amount)

          get()[sliceKey].setStateByKey('withdrawTransaction', {
            transactionStatus: 'loading',
            transaction: networks[chainId].scanTxPath(transactionHash),
            errorMessage: '',
          })
          dismissNotificationHandler()

          const deployingNotificationMessage = t`Withdrawing ${amount} scrvUSD...`
          dismissNotificationHandler = notify(deployingNotificationMessage, 'pending').dismiss

          await provider.waitForTransaction(transactionHash)

          get()[sliceKey].setStateByKey('withdrawTransaction', {
            transactionStatus: 'success',
            transaction: networks[chainId].scanTxPath(transactionHash),
            errorMessage: '',
          })
          dismissNotificationHandler()
          get()[sliceKey].fetchUserBalances()
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
          console.log(error)
        }
      },
      redeem: async (amount: string) => {
        const lendApi = get().lendApi
        const curve = get().curve
        const { provider } = useWallet.getState()

        if (!lendApi || !curve || !provider) return

        const chainId = curve.chainId

        const fetchGasInfo = get().gas.fetchGasInfo

        let dismissNotificationHandler = notify(t`Please confirm to withdraw ${amount} scrvUSD.`, 'pending').dismiss
        await fetchGasInfo(curve)

        get()[sliceKey].setStateByKey('withdrawTransaction', {
          transactionStatus: 'confirming',
          transaction: null,
          errorMessage: '',
        })

        try {
          console.log('redeem', amount)

          const transactionHash = await lendApi.st_crvUSD.redeem(amount)

          get()[sliceKey].setStateByKey('withdrawTransaction', {
            transactionStatus: 'loading',
            transaction: networks[chainId].scanTxPath(transactionHash),
            errorMessage: '',
          })
          dismissNotificationHandler()

          dismissNotificationHandler = notify(t`Withdrawing ${amount} scrvUSD...`, 'pending').dismiss

          await provider.waitForTransaction(transactionHash)

          get()[sliceKey].setStateByKey('withdrawTransaction', {
            transactionStatus: 'success',
            transaction: networks[chainId].scanTxPath(transactionHash),
            errorMessage: '',
          })
          dismissNotificationHandler()
          get()[sliceKey].fetchUserBalances()
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
          console.log(error)
        }
      },
    },
    fetchExchangeRate: async () => {
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
    fetchCrvUsdSupplies: async () => {
      const lendApi = get().lendApi

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
    fetchSavingsYield: async (provider?: Provider | null) => {
      get()[sliceKey].setStateByKey('pricesYieldData', { fetchStatus: 'loading', data: null })

      try {
        const data = await _fetchSavingsYield(provider)
        get()[sliceKey].setStateByKey('pricesYieldData', { fetchStatus: 'success', data })
      } catch (error) {
        console.error(error)
        get()[sliceKey].setStateByKey('pricesYieldData', { fetchStatus: 'error', data: null })
      }
    },
    previewAction: async (flag: PreviewFlag, amount: string) => {
      const signerAddress = useWallet.getState().wallet?.accounts?.[0]?.address.toLowerCase()
      get()[sliceKey].setStateByKey('preview', { fetchStatus: 'loading', value: '0' })

      const lendApi = get().lendApi

      if (!lendApi || !signerAddress) return

      const userBalance = get()[sliceKey].userBalances[signerAddress] ?? { crvUSD: '0', scrvUSD: '0' }

      try {
        let response = ''

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
    fetchUserBalances: async () => {
      const signerAddress = useWallet.getState().wallet?.accounts?.[0]?.address.toLowerCase()
      const lendApi = get().lendApi

      if (!lendApi || !signerAddress) return

      try {
        get()[sliceKey].setStateByKey('userBalances', { [signerAddress]: { fetchStatus: 'loading' } })

        const response = await lendApi.st_crvUSD.userBalances(signerAddress)

        const balances = {
          crvUSD: response.crvUSD === '0.0' ? '0' : response.crvUSD,
          scrvUSD: response.st_crvUSD === '0.0' ? '0' : response.st_crvUSD,
        }

        get()[sliceKey].setStateByKey('userBalances', { [signerAddress]: { fetchStatus: 'success', ...balances } })
      } catch (error) {
        console.error(error)
        get()[sliceKey].setStateByKey('userBalances', {
          [signerAddress]: { crvUSD: '', scrvUSD: '', fetchStatus: 'error' },
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

        get()[sliceKey].setStateByKey('inputAmount', crvUsdBalance)
      } else {
        const scrvUsdBalance = get()[sliceKey].userBalances[userAddress].scrvUSD

        get()[sliceKey].setStateByKey('inputAmount', scrvUsdBalance)
      }
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
      const userBalance = get()[sliceKey].userBalances[userAddress]?.crvUSD ?? '0'

      if (!getInputAmountApproved && stakingModule === 'deposit') {
        if (new BigNumber(userBalance).isGreaterThan('0')) {
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
