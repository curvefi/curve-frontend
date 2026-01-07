import lodash from 'lodash'
import type { Config } from 'wagmi'
import { StoreApi } from 'zustand'
import type { LoadMaxAmount } from '@/dex/components/PagePool/Deposit/types'
import type { EstimatedGas as FormEstGas, Slippage } from '@/dex/components/PagePool/types'
import { type Amount, DEFAULT_SLIPPAGE } from '@/dex/components/PagePool/utils'
import { parseAmountsForAPI } from '@/dex/components/PagePool/utils'
import type { FormStatus, FormType, FormValues } from '@/dex/components/PagePool/Withdraw/types'
import { DEFAULT_FORM_STATUS, DEFAULT_FORM_VALUES } from '@/dex/components/PagePool/Withdraw/utils'
import curvejsApi from '@/dex/lib/curvejs'
import type { State } from '@/dex/store/useStore'
import {
  ChainId,
  CurveApi,
  FnStepApproveResponse,
  FnStepEstGasApprovalResponse,
  FnStepResponse,
  Pool,
  PoolData,
} from '@/dex/types/main.types'
import { isBonus, isHighSlippage } from '@/dex/utils'
import { useWallet } from '@ui-kit/features/connect-wallet'
import { shortenAddress } from '@ui-kit/utils'
import { setMissingProvider } from '@ui-kit/utils/store.util'
import { fetchPoolLpTokenBalance } from '../hooks/usePoolTokenDepositBalances'

type StateKey = keyof typeof DEFAULT_STATE
const { cloneDeep } = lodash

type SliceState = {
  activeKey: string
  formEstGas: { [activeKey: string]: FormEstGas }
  formType: FormType
  formStatus: FormStatus
  formValues: FormValues
  maxLoading: number | null
  slippage: { [activeKey: string]: Slippage }
}

const sliceKey = 'poolWithdraw'

type FetchWithdrawProps = {
  activeKey: string
  storedActiveKey: string
  config: Config
  curve: CurveApi
  formType: FormType
  poolData: PoolData
  formValues: FormValues
  maxSlippage: string
}

// prettier-ignore
export type PoolWithdrawSlice = {
  [sliceKey]: SliceState & {
    fetchWithdrawToken(props: FetchWithdrawProps): Promise<void>
    fetchWithdrawLpToken(props: FetchWithdrawProps): Promise<void>
    fetchWithdrawCustom(props: FetchWithdrawProps): Promise<void>
    fetchClaimable(activeKey: string, chainId: ChainId, pool: Pool): Promise<void>
    setFormValues(formType: FormType, config: Config, curve: CurveApi | null, poolId: string, poolData: PoolData | undefined, updatedFormValues: Partial<FormValues>, loadMaxAmount: LoadMaxAmount | null, isSeed: boolean | null, maxSlippage: string): Promise<void>

    // steps
    fetchEstGasApproval(activeKey: string, config: Config, curve: CurveApi, formType: FormType, pool: Pool, formValues: FormValues): Promise<FnStepEstGasApprovalResponse | undefined>
    fetchStepApprove(activeKey: string, config: Config, curve: CurveApi, formType: FormType, pool: Pool, formValues: FormValues): Promise<FnStepApproveResponse | undefined>
    fetchStepWithdraw(activeKey: string, config: Config, curve: CurveApi, poolData: PoolData, formValues: FormValues, maxSlippage: string): Promise<FnStepResponse | undefined>
    fetchStepUnstake(activeKey: string, config: Config, curve: CurveApi, poolData: PoolData, formValues: FormValues): Promise<FnStepResponse | undefined>
    fetchStepClaim(activeKey: string, config: Config, curve: CurveApi, poolData: PoolData): Promise<FnStepResponse | undefined>

    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(poolData: PoolData, formType: FormType): void
  }
}

const DEFAULT_STATE: SliceState = {
  activeKey: '',
  formEstGas: {},
  formType: 'WITHDRAW',
  formStatus: DEFAULT_FORM_STATUS,
  formValues: DEFAULT_FORM_VALUES,
  maxLoading: null,
  slippage: {},
}

const createPoolWithdrawSlice = (
  _: StoreApi<State>['setState'],
  get: StoreApi<State>['getState'],
): PoolWithdrawSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    fetchWithdrawToken: async (props) => {
      const { storedActiveKey, config, curve, formType, poolData, formValues, maxSlippage } = props
      let activeKey = props.activeKey
      const cFormValues = cloneDeep(formValues)
      const { pool } = poolData
      const { signerAddress } = curve

      //  get slippage and expected
      if (+cFormValues.lpToken > 0) {
        // set loading state
        cFormValues.amounts = cFormValues.amounts.map((a) => ({ ...a, value: '' }))
        get()[sliceKey].setStateByKeys({ formValues: cloneDeep(cFormValues) })
        get()[sliceKey].setStateByKey('slippage', {
          [activeKey]: {
            ...(get()[sliceKey].slippage[storedActiveKey] ?? DEFAULT_SLIPPAGE),
            loading: true,
          },
        })

        // update amounts in form value
        const resp = await curvejsApi.poolWithdraw.withdrawOneCoinBonusAndExpected(
          activeKey,
          pool,
          cFormValues.isWrapped,
          cFormValues.lpToken,
          cFormValues.selectedTokenAddress,
        )
        if (resp.activeKey === activeKey) {
          if (resp.error) {
            get()[sliceKey].setStateByKeys({
              slippage: { [activeKey]: { ...DEFAULT_SLIPPAGE, loading: false } },
              formStatus: {
                ...get()[sliceKey].formStatus,
                error: resp.error,
              },
            })
          } else {
            cFormValues.amounts = cFormValues.amounts.map((a) => ({
              ...a,
              value: a.tokenAddress === cFormValues.selectedTokenAddress ? resp.expected : '',
            }))
            activeKey = getActiveKey(pool.id, formType, cFormValues, maxSlippage)
            get()[sliceKey].setStateByKeys({ activeKey, formValues: cloneDeep(cFormValues) })
            get()[sliceKey].setStateByKey('slippage', {
              [activeKey]: {
                ...DEFAULT_SLIPPAGE,
                slippage: Math.abs(+resp.bonus),
                isHighSlippage: isHighSlippage(+resp.bonus, maxSlippage),
                isBonus: isBonus(+resp.bonus),
              },
            })
          }
        }
      }

      // get gas
      if (signerAddress) {
        void get()[sliceKey].fetchEstGasApproval(activeKey, config, curve, formType, pool, cFormValues)
      }
    },
    fetchWithdrawLpToken: async (props) => {
      const { storedActiveKey, config, curve, formType, poolData, formValues, maxSlippage } = props
      let activeKey = props.activeKey
      const cFormValues = cloneDeep(formValues)
      const { signerAddress } = curve
      const { pool } = poolData

      if (+cFormValues.lpToken > 0) {
        // set loading state
        get()[sliceKey].setStateByKey('slippage', {
          [activeKey]: {
            ...(get()[sliceKey].slippage[storedActiveKey] ?? DEFAULT_SLIPPAGE),
            loading: true,
          },
        })

        // get expected
        const resp = await curvejsApi.poolWithdraw.withdrawExpected(
          activeKey,
          pool,
          cFormValues.isWrapped,
          cFormValues.lpToken,
        )
        if (resp.error) {
          get()[sliceKey].setStateByKeys({
            formStatus: {
              ...get()[sliceKey].formStatus,
              error: resp.error,
            },
          })
        } else {
          cFormValues.amounts = cFormValues.amounts.map((a: Amount, idx) => ({
            ...a,
            value: resp.expected[idx] ?? '0',
          }))
          activeKey = getActiveKey(pool.id, formType, cFormValues, maxSlippage)
          get()[sliceKey].setStateByKeys({
            activeKey,
            formValues: cloneDeep(cFormValues),
            slippage: { [activeKey]: { ...cloneDeep(DEFAULT_SLIPPAGE), slippage: 0 } },
          })
        }

        // get gas
        if (signerAddress) {
          void get()[sliceKey].fetchEstGasApproval(activeKey, config, curve, formType, pool, cFormValues)
        }
      }
    },
    fetchWithdrawCustom: async (props) => {
      const { storedActiveKey, config, curve, formType, poolData, formValues, maxSlippage } = props
      let activeKey = props.activeKey
      const cFormValues = cloneDeep(formValues)
      const { pool } = poolData
      const { signerAddress } = curve

      //  get slippage and expected
      if (cFormValues.amounts.some((a) => +a.value > 0)) {
        // set loading state
        get()[sliceKey].setStateByKey('slippage', {
          [activeKey]: {
            ...(get()[sliceKey].slippage[storedActiveKey] ?? DEFAULT_SLIPPAGE),
            loading: true,
          },
        })

        // update amounts in form value
        const resp = await curvejsApi.poolWithdraw.withdrawImbalanceBonusAndExpected(
          activeKey,
          pool,
          cFormValues.isWrapped,
          parseAmountsForAPI(cFormValues.amounts),
        )

        if (resp.activeKey === activeKey) {
          if (resp.error) {
            get()[sliceKey].setStateByKeys({
              slippage: { [activeKey]: { ...DEFAULT_SLIPPAGE, loading: false } },
              formStatus: {
                ...get()[sliceKey].formStatus,
                error: resp.error,
              },
            })
          } else {
            cFormValues.lpToken = resp.expected
            activeKey = getActiveKey(pool.id, formType, cFormValues, maxSlippage)
            get()[sliceKey].setStateByKeys({ activeKey, formValues: cloneDeep(cFormValues) })
            get()[sliceKey].setStateByKey('slippage', {
              [activeKey]: {
                ...DEFAULT_SLIPPAGE,
                slippage: Math.abs(+resp.bonus),
                isHighSlippage: isHighSlippage(+resp.bonus, maxSlippage),
                isBonus: isBonus(+resp.bonus),
              },
            })
          }
        }
      } else if (+cFormValues.lpToken > 0) {
        // set loading state
        get()[sliceKey].setStateByKey('slippage', {
          [activeKey]: {
            ...(get()[sliceKey].slippage[storedActiveKey] ?? DEFAULT_SLIPPAGE),
            loading: true,
          },
        })

        // update amounts in form value
        const resp = await curvejsApi.poolWithdraw.withdrawExpected(
          activeKey,
          pool,
          cFormValues.isWrapped,
          cFormValues.lpToken,
        )

        if (resp.activeKey === activeKey) {
          if (resp.error) {
            get()[sliceKey].setStateByKeys({
              slippage: { [activeKey]: { ...DEFAULT_SLIPPAGE, loading: false } },
              formStatus: {
                ...get()[sliceKey].formStatus,
                error: resp.error,
              },
            })
          } else {
            cFormValues.amounts = cFormValues.amounts.map((a, idx) => ({ ...a, value: resp.expected[idx] }))
            activeKey = getActiveKey(pool.id, formType, cFormValues, maxSlippage)
            get()[sliceKey].setStateByKeys({ activeKey, formValues: cloneDeep(cFormValues) })
            get()[sliceKey].setStateByKey('slippage', {
              [activeKey]: { ...cloneDeep(DEFAULT_SLIPPAGE), slippage: 0 },
            })
          }
        }
      }

      // get gas
      if (signerAddress) {
        void get()[sliceKey].fetchEstGasApproval(activeKey, config, curve, formType, pool, cFormValues)
      }
    },
    fetchClaimable: async (activeKey, chainId, pool) => {
      const resp = await curvejsApi.poolWithdraw.claimableTokens(activeKey, pool, chainId)
      const storedFormStatus = get()[sliceKey].formStatus

      if (get()[sliceKey].activeKey === resp.activeKey) {
        if (resp.error) {
          get()[sliceKey].setStateByKey('formStatus', { ...storedFormStatus, error: resp.error })
        } else {
          get()[sliceKey].setStateByKey('formStatus', storedFormStatus)
          get()[sliceKey].setStateByKey('formValues', {
            ...get()[sliceKey].formValues,
            claimableCrv: resp.claimableCrv,
            claimableRewards: resp.claimableRewards,
          })
        }
      }
    },
    setFormValues: async (
      formType,
      config,
      curve,
      poolId,
      poolData,
      updatedFormValues,
      _loadMaxAmount,
      isSeed,
      maxSlippage,
    ) => {
      if (get()[sliceKey].formType !== formType) return

      // stored values
      const storedActiveKey = get()[sliceKey].activeKey
      const storedFormValues = get()[sliceKey].formValues
      const storedFormStatus = get()[sliceKey].formStatus

      // update form values
      const cFormValues = cloneDeep({ ...storedFormValues, ...updatedFormValues })
      let activeKey = getActiveKey(poolId, formType, cFormValues, maxSlippage)
      get()[sliceKey].setStateByKeys({
        activeKey,
        formStatus: {
          ...DEFAULT_FORM_STATUS,
          isApproved: storedFormStatus.isApproved,
          isClaimCrv: storedFormStatus.isClaimCrv,
          isClaimRewards: storedFormStatus.isClaimRewards,
        },
        formValues: cloneDeep(cFormValues),
      })

      if (!curve || !poolData || isSeed || cFormValues.isWrapped === null) return

      const { pool } = poolData
      const { chainId, signerAddress } = curve

      if (formType === 'WITHDRAW') {
        // set default selected if it is empty
        if (!cFormValues.selected && +cFormValues.lpToken > 0) {
          cFormValues.selected = 'token'
          cFormValues.selectedToken = poolData.tokens[0]
          cFormValues.selectedTokenAddress = poolData.tokenAddresses[0]
          activeKey = getActiveKey(poolId, formType, cFormValues, maxSlippage)
          get()[sliceKey].setStateByKeys({ activeKey, formValues: cloneDeep(cFormValues) })
        }

        const props: FetchWithdrawProps = {
          activeKey,
          storedActiveKey,
          config,
          curve,
          formType,
          poolData,
          formValues: cFormValues,
          maxSlippage,
        }
        if (cFormValues.selected === 'token') {
          void get()[sliceKey].fetchWithdrawToken(props)
        } else if (cFormValues.selected === 'lpToken') {
          void get()[sliceKey].fetchWithdrawLpToken(props)
        } else if (cFormValues.selected === 'imbalance') {
          void get()[sliceKey].fetchWithdrawCustom(props)
        }
      } else if (formType === 'UNSTAKE' && !!signerAddress && +cFormValues.stakedLpToken > 0) {
        void get()[sliceKey].fetchEstGasApproval(activeKey, config, curve, formType, pool, cFormValues)
      } else if (formType === 'CLAIM') {
        void get()[sliceKey].fetchClaimable(activeKey, chainId, pool)
      }
    },

    // steps
    fetchEstGasApproval: async (activeKey, config, curve, formType, pool, formValues) => {
      const { chainId } = curve
      let resp
      if (formType === 'WITHDRAW') {
        const lpTokenBalance = await fetchPoolLpTokenBalance(config, curve, pool.id)

        if (+formValues.lpToken > 0 && +lpTokenBalance >= +formValues.lpToken) {
          resp =
            formValues.selected === 'lpToken'
              ? await curvejsApi.poolWithdraw.withdrawEstGasApproval(
                  activeKey,
                  chainId,
                  pool,
                  formValues.isWrapped,
                  formValues.lpToken,
                )
              : formValues.selected === 'imbalance'
                ? await curvejsApi.poolWithdraw.withdrawImbalanceEstGasApproval(
                    activeKey,
                    chainId,
                    pool,
                    formValues.isWrapped,
                    parseAmountsForAPI(formValues.amounts),
                  )
                : await curvejsApi.poolWithdraw.withdrawOneCoinEstGasApproval(
                    activeKey,
                    chainId,
                    pool,
                    formValues.isWrapped,
                    formValues.lpToken,
                    formValues.selectedTokenAddress,
                  )
        }
      } else if (formType === 'UNSTAKE') {
        const fn = curvejsApi.poolWithdraw.unstakeEstGas
        resp = await fn(activeKey, chainId, pool, formValues.stakedLpToken)
      }

      if (resp) {
        // set estimate gas state
        get()[sliceKey].setStateByKey('formEstGas', {
          [activeKey]: { estimatedGas: resp.estimatedGas, loading: false },
        })

        // set form status
        const storedFormStatus = get()[sliceKey].formStatus
        if (!storedFormStatus.formProcessing) {
          get()[sliceKey].setStateByKey('formStatus', {
            ...storedFormStatus,
            isApproved: resp.isApproved,
            error: resp.error || storedFormStatus.error,
          })
        }
      }
      return resp
    },
    fetchStepApprove: async (activeKey, config, curve, formType, pool, formValues) => {
      const { provider } = useWallet.getState()
      if (!provider) return setMissingProvider(get()[sliceKey])

      get()[sliceKey].setStateByKey('formStatus', {
        ...get()[sliceKey].formStatus,
        formProcessing: true,
        step: 'APPROVAL',
      })
      const { amounts, lpToken, selected } = formValues
      let resp
      if (selected === 'token' || selected === 'lpToken') {
        const fn =
          selected === 'token'
            ? curvejsApi.poolWithdraw.withdrawOneCoinApprove
            : curvejsApi.poolWithdraw.withdrawApprove
        resp = await fn(activeKey, provider, pool, lpToken)
      } else if (formValues.selected === 'imbalance') {
        const fn = curvejsApi.poolWithdraw.withdrawImbalanceApprove
        resp = await fn(activeKey, provider, pool, parseAmountsForAPI(amounts))
      }
      if (resp && resp.activeKey === get()[sliceKey].activeKey) {
        const cFormStatus = cloneDeep(get()[sliceKey].formStatus)
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
          await get()[sliceKey].fetchEstGasApproval(activeKey, config, curve, formType, pool, formValues)
        }

        return resp
      }
    },
    fetchStepWithdraw: async (activeKey, config, curve, poolData, formValues, maxSlippage) => {
      const { provider } = useWallet.getState()
      if (!provider) return setMissingProvider(get()[sliceKey])

      get()[sliceKey].setStateByKey('formStatus', {
        ...get()[sliceKey].formStatus,
        formProcessing: true,
        step: 'WITHDRAW',
      })
      const { pool } = poolData
      let resp
      if (formValues.selected === 'token') {
        const fn = curvejsApi.poolWithdraw.withdrawOneCoin
        resp = await fn(
          activeKey,
          provider,
          poolData.pool,
          formValues.isWrapped,
          formValues.lpToken,
          formValues.selectedTokenAddress,
          maxSlippage,
        )
      } else if (formValues.selected === 'lpToken') {
        const fn = curvejsApi.poolWithdraw.withdraw
        resp = await fn(activeKey, provider, pool, formValues.isWrapped, formValues.lpToken, maxSlippage)
      } else if (formValues.selected === 'imbalance') {
        const amounts = parseAmountsForAPI(formValues.amounts)
        const fn = curvejsApi.poolWithdraw.withdrawImbalance
        resp = await fn(activeKey, provider, pool, formValues.isWrapped, amounts, maxSlippage)
      }
      if (resp && resp.activeKey === get()[sliceKey].activeKey) {
        const cFormStatus = cloneDeep(get()[sliceKey].formStatus)
        cFormStatus.formProcessing = false
        cFormStatus.step = ''
        cFormStatus.error = ''

        if (resp.error) {
          cFormStatus.error = resp.error
          get()[sliceKey].setStateByKey('formStatus', cFormStatus)
        } else {
          cFormStatus.formTypeCompleted = 'WITHDRAW'
          get()[sliceKey].setStateByKeys({
            formStatus: cFormStatus,
            formValues: resetFormValues(formValues),
          })

          // re-fetch data
          await Promise.all([
            get().user.fetchUserPoolInfo(config, curve, pool.id),
            get().pools.fetchPoolStats(curve, poolData),
          ])
        }

        return resp
      }
    },
    fetchStepUnstake: async (activeKey, config, curve, poolData, formValues) => {
      const { provider } = useWallet.getState()
      if (!provider) return setMissingProvider(get()[sliceKey])

      get()[sliceKey].setStateByKey('formStatus', {
        ...get()[sliceKey].formStatus,
        formProcessing: true,
        step: 'UNSTAKE',
      })
      const { pool } = poolData
      const resp = await curvejsApi.poolWithdraw.unstake(activeKey, provider, pool, formValues.stakedLpToken)
      if (resp.activeKey === get()[sliceKey].activeKey) {
        const cFormStatus = cloneDeep(get()[sliceKey].formStatus)
        cFormStatus.formProcessing = false
        cFormStatus.step = ''
        cFormStatus.error = ''

        if (resp.error) {
          cFormStatus.error = resp.error
          get()[sliceKey].setStateByKey('formStatus', cFormStatus)
        } else {
          cFormStatus.formTypeCompleted = 'UNSTAKE'
          get()[sliceKey].setStateByKeys({
            formStatus: cFormStatus,
            formValues: resetFormValues(formValues),
          })

          // re-fetch data
          await Promise.all([
            get().user.fetchUserPoolInfo(config, curve, pool.id),
            get().pools.fetchPoolStats(curve, poolData),
          ])
        }

        return resp
      }
    },
    fetchStepClaim: async (activeKey, config, curve, poolData) => {
      const { provider } = useWallet.getState()
      if (!provider) return setMissingProvider(get()[sliceKey])

      get()[sliceKey].setStateByKey('formStatus', {
        ...get()[sliceKey].formStatus,
        formProcessing: true,
        step: 'CLAIM',
      })
      const { pool } = poolData
      const { isClaimCrv } = get()[sliceKey].formStatus
      const resp = isClaimCrv
        ? await curvejsApi.poolWithdraw.claimCrv(activeKey, provider, pool)
        : await curvejsApi.poolWithdraw.claimRewards(activeKey, provider, pool)
      if (resp.activeKey === get()[sliceKey].activeKey) {
        const cFormStatus = cloneDeep(get()[sliceKey].formStatus)
        cFormStatus.formProcessing = false
        cFormStatus.step = ''
        cFormStatus.isClaimCrv = false
        cFormStatus.isClaimRewards = false
        cFormStatus.error = ''

        if (resp.error) {
          cFormStatus.error = resp.error
          get()[sliceKey].setStateByKey('formStatus', cFormStatus)
        } else {
          cFormStatus.formTypeCompleted = isClaimCrv ? 'CLAIM_CRV' : 'CLAIM_REWARDS'
          const storedFormValues = get()[sliceKey].formValues
          get()[sliceKey].setStateByKeys({
            formStatus: cFormStatus,
            formValues: resetFormValues(storedFormValues),
          })

          // re-fetch data
          await Promise.all([
            get().user.fetchUserPoolInfo(config, curve, pool.id),
            get().pools.fetchPoolStats(curve, poolData),
          ])
        }

        return resp
      }
    },

    // slice helpers
    setStateByActiveKey: (key, activeKey, value) => {
      const foundKey = get()[sliceKey][key] as object
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
        formType: formType || 'WITHDRAW',
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
  {
    amounts,
    claimableCrv,
    claimableRewards,
    isWrapped,
    lpToken,
    stakedLpToken,
    selected,
    selectedToken,
    selectedTokenAddress,
  }: FormValues,
  maxSlippage: string,
) {
  let activeKey = `${formType}-${poolId}-`

  if (formType === 'WITHDRAW') {
    if (selected === 'token') {
      const selectedStr = `${selected}-${selectedToken}-${
        selectedTokenAddress ? shortenAddress(selectedTokenAddress) : ''
      }`
      activeKey += `${selectedStr}-${isWrapped}-${maxSlippage}-${lpToken}`
    } else if (selected === 'lpToken') {
      activeKey += `${selected}-${isWrapped}-${maxSlippage}-${lpToken}`
    } else {
      const amountsStr = amounts.map((a) => a.value).join('-')
      activeKey += `${selected}-${amountsStr}`
    }
  } else if (formType === 'UNSTAKE') {
    activeKey += `${stakedLpToken}`
  } else if (formType === 'CLAIM') {
    activeKey += `${claimableCrv}-${claimableRewards}`
  }
  return activeKey
}

function resetFormValues(formValues: FormValues) {
  return {
    ...cloneDeep(formValues),
    amounts: formValues.amounts.map((a) => ({ ...a, value: '' })),
    claimableRewards: [],
    claimableCrv: '',
    lpToken: '',
    stakedLpToken: '',
  }
}

export default createPoolWithdrawSlice
