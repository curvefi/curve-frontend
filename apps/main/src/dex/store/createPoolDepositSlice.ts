import type { GetState, SetState } from 'zustand'
import type { State } from '@/dex/store/useStore'
import type { Amount } from '@/dex/components/PagePool/utils'
import { getAmountsError, parseAmountsForAPI } from '@/dex/components/PagePool/utils'
import type { EstimatedGas as FormEstGas, Slippage } from '@/dex/components/PagePool/types'
import type {
  FormLpTokenExpected,
  FormStatus,
  FormType,
  FormValues,
  LoadMaxAmount,
} from '@/dex/components/PagePool/Deposit/types'

import { t } from '@ui-kit/lib/i18n'
import cloneDeep from 'lodash/cloneDeep'

import {
  DEFAULT_FORM_LP_TOKEN_EXPECTED,
  DEFAULT_FORM_STATUS,
  DEFAULT_FORM_VALUES,
} from '@/dex/components/PagePool/Deposit/utils'
import { DEFAULT_ESTIMATED_GAS, DEFAULT_SLIPPAGE } from '@/dex/components/PagePool'
import { NETWORK_TOKEN } from '@/dex/constants'
import { getMaxAmountMinusGas } from '@/dex/utils/utilsGasPrices'
import { isBonus, isHighSlippage } from '@/dex/utils'
import { getUserPoolActiveKey } from '@/dex/store/createUserSlice'
import curvejsApi from '@/dex/lib/curvejs'
import {
  Balances,
  ChainId,
  CurveApi,
  FnStepApproveResponse,
  FnStepEstGasApprovalResponse,
  FnStepResponse,
  Pool,
  PoolData,
} from '@/dex/types/main.types'
import { setMissingProvider, useWallet } from '@ui-kit/features/connect-wallet'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  activeKey: string
  poolAddress: string
  formEstGas: { [activeKey: string]: FormEstGas }
  formLpTokenExpected: { [activeKey: string]: FormLpTokenExpected }
  formType: FormType
  formStatus: FormStatus
  formValues: FormValues
  maxLoading: number | null
  slippage: { [activeKey: string]: Slippage }
}

const sliceKey = 'poolDeposit'

// prettier-ignore
export type PoolDepositSlice = {
  [sliceKey]: SliceState & {
    fetchUserPoolWalletBalances(curve: CurveApi, poolId: string): Promise<Balances>
    fetchExpected(activeKey: string, chainId: ChainId, formType: FormType, pool: Pool, formValues: FormValues): Promise<void>
    fetchMaxAmount(activeKey: string, chainId: ChainId, pool: Pool, loadMaxAmount: LoadMaxAmount): Promise<Amount[]>
    fetchSeedAmount(poolData: PoolData, formValues: FormValues): Promise<Pick<FormValues, 'amounts' | 'isWrapped'>>
    fetchSlippage(activeKey: string, chainId: ChainId, formType: FormType, pool: Pool, formValues: FormValues, maxSlippage: string): Promise<void>
    setFormValues(formType: FormType, curve: CurveApi | null, poolId: string, poolData: PoolData | undefined, formValues: Partial<FormValues>, loadMaxAmount: LoadMaxAmount | null, isSeed: boolean | null, maxSlippage: string): Promise<void>

    // steps
    fetchEstGasApproval(activeKey: string, chainId: ChainId, formType: FormType, pool: Pool): Promise<FnStepEstGasApprovalResponse>
    fetchStepApprove(activeKey: string, curve: CurveApi, formType: FormType, pool: Pool, formValues: FormValues): Promise<FnStepApproveResponse | undefined>
    fetchStepDeposit(activeKey: string, curve: CurveApi, poolData: PoolData, formValues: FormValues, maxSlippage: string): Promise<FnStepResponse | undefined>
    fetchStepDepositStake(activeKey: string, curve: CurveApi, poolData: PoolData, formValues: FormValues, maxSlippage: string): Promise<FnStepResponse | undefined>
    fetchStepStakeApprove(activeKey: string, curve: CurveApi, formType: FormType, pool: Pool, formValues: FormValues): Promise<FnStepApproveResponse | undefined>
    fetchStepStake(activeKey: string, curve: CurveApi, poolData: PoolData, formValues: FormValues): Promise<FnStepResponse | undefined>

    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(poolData: PoolData, formType: FormType): void
  }
}

const DEFAULT_STATE: SliceState = {
  activeKey: '',
  poolAddress: '',
  formEstGas: {},
  formLpTokenExpected: {},
  formType: 'DEPOSIT',
  formStatus: DEFAULT_FORM_STATUS,
  formValues: DEFAULT_FORM_VALUES,
  maxLoading: null,
  slippage: {},
}

const createPoolDepositSlice = (set: SetState<State>, get: GetState<State>): PoolDepositSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    fetchUserPoolWalletBalances: async (curve, poolId) => {
      const userPoolActiveKey = getUserPoolActiveKey(curve, poolId)
      return get().user.walletBalances[userPoolActiveKey] ?? (await get().user.fetchUserPoolInfo(curve, poolId, true))
    },
    fetchExpected: async (activeKey, chainId, formType, pool, formValues) => {
      let { amounts, isWrapped } = formValues
      const depositExpectedFn =
        formType === 'DEPOSIT' ? curvejsApi.poolDeposit.depositExpected : curvejsApi.poolDeposit.depositAndStakeExpected

      const [fetchedExpected, fetchedParameters] = await Promise.all([
        depositExpectedFn(activeKey, pool, isWrapped, parseAmountsForAPI(amounts)),
        curvejsApi.pool.poolParameters(pool),
      ])

      get()[sliceKey].setStateByKey('formLpTokenExpected', {
        [activeKey]: {
          ...fetchedExpected,
          loading: false,
          virtualPrice: fetchedParameters.parameters.virtualPrice,
        },
      })
    },
    fetchMaxAmount: async (activeKey, chainId, pool, { tokenAddress, idx }) => {
      let cFormValues = cloneDeep(get()[sliceKey].formValues)
      const userBalance = get().userBalances.userBalancesMapper[tokenAddress] ?? ''

      if (tokenAddress.toLowerCase() === NETWORK_TOKEN) {
        // set loading
        cFormValues.amounts[idx].value = ''
        get()[sliceKey].setStateByKeys({
          formValues: cloneDeep(cFormValues),
          maxLoading: idx,
        })

        // fetch est gas
        cFormValues.amounts[idx].value = userBalance
        const resp = await curvejsApi.poolDeposit.depositEstGasApproval(
          activeKey,
          chainId,
          pool,
          cFormValues.isWrapped,
          parseAmountsForAPI(cFormValues.amounts),
        )
        const basePlusPriority = get().gas.gasInfo?.basePlusPriority

        if (!resp.error && resp.estimatedGas && basePlusPriority?.[0]) {
          cFormValues.amounts[idx].value = getMaxAmountMinusGas(resp.estimatedGas, basePlusPriority[0], userBalance)
          return cFormValues.amounts
        } else {
          console.error('unable to get est gas value')
        }
      }
      cFormValues.amounts[idx].value = userBalance
      return cFormValues.amounts
    },
    fetchSeedAmount: async (poolData, formValues) => {
      const { hasWrapped, pool } = poolData
      const { underlyingCoins, underlyingCoinAddresses, wrappedCoins, wrappedCoinAddresses } = pool

      const firstAmount = formValues.amounts[0].value
      const haveFirstAmount = Number(firstAmount) > 0
      const tokens = hasWrapped ? wrappedCoins : underlyingCoins
      const tokenAddresses = hasWrapped ? wrappedCoinAddresses : underlyingCoinAddresses

      try {
        const seedAmounts = haveFirstAmount ? await pool.getSeedAmounts(firstAmount, !hasWrapped) : null
        return {
          amounts: tokens.map((token, idx) => ({
            token,
            tokenAddress: tokenAddresses[idx],
            value: seedAmounts?.[idx] || '',
          })),
          isWrapped: hasWrapped,
        }
      } catch (error) {
        console.error('Api error getSeedAmounts', error)

        return {
          amounts: tokens.map((token, idx) => {
            const value = idx === 0 ? formValues.amounts[idx].value : ''
            return { token, tokenAddress: tokenAddresses[idx], value }
          }),
          isWrapped: hasWrapped,
        }
      }
    },
    fetchSlippage: async (activeKey, chainId, formType, pool, formValues, maxSlippage) => {
      let { amounts: cFormAmounts, isWrapped } = formValues
      const amounts = parseAmountsForAPI(cFormAmounts)
      const resp =
        formType === 'DEPOSIT'
          ? await curvejsApi.poolDeposit.depositBonus(activeKey, pool, isWrapped, amounts)
          : await curvejsApi.poolDeposit.depositAndStakeBonus(activeKey, pool, isWrapped, amounts)

      if (resp.error) {
        get()[sliceKey].setStateByKeys({
          formStatus: {
            ...cloneDeep(DEFAULT_FORM_STATUS),
            isApproved: get()[sliceKey].formStatus.isApproved,
            error: resp.error,
          },
          slippage: { [activeKey]: cloneDeep(DEFAULT_SLIPPAGE) },
        })
      } else {
        get()[sliceKey].setStateByKey('slippage', {
          [resp.activeKey]: {
            ...DEFAULT_SLIPPAGE,
            loading: false,
            slippage: Math.abs(+resp.bonus),
            isHighSlippage: isHighSlippage(+resp.bonus, maxSlippage),
            isBonus: isBonus(+resp.bonus),
          },
        })
      }
    },
    setFormValues: async (formType, curve, poolId, poolData, updatedFormValues, loadMaxAmount, isSeed, maxSlippage) => {
      // stored values
      const storedActiveKey = get()[sliceKey].activeKey
      const storedFormValues = get()[sliceKey].formValues
      const storedFormStatus = get()[sliceKey].formStatus

      // update form values, form status, activeKey
      let cFormValues = cloneDeep({ ...storedFormValues, ...updatedFormValues })
      let activeKey = getActiveKey(poolId, formType, cFormValues, maxSlippage)
      get()[sliceKey].setStateByKeys({
        activeKey,
        formStatus: { ...DEFAULT_FORM_STATUS, isApproved: storedFormStatus.isApproved },
        formValues: cloneDeep(cFormValues),
      })

      if (!curve || !poolData || isSeed === null || cFormValues.isWrapped === null) return

      const { chainId, signerAddress } = curve
      const { pool } = poolData

      if (formType === 'DEPOSIT' || formType === 'DEPOSIT_STAKE') {
        // max amount
        if (loadMaxAmount) {
          cFormValues.amounts = await get()[sliceKey].fetchMaxAmount(activeKey, chainId, pool, loadMaxAmount)
          activeKey = getActiveKey(pool.id, formType, cFormValues, maxSlippage)
          get()[sliceKey].setStateByKeys({
            activeKey,
            formValues: cloneDeep(cFormValues),
            maxLoading: null,
          })
        } else if (cFormValues.isBalancedAmounts) {
          // get balanced amounts
          const resp = await curvejsApi.poolDeposit.depositBalancedAmounts(activeKey, pool, cFormValues.isWrapped)

          if (resp.error) {
            get()[sliceKey].setStateByKey('formStatus', {
              ...get()[sliceKey].formStatus,
              error: resp.error,
            })
          } else {
            cFormValues.amounts = get().pools.poolsMapper[chainId][poolId].tokenAddresses.map((address, idx) => ({
              value: resp.amounts[idx],
              token: poolData.tokens[idx],
              tokenAddress: address,
            }))
            activeKey = getActiveKey(pool.id, formType, cFormValues, maxSlippage)
            get()[sliceKey].setStateByKeys({ activeKey, formValues: cloneDeep(cFormValues) })
          }
        }

        // update amounts input based on options (Seed, MaxAmount, BalancedAmounts)
        if (isSeed) {
          // get seed amounts
          const { amounts, isWrapped } = await get()[sliceKey].fetchSeedAmount(poolData, cFormValues)
          cFormValues.amounts = amounts
          cFormValues.isWrapped = isWrapped
          activeKey = getActiveKey(pool.id, formType, cFormValues, maxSlippage)
          get()[sliceKey].setStateByKeys({ activeKey, formValues: cloneDeep(cFormValues) })
        }

        if (cFormValues.amounts.some((a) => +a.value > 0)) {
          // fetch expected LP Tokens
          get()[sliceKey].setStateByActiveKey('formLpTokenExpected', activeKey, {
            ...(get()[sliceKey].formLpTokenExpected[storedActiveKey] ?? DEFAULT_FORM_LP_TOKEN_EXPECTED),
            loading: true,
          })
          get()[sliceKey].fetchExpected(activeKey, chainId, formType, pool, cFormValues)

          if (!isSeed) {
            // fetch slippage
            get()[sliceKey].setStateByActiveKey('slippage', activeKey, {
              ...(get()[sliceKey].slippage[storedActiveKey] ?? DEFAULT_SLIPPAGE),
              loading: true,
            })
            get()[sliceKey].fetchSlippage(activeKey, chainId, formType, pool, cFormValues, maxSlippage)
          }

          if (!!signerAddress) {
            // validate input amounts with wallet
            const balances = await get()[sliceKey].fetchUserPoolWalletBalances(curve, pool.id)
            const amountsError = getAmountsError(cFormValues.amounts, balances)

            if (amountsError) {
              get()[sliceKey].setStateByKey('formStatus', {
                ...get()[sliceKey].formStatus,
                error: t`Not enough balance for ${amountsError}.`,
              })
            } else {
              // get est gas and approval
              get()[sliceKey].setStateByActiveKey('formEstGas', activeKey, {
                ...(get()[sliceKey].formEstGas[storedActiveKey] ?? DEFAULT_ESTIMATED_GAS),
                loading: true,
              })
              get()[sliceKey].fetchEstGasApproval(activeKey, chainId, formType, pool)
            }
          }
        }
      } else if (formType === 'STAKE') {
        if (!!signerAddress && +cFormValues.lpToken > 0) {
          // validate lpToken balances
          const balances = await get()[sliceKey].fetchUserPoolWalletBalances(curve, pool.id)
          const lpTokenError = +cFormValues.lpToken > +(balances.lpToken ?? '0') ? 'lpToken-too-much' : ''

          if (lpTokenError) {
            get()[sliceKey].setStateByKey('formStatus', {
              ...cloneDeep(get()[sliceKey].formStatus),
              error: lpTokenError,
            })
          } else {
            // get est gas and approval
            get()[sliceKey].setStateByActiveKey('formEstGas', activeKey, {
              ...(get()[sliceKey].formEstGas[storedActiveKey] ?? DEFAULT_ESTIMATED_GAS),
              loading: true,
            })
            get()[sliceKey].fetchEstGasApproval(activeKey, chainId, formType, pool)
          }
        }
      }
    },

    // steps
    fetchEstGasApproval: async (activeKey, chainId, formType, pool) => {
      const cFormValues = cloneDeep(get()[sliceKey].formValues)
      const { amounts, isWrapped, lpToken } = cFormValues
      const resp =
        formType === 'DEPOSIT'
          ? await curvejsApi.poolDeposit.depositEstGasApproval(
              activeKey,
              chainId,
              pool,
              isWrapped,
              parseAmountsForAPI(amounts),
            )
          : formType === 'DEPOSIT_STAKE'
            ? await curvejsApi.poolDeposit.depositAndStakeEstGasApproval(
                activeKey,
                chainId,
                pool,
                isWrapped,
                parseAmountsForAPI(amounts),
              )
            : await curvejsApi.poolDeposit.stakeEstGasApproval(activeKey, chainId, pool, lpToken)

      // set estimate gas state
      get()[sliceKey].setStateByActiveKey('formEstGas', activeKey, {
        estimatedGas: resp.estimatedGas,
        loading: false,
      })

      // set form status
      const storedFormStatus = get()[sliceKey].formStatus
      if (!storedFormStatus.formProcessing) {
        get()[sliceKey].setStateByKey('formStatus', {
          ...storedFormStatus,
          isApproved: resp.isApproved,
          error: storedFormStatus.error || resp.error,
        })
      }
      return resp
    },
    fetchStepApprove: async (activeKey, curve, formType, pool, formValues) => {
      const { provider } = useWallet.getState()
      if (!provider) return setMissingProvider(get()[sliceKey])

      get()[sliceKey].setStateByKey('formStatus', {
        ...get()[sliceKey].formStatus,
        formProcessing: true,
        step: 'APPROVAL',
      })
      await get().gas.fetchGasInfo(curve)
      const { chainId } = curve
      const { amounts, isWrapped } = formValues
      const approveFn =
        formType === 'DEPOSIT' ? curvejsApi.poolDeposit.depositApprove : curvejsApi.poolDeposit.depositAndStakeApprove
      const resp = await approveFn(activeKey, provider, pool, isWrapped, parseAmountsForAPI(amounts))
      if (resp.activeKey === get()[sliceKey].activeKey) {
        const cFormStatus = cloneDeep(get()[sliceKey].formStatus)
        cFormStatus.formProcessing = false
        cFormStatus.step = ''
        cFormStatus.error = ''

        if (resp.error) {
          cFormStatus.error = resp.error
          get()[sliceKey].setStateByKey('formStatus', cFormStatus)
        } else {
          cFormStatus.formTypeCompleted = 'APPROVE'
          cFormStatus.isApproved = true
          get()[sliceKey].setStateByKey('formStatus', cFormStatus)

          // fetch est gas and approval
          await get()[sliceKey].fetchEstGasApproval(activeKey, chainId, formType, pool)
        }

        return resp
      }
    },
    fetchStepDeposit: async (activeKey, curve, poolData, formValues, maxSlippage) => {
      const { provider } = useWallet.getState()
      if (!provider) return setMissingProvider(get()[sliceKey])

      get()[sliceKey].setStateByKey('formStatus', {
        ...get()[sliceKey].formStatus,
        formProcessing: true,
        step: 'DEPOSIT',
      })

      await get().gas.fetchGasInfo(curve)
      const { pool } = poolData
      const { amounts, isWrapped } = formValues
      const resp = await curvejsApi.poolDeposit.deposit(
        activeKey,
        provider,
        pool,
        isWrapped,
        parseAmountsForAPI(amounts),
        maxSlippage,
      )

      if (resp.activeKey === get()[sliceKey].activeKey) {
        let cFormStatus = cloneDeep(get()[sliceKey].formStatus)
        cFormStatus.formProcessing = false
        cFormStatus.step = ''
        cFormStatus.error = ''

        if (resp.error) {
          cFormStatus.error = resp.error
          get()[sliceKey].setStateByKey('formStatus', cFormStatus)
        } else {
          cFormStatus.formTypeCompleted = 'DEPOSIT'
          get()[sliceKey].setStateByKeys({
            formStatus: cFormStatus,
            formValues: resetFormValues(formValues),
          })

          // re-fetch data
          await Promise.all([get().user.fetchUserPoolInfo(curve, pool.id), get().pools.fetchPoolStats(curve, poolData)])
        }

        return resp
      }
    },
    fetchStepDepositStake: async (activeKey, curve, poolData, formValues, maxSlippage) => {
      const { provider } = useWallet.getState()
      if (!provider) return setMissingProvider(get()[sliceKey])

      get()[sliceKey].setStateByKey('formStatus', {
        ...get()[sliceKey].formStatus,
        formProcessing: true,
        step: 'DEPOSIT_STAKE',
      })
      await get().gas.fetchGasInfo(curve)
      const { pool } = poolData
      const { amounts, isWrapped } = formValues
      const resp = await curvejsApi.poolDeposit.depositAndStake(
        activeKey,
        provider,
        pool,
        isWrapped,
        parseAmountsForAPI(amounts),
        maxSlippage,
      )
      if (resp.activeKey === get()[sliceKey].activeKey) {
        let cFormStatus = cloneDeep(get()[sliceKey].formStatus)
        cFormStatus.formProcessing = false
        cFormStatus.step = ''
        cFormStatus.error = ''

        if (resp.error) {
          cFormStatus.error = resp.error
          get()[sliceKey].setStateByKey('formStatus', cFormStatus)
        } else {
          cFormStatus.formTypeCompleted = 'DEPOSIT_STAKE'
          get()[sliceKey].setStateByKeys({
            formStatus: cFormStatus,
            formValues: resetFormValues(formValues),
          })

          // re-fetch data
          await Promise.all([get().user.fetchUserPoolInfo(curve, pool.id), get().pools.fetchPoolStats(curve, poolData)])
        }

        return resp
      }
    },
    fetchStepStakeApprove: async (activeKey, curve, formType, pool, formValues) => {
      const { provider } = useWallet.getState()
      if (!provider) return setMissingProvider(get()[sliceKey])

      get()[sliceKey].setStateByKey('formStatus', {
        ...get()[sliceKey].formStatus,
        formProcessing: true,
        step: 'APPROVAL',
      })
      await get().gas.fetchGasInfo(curve)
      const { chainId } = curve
      const { lpToken } = formValues
      const resp = await curvejsApi.poolDeposit.stakeApprove(activeKey, provider, pool, lpToken)
      if (resp.activeKey === get()[sliceKey].activeKey) {
        const cFormStatus = cloneDeep(get()[sliceKey].formStatus)
        cFormStatus.formProcessing = false
        cFormStatus.step = ''
        cFormStatus.error = ''

        if (resp.error) {
          cFormStatus.error = resp.error
          get()[sliceKey].setStateByKey('formStatus', cFormStatus)
        } else {
          cFormStatus.formTypeCompleted = 'APPROVE'
          cFormStatus.isApproved = true
          get()[sliceKey].setStateByKey('formStatus', cFormStatus)

          // fetch est gas and approval
          await get()[sliceKey].fetchEstGasApproval(activeKey, chainId, formType, pool)
        }

        return resp
      }
    },
    fetchStepStake: async (activeKey, curve, poolData, formValues) => {
      const { provider } = useWallet.getState()
      if (!provider) return setMissingProvider(get()[sliceKey])

      get()[sliceKey].setStateByKey('formStatus', {
        ...get()[sliceKey].formStatus,
        formProcessing: true,
        step: 'STAKE',
      })
      await get().gas.fetchGasInfo(curve)
      const { pool } = poolData
      const { lpToken } = formValues
      const resp = await curvejsApi.poolDeposit.stake(activeKey, provider, pool, lpToken)
      if (resp.activeKey === get()[sliceKey].activeKey) {
        let cFormStatus = cloneDeep(get()[sliceKey].formStatus)
        cFormStatus.formProcessing = false
        cFormStatus.step = ''
        cFormStatus.error = ''

        if (resp.error) {
          cFormStatus.error = resp.error
          get()[sliceKey].setStateByKey('formStatus', cFormStatus)
        } else {
          cFormStatus.formTypeCompleted = 'STAKE'
          get()[sliceKey].setStateByKeys({
            formStatus: cFormStatus,
            formValues: resetFormValues(formValues),
          })

          // re-fetch data
          await Promise.all([get().user.fetchUserPoolInfo(curve, pool.id), get().pools.fetchPoolStats(curve, poolData)])
        }

        return resp
      }
    },

    // slice helpers
    setStateByActiveKey: (key, activeKey, value) => {
      const foundKey = get()[sliceKey][key] as Object
      if (Object.keys(foundKey).length > 30) {
        get().setAppStateByKey(sliceKey, key, { [activeKey]: value })
      } else {
        get().setAppStateByActiveKey(sliceKey, key, activeKey, value)
      }
    },
    setStateByKey: (key, value) => {
      get().setAppStateByKey(sliceKey, key, value)
    },
    setStateByKeys: (sliceState) => {
      get().setAppStateByKeys(sliceKey, sliceState)
    },
    resetState: ({ tokens, tokenAddresses, isWrapped }, formType) => {
      get().resetAppState(sliceKey, {
        ...DEFAULT_STATE,
        formType: formType,
        formValues: {
          ...DEFAULT_FORM_VALUES,
          isWrapped,
          amounts: tokens.map((token, idx) => ({ token, tokenAddress: tokenAddresses[idx], value: '' })),
        },
      })
    },
  },
})

export function getActiveKey(
  poolId: string,
  formType: FormType,
  { amounts, isBalancedAmounts, isWrapped, lpToken }: FormValues,
  maxSlippage: string,
) {
  let activeKey = `${formType}-${poolId}-`
  if (formType === 'DEPOSIT' || formType === 'DEPOSIT_STAKE') {
    const amountsStr = amounts.map((a) => a.value).join('-')
    activeKey += `${amountsStr}-${isBalancedAmounts}-${isWrapped}-${maxSlippage}-${lpToken}`
  } else {
    activeKey += `${lpToken}`
  }
  return activeKey
}

function resetFormValues(formValues: FormValues) {
  return {
    ...cloneDeep(formValues),
    isBalancedAmounts: false,
    lpToken: '',
    amounts: formValues.amounts.map((a) => ({ ...a, value: '' })),
  }
}

export default createPoolDepositSlice
