import { shortenAccount } from '@/ui/utils'
import { PromisePool } from '@supercharge/promise-pool'

import cloneDeep from 'lodash/cloneDeep'
import orderBy from 'lodash/orderBy'
import type { GetState, SetState } from 'zustand'
import type { VecrvInfo } from '@/components/PageCrvLocker/types'

import { claimButtonsKey } from '@/components/PageDashboard/components/FormClaimFees'
import type {
  FormStatus,
  FormValues,
  Order,
  SortId,
  WalletDashboardData,
  WalletPoolData,
} from '@/components/PageDashboard/types'
import {
  DEFAULT_FORM_STATUS,
  DEFAULT_FORM_VALUES,
  DEFAULT_WALLET_DASHBOARD_DATA,
} from '@/components/PageDashboard/utils'
import curvejsApi from '@/lib/curvejs'
import networks from '@/networks'
import type { State } from '@/store/useStore'
import { fulfilledValue, getErrorMessage, getStorageValue, setStorageValue } from '@/utils'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  activeKey: string
  isValidWalletAddress: { [activeKey: string]: boolean }
  loading: boolean
  error: string
  claimableFees: { [activeKey: string]: { ['3CRV']: string; crvUSD: string } | null }
  formValues: FormValues
  formStatus: FormStatus
  resultRewardsCrvCount: number
  resultRewardsOtherCount: number
  searchedWalletAddresses: string[]
  vecrvInfo: { [activeKey: string]: VecrvInfo | null }
  walletDashboardData: { [activeKey: string]: WalletDashboardData }
  walletPoolDatas: { [activeKey: string]: WalletPoolData[] }
}

const sliceKey = 'dashboard'

// prettier-ignore
export type DashboardSlice = {
  [sliceKey]: SliceState & {
    fetchVeCrvAndClaimables: (activeKey: string, curve: CurveApi, walletAddress: string) => Promise<void>
    fetchDashboardData: (activeKey: string, curve: CurveApi, walletAddress: string, poolDataMapper: PoolDataMapper) => Promise<WalletPoolData[]>
    sortFn: (sortBy: SortId, sortByOrder: Order, walletPoolDatas: WalletPoolData[]) => WalletPoolData[]
    setFormValues: (curve: CurveApi | null, isLoadingApi: boolean, rChainId: ChainId, poolDataMapper: PoolDataMapper | undefined, formValues: Partial<FormValues>) => void
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
  isValidWalletAddress: {},
  loading: false,
  error: '',
  claimableFees: {},
  formValues: DEFAULT_FORM_VALUES,
  formStatus: DEFAULT_FORM_STATUS,
  resultRewardsCrvCount: 0,
  resultRewardsOtherCount: 0,
  searchedWalletAddresses: [],
  vecrvInfo: {},
  walletDashboardData: {},
  walletPoolDatas: {},
}

const createDashboardSlice = (set: SetState<State>, get: GetState<State>): DashboardSlice => ({
  dashboard: {
    ...DEFAULT_STATE,

    fetchVeCrvAndClaimables: async (activeKey, curve, walletAddress) => {
      const { ...sliceState } = get()[sliceKey]

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
    fetchDashboardData: async (activeKey, curve, walletAddress, poolDataMapper) => {
      const { chainId } = curve
      let walletPoolDatas: WalletPoolData[] = []

      try {
        // Get user pool list
        const { poolList } = await networks[chainId].api.wallet.getUserPoolList(curve, walletAddress)
        if (poolList.length === 0) {
          get()[sliceKey].setStateByActiveKey('walletDashboardData', activeKey, DEFAULT_WALLET_DASHBOARD_DATA)
          get()[sliceKey].setStateByActiveKey('walletPoolDatas', activeKey, [])
          return walletPoolDatas
        } else {
          const [userPoolBalancesResult, userClaimableResult] = await Promise.allSettled([
            networks[chainId].api.wallet.getUserLiquidityUSD(curve, poolList, walletAddress),
            networks[chainId].api.wallet.getUserClaimable(curve, poolList, walletAddress),
          ])

          const userPoolBalances = fulfilledValue(userPoolBalancesResult)
          const userClaimable = fulfilledValue(userClaimableResult)
          const rewardsApyMapper = get().pools.rewardsApyMapper[chainId] ?? {}

          let poolDatas = poolList.map((poolId: string) => poolDataMapper[poolId])
          ;({ results: walletPoolDatas } = await PromisePool.for(poolDatas)
            .withConcurrency(10)
            .process(async (poolData, idx) => {
              const [rewardsApyResult, userCrvApyResult, profitsResults, lpTokenBalancesResult] =
                await Promise.allSettled([
                  rewardsApyMapper[poolData.pool.id]
                    ? Promise.resolve(rewardsApyMapper[poolData.pool.id])
                    : networks[chainId].api.pool.poolAllRewardsApy(chainId, poolData.pool),
                  networks[chainId].api.wallet.userPoolRewardCrvApy(poolData.pool, walletAddress),
                  networks[chainId].api.wallet.userPoolRewardProfit(poolData.pool, walletAddress, chainId),
                  networks[chainId].api.wallet.userPoolLpTokenBalances(poolData.pool, walletAddress),
                ])

              const poolRewardsApy = fulfilledValue(rewardsApyResult)
              const userCrvApy = fulfilledValue(userCrvApyResult) ?? 0
              const profits = fulfilledValue(profitsResults) // baseProfit: {}, crvProfit: {}, tokensProfit: []
              const lpTokenBalances = fulfilledValue(lpTokenBalancesResult) ?? {}

              return {
                poolId: poolData.pool.id,
                poolAddress: poolData.pool.address,
                poolName: poolData.pool.name,
                poolRewardsApy,
                userCrvApy,
                liquidityUsd: userPoolBalances?.[idx] || '0',
                baseProfit: profits?.baseProfit,
                crvProfit: profits?.crvProfit,
                tokensProfit: profits?.tokensProfit || [],
                claimableCrv: (userClaimable?.[idx] || []).filter(
                  (c: ClaimableReward) => c.symbol === 'CRV' && +c.amount > 0
                ),
                claimableOther: (userClaimable?.[idx] ?? []).filter(
                  (c: ClaimableReward) => c.symbol !== 'CRV' && +c.amount > 0
                ),
                percentStaked: getPercentStaked(lpTokenBalances as { gauge: string; lpToken: string }),
              }
            }))

          // update rewards
          const updatedRewardsApyMapper: RewardsApyMapper = cloneDeep(get().pools.rewardsApyMapper[chainId] ?? {})
          for (const idx in walletPoolDatas) {
            const r = walletPoolDatas[idx]
            if (r.poolRewardsApy) {
              updatedRewardsApyMapper[r.poolId] = r.poolRewardsApy
            }
          }
          get().pools.setStateByActiveKey('rewardsApyMapper', chainId.toString(), updatedRewardsApyMapper)

          let parsedResult: WalletDashboardData = cloneDeep(DEFAULT_WALLET_DASHBOARD_DATA)

          // set totalLiquidityUsd
          for (let r of walletPoolDatas) {
            parsedResult.totalLiquidityUsd += Number(r.liquidityUsd || 0)
          }
          get()[sliceKey].setStateByActiveKey('walletDashboardData', activeKey, cloneDeep(parsedResult))

          for (let r of walletPoolDatas) {
            let crvPrice = 1

            if (r.crvProfit?.price) {
              parsedResult.totalCrvProfit.price = r.crvProfit.price
              parsedResult.totalClaimableCrv.price = r.crvProfit.price
              crvPrice = r.crvProfit?.price
            }

            // total profits (base, crv, other)
            parsedResult.totalBaseProfit += Number(r.baseProfit?.day || 0)
            parsedResult.totalCrvProfit.total += Number(r.crvProfit?.day || 0)
            const crvProfitUsd = Number(r.crvProfit?.day || 0) * crvPrice
            parsedResult.totalProfitUsd = parsedResult.totalProfitUsd + Number(r.baseProfit?.day || 0) + crvProfitUsd
            if (Array.isArray(r.tokensProfit)) {
              r.tokensProfit.forEach((t) => {
                if (!parsedResult.totalOtherProfit[t.token]) {
                  parsedResult.totalOtherProfit[t.token] = { total: 0, price: t.price, symbol: t.symbol }
                }
                parsedResult.totalOtherProfit[t.token].total += Number(t.day || 0)
                const otherProfitUsd = Number(t.day || 0) * t.price

                if (otherProfitUsd) {
                  parsedResult.totalProfitUsd += otherProfitUsd
                }
              })
            }
          }
          get()[sliceKey].setStateByActiveKey('walletDashboardData', activeKey, cloneDeep(parsedResult))

          // total claimable (crv, other)
          for (let r of walletPoolDatas) {
            if (typeof r.claimableCrv !== 'undefined' && r.claimableCrv.length > 0) {
              const poolTotalClaimableCrv = getTotalClaimableCrv(r.claimableCrv)
              parsedResult.totalClaimableCrv.total += poolTotalClaimableCrv

              if (typeof r.claimableCrv[0]?.price !== 'undefined') {
                parsedResult.totalClaimableUsd += poolTotalClaimableCrv * r.claimableCrv[0]?.price
              }
            }

            if (Array.isArray(r.claimableOther)) {
              r.claimableOther.forEach((t) => {
                if (!parsedResult.totalClaimableOther[t.token]) {
                  parsedResult.totalClaimableOther[t.token] = { total: 0, price: t.price, symbol: t.symbol }
                }

                parsedResult.totalClaimableOther[t.token].total += Number(t.amount)
                const claimableOtherUsd = Number(t.amount) * t.price

                if (typeof t.price === undefined) {
                  console.error(`Unable to find price for ${t.symbol}`)
                }

                if (claimableOtherUsd) {
                  parsedResult.totalClaimableUsd += claimableOtherUsd
                }
              })
            }
          }
          get()[sliceKey].setStateByActiveKey('walletDashboardData', activeKey, cloneDeep(parsedResult))
          get()[sliceKey].setStateByKey('loading', false)
          return walletPoolDatas
        }
      } catch (error) {
        console.error(error)
        get()[sliceKey].setStateByKey('error', getErrorMessage(error, 'error-get-dashboard-data'))
        return walletPoolDatas
      }
    },
    sortFn: (sortBy, sortByOrder, poolDatas) => {
      if (sortBy === 'poolName') {
        return orderBy(poolDatas, ({ poolName }) => poolName.toLowerCase(), [sortByOrder])
      } else if (sortBy === 'baseApy') {
        return orderBy(poolDatas, (data) => Number(data?.poolRewardsApy?.base.day || '0'), [sortByOrder])
      } else if (sortBy === 'userCrvApy') {
        return orderBy(poolDatas, (data) => Number(data?.userCrvApy || '0'), [sortByOrder])
      } else if (sortBy === 'liquidityUsd') {
        return orderBy(poolDatas, (data) => Number(data?.liquidityUsd || '0'), [sortByOrder])
      } else if (sortBy === 'baseProfit') {
        return orderBy(poolDatas, (data) => Number(data?.baseProfit?.day || '0'), [sortByOrder])
      } else if (sortBy === 'crvProfit') {
        return orderBy(poolDatas, (data) => Number(data?.crvProfit?.day || '0'), [sortByOrder])
      } else if (sortBy === 'claimableCrv') {
        return orderBy(poolDatas, (data) => Number(data?.claimableCrv || '0'), [sortByOrder])
      } else if (sortBy === 'incentivesRewardsApy') {
        return orderBy(poolDatas, (data) => Number(data?.poolRewardsApy?.other?.[0]?.apy || '0'), [sortByOrder])
      }
      return []
    },
    setFormValues: async (curve, isLoadingApi, rChainId, poolDataMapper, updatedFormValues) => {
      // stored states
      const storedFormValues = get()[sliceKey].formValues
      const storedWalletsPoolDatas = get()[sliceKey].walletPoolDatas
      const storedSearchedAddresses = get()[sliceKey].searchedWalletAddresses
      const cachedWalletAddresses = getStorageValue('APP_DASHBOARD')?.addresses ?? []

      // update formValues
      const cFormValues = cloneDeep({ ...storedFormValues, ...updatedFormValues })
      cFormValues.walletAddress = cFormValues.walletAddress ? cFormValues.walletAddress.toLowerCase() : ''

      const isValidWalletAddress = cFormValues.walletAddress.length === 42 && cFormValues.walletAddress.startsWith('0x')

      // update locale storage search addresses
      if (isValidWalletAddress && cachedWalletAddresses.indexOf(cFormValues.walletAddress) === -1) {
        const updatedSearchWalletAddresses = [cFormValues.walletAddress].concat(cachedWalletAddresses).slice(0, 10)
        get()[sliceKey].setStateByKey('searchedWalletAddresses', updatedSearchWalletAddresses)
        setStorageValue('APP_DASHBOARD', { addresses: updatedSearchWalletAddresses })
      } else if (storedSearchedAddresses.length === 0 && cachedWalletAddresses.length > 0) {
        get()[sliceKey].setStateByKey('searchedWalletAddresses', cachedWalletAddresses)
      }

      const activeKey = getActiveKey(rChainId, cFormValues.walletAddress)
      const storedWalletPoolDatas = storedWalletsPoolDatas[activeKey]
      const loading = !storedWalletPoolDatas && isValidWalletAddress

      get()[sliceKey].setStateByKeys({
        activeKey,
        formValues: cloneDeep(cFormValues),
        loading,
        error: loading ? '' : get()[sliceKey].error,
        isValidWalletAddress: { [activeKey]: isValidWalletAddress },
      })

      if (!curve || !isValidWalletAddress || !poolDataMapper || isLoadingApi) return
      const { chainId } = curve

      // get claimableFees, locked crv info
      if (chainId === 1) {
        const storedClaimFees = get()[sliceKey].claimableFees[activeKey]
        const storedVecrvInfo = get()[sliceKey].vecrvInfo[activeKey]

        if (!storedClaimFees || !storedVecrvInfo) {
          get()[sliceKey].fetchVeCrvAndClaimables(activeKey, curve, cFormValues.walletAddress)

          if (curve.signerAddress && curve.signerAddress.toLowerCase() !== cFormValues.walletAddress) {
            get().lockedCrv.fetchVecrvInfo(curve)
          }
        }
      }

      // get walletPoolDatas
      let walletPoolDatas
      if (storedWalletPoolDatas) {
        walletPoolDatas = get()[sliceKey].sortFn(cFormValues.sortBy, cFormValues.sortByOrder, storedWalletPoolDatas)
        get()[sliceKey].setStateByActiveKey('walletPoolDatas', activeKey, walletPoolDatas)
      } else {
        walletPoolDatas = await get()[sliceKey].fetchDashboardData(
          activeKey,
          curve,
          cFormValues.walletAddress,
          poolDataMapper
        )
      }
      walletPoolDatas = get()[sliceKey].sortFn(cFormValues.sortBy, cFormValues.sortByOrder, walletPoolDatas)

      let resultRewardsCrvCount = 0
      let resultRewardsOtherCount = 0
      walletPoolDatas.forEach(({ baseProfit, poolRewardsApy, userCrvApy, ...rest }) => {
        if (Number(baseProfit?.day) > 0 && userCrvApy > 0) resultRewardsCrvCount++
        if ((poolRewardsApy?.other ?? []).length > 0) resultRewardsOtherCount++
      })

      get()[sliceKey].setStateByActiveKey('walletPoolDatas', activeKey, walletPoolDatas)
      get()[sliceKey].setStateByKeys({ resultRewardsCrvCount, resultRewardsOtherCount, loading: false })
    },
    setFormStatusClaimFees: (updatedFormStatus) => {
      const storedFormStatus = get()[sliceKey].formStatus
      get()[sliceKey].setStateByKey('formStatus', cloneDeep({ ...storedFormStatus, ...updatedFormStatus }))
    },
    setFormStatusVecrv: (updatedFormStatusVecrv) => {
      const storedFormStatusVecrv = get()[sliceKey].formStatus
      get()[sliceKey].setStateByKey('formStatus', cloneDeep({ ...storedFormStatusVecrv, ...updatedFormStatusVecrv }))
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
        sliceState.fetchDashboardData(activeKey, curve, walletAddress, storedPoolDataMapper)
      }

      return resp
    },
    fetchStepWithdrawVecrv: async (activeKey, curve, walletAddress) => {
      const provider = get().wallet.getProvider(sliceKey)

      if (provider) {
        let cFormStatus = cloneDeep(DEFAULT_FORM_STATUS)
        cFormStatus.formType = 'VECRV'
        cFormStatus.formProcessing = true
        cFormStatus.step = 'WITHDRAW'
        get()[sliceKey].setStateByKey('formStatus', cloneDeep(cFormStatus))

        await get().gas.fetchGasInfo(curve)
        const { chainId } = curve
        const fn = networks[chainId].api.lockCrv.withdrawLockedCrv
        let resp = await fn(curve, provider, walletAddress)

        cFormStatus.formProcessing = false
        cFormStatus.step = ''

        if (resp.error) {
          cFormStatus.error = resp.error
          get()[sliceKey].setStateByKey('formStatus', cFormStatus)
        } else if (resp.walletAddress === get()[sliceKey].formValues.walletAddress) {
          cFormStatus.formTypeCompleted = 'WITHDRAW'
          get()[sliceKey].setStateByKey('formStatus', cFormStatus)
        }
        return resp
      }
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
      get().resetAppState(sliceKey, cloneDeep(DEFAULT_STATE))
    },
  },
})

export default createDashboardSlice

export function getActiveKey(chainId: ChainId | undefined, walletAddress: string | undefined) {
  return `${chainId ?? ''}-${walletAddress ? shortenAccount(walletAddress) : ''}`
}

function getPercentStaked({ gauge, lpToken }: { gauge: string; lpToken: string }) {
  if (+lpToken > 0) {
    const stakedPercent = ((+gauge / (+gauge + +lpToken)) * 100).toFixed(2)
    return +stakedPercent === 0 ? '0' : stakedPercent
  }
  return ''
}

function getTotalClaimableCrv(claimableCrvs: ClaimableReward[]) {
  let total = 0
  for (const idx in claimableCrvs) {
    const { amount } = claimableCrvs[idx]
    if (Number(amount) > 0) {
      total = total + Number(amount)
    }
  }
  return total
}
