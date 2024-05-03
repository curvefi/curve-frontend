import type { FormValues, Route } from '@/components/PageRouterSwap/types'
import type { IRouteStep } from '@curvefi/api/lib/interfaces'
import type { FormStatus } from '@/components/PageRouterSwap/types'

import isUndefined from 'lodash/isUndefined'
import orderBy from 'lodash/orderBy'
import uniq from 'lodash/uniq'

import { log } from '@/utils'
import { weiToEther } from '@/ui/utils/utilsWeb3'

export const DEFAULT_FORM_STATUS: FormStatus = {
  isApproved: false,
  formProcessing: false,
  formTypeCompleted: '',
  step: '',
  error: '',
}

export const DEFAULT_FORM_VALUES: FormValues = {
  isFrom: null,
  fromAmount: '',
  fromError: '',
  toAmount: '',
}

export function getUserTokensMapper(
  curve: CurveApi,
  selectToList: string[],
  usdRatesMapper: UsdRatesMapper,
  userBalancesMapper: UserBalancesMapper,
  fetchUsdRateByTokens: (curve: CurveApi, tokenAddresses: string[]) => Promise<UsdRatesMapper>
) {
  let userTokensMapper: UserTokensMapper = {}
  let missingUsdRates: string[] = []

  for (const idx in selectToList) {
    const address = selectToList[idx]
    const usdRate = usdRatesMapper[address]
    const userBalance = userBalancesMapper[address] ?? '0'
    const userBalanceUsd = +userBalance > 0 && usdRate && usdRate > 0 ? +userBalance * usdRate : 0
    userTokensMapper[address] = { address, userBalance, userBalanceUsd, usdRate }

    if (typeof usdRate === 'undefined' && +userBalance > 0) {
      missingUsdRates.push(address)
    }
  }

  // fetch missing usdRates
  if (missingUsdRates.length) {
    fetchUsdRateByTokens(curve, missingUsdRates)
  }
  return userTokensMapper
}

export function sortTokensByGasFees(
  userTokensMapper: UserTokensMapper,
  selectToList: string[],
  firstBasePlusPriority: number | undefined,
  networkTokenUsdRate: number | undefined
) {
  if (!firstBasePlusPriority || !networkTokenUsdRate) return selectToList

  const GAS_USED = 250000
  const gasFees = weiToEther(GAS_USED * firstBasePlusPriority) * networkTokenUsdRate || 1

  // only allow user tokens with usd balance > gasFees to be visible at top and order by balance
  const userTokensList = Object.entries(userTokensMapper).map(([_, v]) => v)
  const userTokensGreaterThanGasFees = orderBy(
    userTokensList.filter(({ userBalanceUsd }) => userBalanceUsd > gasFees),
    ({ userBalanceUsd }) => userBalanceUsd,
    ['desc']
  ).map(({ address }) => address)

  return uniq([...userTokensGreaterThanGasFees, ...selectToList])
}

export function parseRouterRoutes(
  routes: IRouteStep[],
  poolsMapper: { [poolId: string]: PoolData },
  getPool: (poolId: string) => Pool
) {
  let haveCryptoRoutes = false
  let parsedRoutes: Route[] = []

  if (Array.isArray(routes) && routes.length > 0) {
    parsedRoutes = routes.map((route) => {
      let pool = poolsMapper[route.poolId]?.pool

      if (isUndefined(pool)) {
        try {
          pool = getPool(route.poolId)
        } catch (error) {
          log('routerBestRouteAndOutput missing poolName', route)
        }
      }

      const poolName = pool ? pool.name : route.poolId

      if (pool && pool.isCrypto) {
        haveCryptoRoutes = true
      }

      return { ...route, name: poolName, routeUrlId: pool ? route.poolId : '' }
    })
  }

  return { haveCryptoRoutes, routes: parsedRoutes }
}
