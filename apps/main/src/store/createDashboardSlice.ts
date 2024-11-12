import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'
import type { Address } from 'viem'
import type { VecrvInfo } from '@/components/PageCrvLocker/types'
import type { IProfit } from '@curvefi/api/lib/interfaces'
import type {
  FormStatus,
  FormValues,
  Order,
  SortId,
  WalletPoolData,
  DashboardDatasMapper,
  DashboardDataMapper,
} from '@/components/PageDashboard/types'

import { PromisePool } from '@supercharge/promise-pool'
import { isAddress } from 'viem'
import orderBy from 'lodash/orderBy'

import { DEFAULT_FORM_STATUS, DEFAULT_FORM_VALUES, SORT_ID } from '@/components/PageDashboard/utils'
import { claimButtonsKey } from '@/components/PageDashboard/components/FormClaimFees'
import { fulfilledValue, getErrorMessage, getStorageValue, setStorageValue, sleep } from '@/utils'
import { shortenAccount } from '@/ui/utils'
import curvejsApi from '@/lib/curvejs'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  activeKey: string
  loading: boolean
  error: 'error-get-dashboard-data' | ''
  noResult: boolean
  dashboardDataPoolIds: { [activeKey: string]: string[] }
  dashboardDatasMapper: DashboardDatasMapper
  claimableFees: { [activeKey: string]: { ['3CRV']: string; crvUSD: string } | null }
  formValues: FormValues
  formStatus: FormStatus
  searchedWalletAddresses: string[]
  vecrvInfo: { [activeKey: string]: VecrvInfo | null }
}

const sliceKey = 'dashboard'

// prettier-ignore
export type DashboardSlice = {
  [sliceKey]: SliceState & {
    fetchClaimablesAndLockedDetails: (curve: CurveApi) => Promise<void>
    fetchVeCrvAndClaimables: (activeKey: string, curve: CurveApi, walletAddress: string) => Promise<void>
    fetchDashboardData: (curve: CurveApi, walletAddress: string, poolDataMapper: PoolDataMapper) => Promise<{ dashboardDataMapper: DashboardDataMapper, error: string }>
    sortFn: (chainId: ChainId, sortBy: SortId, sortByOrder: Order, walletPoolDatas: WalletPoolData[]) => WalletPoolData[]
    setFormValues: (rChainId: ChainId, curve: CurveApi | null, poolDataMapper: PoolDataMapper | undefined, formValues: Partial<FormValues>) => void
    setFormStatusClaimFees: (formStatusClaimFees: Partial<FormStatus>) => void
    setFormStatusVecrv: (formStatusVecrv: Partial<FormStatus>) => void

    fetchStepClaimFees: (activeKey: string, curve: CurveApi, walletAddress: string, key: claimButtonsKey) => Promise<FnStepResponse | undefined>
    fetchStepWithdrawVecrv: (activeKey: string, curve: CurveApi, walletAddress: string) => Promise<{ walletAddress: string, hash: string, error: string } | undefined>

    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  activeKey: '',
  loading: false,
  error: '',
  noResult: false,
  dashboardDataPoolIds: {},
  dashboardDatasMapper: {},
  claimableFees: {},
  formValues: DEFAULT_FORM_VALUES,
  formStatus: DEFAULT_FORM_STATUS,
  searchedWalletAddresses: [],
  vecrvInfo: {},
}

const createDashboardSlice = (set: SetState<State>, get: GetState<State>): DashboardSlice => ({
  dashboard: {
    ...DEFAULT_STATE,

    fetchClaimablesAndLockedDetails: async (curve) => {
      const {
        lockedCrv,
        [sliceKey]: {
          activeKey,
          claimableFees,
          formValues: { walletAddress },
          vecrvInfo,
          ...sliceState
        },
      } = get()

      if (Object.keys(claimableFees).length || Object.keys(vecrvInfo).length) return

      sliceState.fetchVeCrvAndClaimables(activeKey, curve, walletAddress)

      const { signerAddress } = curve

      if (signerAddress && signerAddress.toLowerCase() !== walletAddress) {
        lockedCrv.fetchVecrvInfo(curve)
      }
    },
    fetchVeCrvAndClaimables: async (activeKey, curve, walletAddress) => {
      const {
        [sliceKey]: { ...sliceState },
      } = get()

      // loading state
      const formStatus: FormStatus = { ...DEFAULT_FORM_STATUS, loading: true }
      sliceState.setStateByKey('formStatus', formStatus)

      const [veCrvResp, claimablesResp] = await Promise.all([
        curvejsApi.lockCrv.vecrvInfo(activeKey, curve, walletAddress),
        curvejsApi.wallet.userClaimableFees(curve, activeKey, walletAddress),
      ])

      if (veCrvResp.activeKey !== get()[sliceKey].activeKey) return

      const formType: FormStatus['formType'] = veCrvResp.error ? 'VECRV' : claimablesResp.error ? 'CLAIMABLE_FEES' : ''
      const error = veCrvResp.error || claimablesResp.error || ''

      sliceState.setStateByKeys({
        vecrvInfo: { [veCrvResp.activeKey]: veCrvResp.error ? null : veCrvResp.resp },
        claimableFees: { [claimablesResp.activeKey]: claimablesResp.error ? null : claimablesResp },
        formStatus: { ...formStatus, loading: false, formType, error },
      })
    },
    fetchDashboardData: async (curve, walletAddress, poolDataMapper) => {
      const {
        pools: poolsState,
        [sliceKey]: { activeKey, ...sliceState },
      } = get()

      const { chainId } = curve
      const { wallet } = curvejsApi

      try {
        // Get user pool list
        const { poolList } = await wallet.getUserPoolList(curve, walletAddress)
        console.log('---user pool list', poolList, walletAddress)

        // no staked pools
        if (poolList.length === 0) return { dashboardDataMapper: {}, error: '' }

        // get balances and claimables
        const [userPoolBalancesResult, userClaimableResult] = await Promise.allSettled([
          wallet.getUserLiquidityUSD(curve, poolList, walletAddress),
          wallet.getUserClaimable(curve, poolList, walletAddress),
        ])
        const userPoolBalances = fulfilledValue(userPoolBalancesResult)
        const userClaimables = fulfilledValue(userClaimableResult)

        // get pool's
        let poolDatas = poolList.map((poolId: string) => poolDataMapper[poolId])

        // get missing rewards
        await poolsState.fetchMissingPoolsRewardsApy(chainId, poolDatas)

        // get searched address's dashboard data
        let dashboardDataMapper: DashboardDataMapper = {}
        await PromisePool.for(poolDatas)
          .withConcurrency(10)
          .process(async ({ pool }, idx) => {
            const [userCrvApyResult, profitsResults, lpTokenBalancesResult] = await Promise.allSettled([
              wallet.userPoolRewardCrvApy(pool, walletAddress),
              wallet.userPoolRewardProfit(pool, walletAddress, chainId),
              wallet.userPoolLpTokenBalances(pool, walletAddress),
            ])

            const userCrvApy = fulfilledValue(userCrvApyResult) ?? 0
            const { baseProfit, crvProfit, tokensProfit } = fulfilledValue(profitsResults) ?? {
              baseProfit: undefined,
              crvProfit: undefined,
              tokensProfit: [] as IProfit[],
            }
            const lpTokenBalances = fulfilledValue(lpTokenBalancesResult) ?? {}
            const claimables = userClaimables?.[idx] ?? []

            dashboardDataMapper[pool.id] = {
              poolId: pool.id,
              poolName: pool.name,
              poolAddress: pool.address,
              userCrvApy,
              liquidityUsd: userPoolBalances?.[idx] || '0',
              profitBase: baseProfit,
              profitCrv: crvProfit,
              profitOthers: tokensProfit ?? [],
              profitsTotalUsd:
                +(baseProfit?.day ?? 0) +
                +(crvProfit?.day ?? 0) * (crvProfit?.price ?? 0) +
                (tokensProfit ?? []).reduce((total, { day, price }) => total + +day + price, 0),
              claimableCrv: claimables.filter(({ symbol, amount }) => symbol === 'CRV' && +amount > 0),
              claimableOthers: claimables.filter(({ symbol, amount }) => symbol !== 'CRV' && +amount > 0),
              claimablesTotalUsd: claimables.reduce((total, { amount, price }) => total + +amount * price, 0),
              percentStaked: getPercentStaked(lpTokenBalances as { gauge: string; lpToken: string }),
            }
          })

        return { dashboardDataMapper, error: '' }
      } catch (error) {
        console.error(error)
        const errorKey = 'error-get-dashboard-data'
        sliceState.setStateByKey('error', getErrorMessage(error, errorKey))
        return { dashboardDataMapper: {}, error: errorKey }
      }
    },
    sortFn: (chainId, sortBy, order, poolDatas) => {
      if (sortBy === SORT_ID.poolName) {
        return orderBy(poolDatas, ({ poolName }) => poolName.toLowerCase(), [order])
      } else if (sortBy === SORT_ID.liquidityUsd) {
        return orderBy(poolDatas, ({ liquidityUsd }) => Number(liquidityUsd || 0), [order])
      } else if (sortBy === SORT_ID.profits) {
        return orderBy(poolDatas, ({ profitsTotalUsd }) => profitsTotalUsd, [order])
      } else if (sortBy === SORT_ID.claimables) {
        return orderBy(poolDatas, ({ claimablesTotalUsd }) => claimablesTotalUsd, [order])
      } else if (sortBy === SORT_ID.userCrvApy) {
        return orderBy(poolDatas, ({ userCrvApy }) => userCrvApy || 0, [order])
      } else if (sortBy.startsWith('reward')) {
        const rewardsApy = get().pools.rewardsApyMapper[chainId]

        if (sortBy === SORT_ID.rewardBase) {
          return orderBy(poolDatas, ({ poolId }) => Number(rewardsApy[poolId]?.base || '0'), [order])
        }

        if (sortBy === SORT_ID.rewardOthers) {
          return orderBy(poolDatas, ({ poolId }) => Number(rewardsApy[poolId]?.other?.[0]?.apy || '0'), [order])
        }
      }
      return []
    },
    setFormValues: async (rChainId, curve, poolDataMapper, updatedFormValues) => {
      const {
        [sliceKey]: {
          activeKey: storedActiveKey,
          formValues: storedFormValues,
          dashboardDatasMapper: storedDashboardDatasMapper,
          searchedWalletAddresses: storedSearchedAddresses,
          ...sliceState
        },
      } = get()

      // update formValues
      let formValues = { ...storedFormValues, ...updatedFormValues }
      formValues.walletAddress = (formValues.walletAddress ?? '').toLowerCase()

      let activeKey = getActiveKey(rChainId, formValues)
      let isValidAddress = isAddress(formValues.walletAddress as Address)
      let storedDashboardData = storedDashboardDatasMapper[formValues.walletAddress]

      sliceState.setStateByKeys({
        activeKey,
        formValues,
        loading: isValidAddress,
        noResult: typeof storedDashboardData === 'undefined',
        formStatus: { ...DEFAULT_FORM_STATUS },
        error: '',
      })

      if (!curve || !poolDataMapper) return

      const { chainId, signerAddress } = curve

      // if form's wallet address if empty and signer exists, update form's wallet address to signer address
      if (formValues.walletAddress == '' && signerAddress) {
        if (Object.keys(storedDashboardDatasMapper).length !== 0) await sleep(3000)
        sliceState.setFormValues(rChainId, curve, poolDataMapper, { walletAddress: signerAddress })
        return
      }

      const { sortBy, sortByOrder, walletAddress } = formValues

      if (!isAddress(walletAddress as Address)) return

      // update search addresses, local storage
      const cachedAddresses = getStorageValue('APP_DASHBOARD')?.addresses ?? []
      if (cachedAddresses.indexOf(walletAddress) === -1) {
        const searchedAddresses = [walletAddress].concat(cachedAddresses).slice(0, 10)
        sliceState.setStateByKey('searchedWalletAddresses', searchedAddresses)
        setStorageValue('APP_DASHBOARD', { addresses: searchedAddresses })
      } else if (storedSearchedAddresses.length === 0 && cachedAddresses.length > 0) {
        sliceState.setStateByKey('searchedWalletAddresses', cachedAddresses)
      }

      // get claimableFees, locked crv info
      if (chainId === 1) sliceState.fetchClaimablesAndLockedDetails(curve)

      // get dashboard data
      const dashboardDataActiveKey = getDashboardDataActiveKey(chainId, walletAddress)
      let dashboardDataMapper = storedDashboardDatasMapper[dashboardDataActiveKey]

      // get dashboard data if it does not exists in store
      if (Object.keys(dashboardDataMapper ?? {}).length === 0) {
        const resp = await sliceState.fetchDashboardData(curve, walletAddress, poolDataMapper)

        if (resp.error) {
          sliceState.setStateByKeys({ loading: false, noResult: true })
          return
        }

        if (!resp.error) {
          dashboardDataMapper = resp.dashboardDataMapper
          sliceState.setStateByActiveKey('dashboardDatasMapper', dashboardDataActiveKey, dashboardDataMapper)
        }
      }

      // sort
      let dashboardDatas = Object.values(dashboardDataMapper)
      dashboardDatas = sliceState.sortFn(chainId, sortBy, sortByOrder, dashboardDatas)

      // update result
      let poolIds = dashboardDatas.map(({ poolId }) => poolId)

      sliceState.setStateByKey('dashboardDataPoolIds', { [activeKey]: poolIds })
      sliceState.setStateByKeys({
        loading: false,
        noResult: poolIds.length === 0,
      })
    },
    setFormStatusClaimFees: (updatedFormStatus) => {
      const { formStatus, ...sliceState } = get()[sliceKey]
      sliceState.setStateByKey('formStatus', { ...formStatus, ...updatedFormStatus })
    },
    setFormStatusVecrv: (updatedFormStatusVecrv) => {
      const { formStatus, ...sliceState } = get()[sliceKey]
      sliceState.setStateByKey('formStatus', { ...formStatus, ...updatedFormStatusVecrv })
    },

    // steps
    fetchStepClaimFees: async (activeKey, curve, walletAddress, key) => {
      const { pools, gas, wallet } = get()
      const { claimableFees, ...sliceState } = get()[sliceKey]
      const provider = wallet.getProvider(sliceKey)

      if (!provider) return

      const { chainId } = curve

      // loading state
      const formStatus: FormStatus = {
        ...DEFAULT_FORM_STATUS,
        formType: 'CLAIMABLE_FEES',
        formProcessing: true,
        step: 'CLAIM',
      }
      sliceState.setStateByKey('formStatus', formStatus)

      await gas.fetchGasInfo(curve)
      const resp = await curvejsApi.lockCrv.claimFees(activeKey, curve, provider, key)

      if (resp.activeKey !== get()[sliceKey].activeKey) return

      if (resp.error) {
        sliceState.setStateByKey('formStatus', { ...formStatus, formProcessing: false, step: '', error: resp.error })
        return resp
      }

      // refetch claimable fees, update state
      const fetchedClaimables = await curvejsApi.wallet.userClaimableFees(curve, activeKey, walletAddress)
      sliceState.setStateByKeys({
        claimableFees: { [fetchedClaimables.activeKey]: fetchedClaimables },
        formStatus: { ...formStatus, formType: '', formProcessing: false, step: '', formTypeCompleted: 'CLAIM' },
      })

      if (key === claimButtonsKey['3CRV']) {
        const storedPoolDataMapper = pools.poolsMapper[chainId]
        sliceState.fetchDashboardData(curve, walletAddress, storedPoolDataMapper)
      }

      return resp
    },
    fetchStepWithdrawVecrv: async (activeKey, curve, walletAddress) => {
      const {
        gas,
        wallet,
        [sliceKey]: { formValues, ...sliceState },
      } = get()
      const provider = wallet.getProvider(sliceKey)

      if (!provider) return

      // update form
      let cFormStatus: FormStatus = {
        ...DEFAULT_FORM_STATUS,
        formType: 'VECRV',
        formProcessing: true,
        step: 'WITHDRAW',
      }
      sliceState.setStateByKey('formStatus', cFormStatus)

      await gas.fetchGasInfo(curve)
      let resp = await curvejsApi.lockCrv.withdrawLockedCrv(curve, provider, walletAddress)

      cFormStatus.formProcessing = false
      cFormStatus.step = ''

      if (resp.error) {
        cFormStatus.error = resp.error
      }

      if (!resp.error && resp.walletAddress === formValues.walletAddress) {
        cFormStatus.formTypeCompleted = 'WITHDRAW'
      }

      sliceState.setStateByKey('formStatus', cFormStatus)
      return resp
    },

    // slice helpers
    setStateByActiveKey: (key, activeKey, value) => {
      if (Object.keys(get()[sliceKey][key]).length > 30) {
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
    resetState: () => {
      const { walletAddress } = get()[sliceKey].formValues
      get().resetAppState(sliceKey, {
        ...DEFAULT_STATE,
        formValues: { ...DEFAULT_STATE.formValues, walletAddress },
      })
    },
  },
})

export default createDashboardSlice

export function getActiveKey(chainId: ChainId | undefined, { walletAddress, sortBy, sortByOrder }: FormValues) {
  return `${chainId ?? ''}-${walletAddress ? shortenAccount(walletAddress) : ''}${sortBy}${sortByOrder}`
}

export function getDashboardDataActiveKey(chainId: ChainId, walletAddress: string) {
  return `${chainId ?? ''}${walletAddress ? shortenAccount(walletAddress) : ''}`
}

function getPercentStaked({ gauge, lpToken }: { gauge: string; lpToken: string }) {
  if (+lpToken > 0) {
    const stakedPercent = ((+gauge / (+gauge + +lpToken)) * 100).toFixed(2)
    return +stakedPercent === 0 ? '0' : stakedPercent
  }
  return ''
}
