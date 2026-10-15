import { useMemo } from 'react'
import { getAddress, isAddress, isAddressEqual } from 'viem'
import { Transfer } from '@/dex/components/PagePool/index'
import { ROUTE } from '@/dex/constants'
import { useNetworkByChain } from '@/dex/entities/networks'
import { PoolContextProvider } from '@/dex/features/pool-context'
import { useChainId } from '@/dex/hooks/useChainId'
import { fetchNewPools } from '@/dex/lib/curvejs'
import { tryGetPool } from '@/dex/pool.utils'
import { usePoolsBlacklist } from '@/dex/queries/pools-blacklist.query'
import type { PoolUrlParams } from '@/dex/types/main.types'
import { getPath } from '@/dex/utils/utilsRouter'
import type { Chain } from '@curvefi/prices-api'
import { requireLib, useCurve } from '@evm-ui/features/connect-wallet'
import { useHydratedQuery } from '@evm-ui/hooks/useHydratedQuery'
import type { PoolQuery, UserPoolParams } from '@evm-ui/queries/query-types'
import { curvePoolValidationSuite } from '@evm-ui/queries/validation/pool-validation'
import { Navigate, useRouterState } from '@tanstack/react-router'
import { ErrorPage } from '@ui/features/errors/ErrorPage'
import { PageBlacklist } from '@ui/features/layout/PageBlacklist'
import { queryFactory } from '@ui/features/queries/factory'
import { useParams } from '@ui/hooks/router'
import { t } from '@ui/lib/i18n'
import { CURVE_SOCIALS } from '@ui/lib/resource.constants'

const { useQuery: usePoolQuery } = queryFactory({
  queryKey: ({ chainId, poolId, userAddress }: UserPoolParams) =>
    ({ name: 'pool.lookup', chainId, poolId, userAddress }) as const,
  queryFn: async ({ poolId }: PoolQuery) => {
    const curveApi = requireLib('curveApi')
    const pool = tryGetPool(poolId, curveApi)
    if (pool) return pool

    try {
      await fetchNewPools(curveApi)
      return tryGetPool(poolId, curveApi) ?? null
    } catch {
      return null
    }
  },
  validationSuite: curvePoolValidationSuite,
  category: 'global.no-persist',
  disableLog: true, // Pool instances have circular references that cannot be serialized by the query logger used in Cypress.
})

export const PagePool = () => {
  const { curveApi = null, isHydrated } = useCurve()
  const props = useParams<PoolUrlParams>()
  const isNavigating = useRouterState({ select: state => state.status === 'pending' })
  const { poolIdOrAddress, network: blockchainId } = props
  const chainId = useChainId(blockchainId)
  const { data: network } = useNetworkByChain({ chainId })

  const { data: pool } = useHydratedQuery(usePoolQuery, {
    chainId,
    poolId: poolIdOrAddress,
    // The query returns a pool tied to a specific curve-js instance, which gets recreated on user address change.
    userAddress: curveApi?.signerAddress || undefined,
  })

  const { data: blacklist } = usePoolsBlacklist({ blockchainId: blockchainId as Chain })
  const isBlacklisted = useMemo(
    () => pool && blacklist?.some(badPool => isAddressEqual(badPool, getAddress(pool.address))),
    [blacklist, pool],
  )

  // In a future PR we'll remove this check and make everything a query with skeletons and such.
  if (!isHydrated) return null

  if (isBlacklisted)
    return (
      <PageBlacklist
        title={t`Blacklisted pool`}
        description={[
          t`Access through the Curve interface is blocked to help protect you from unsafe deposits. Pools may be blacklisted because of deprecated or exploited assets, misconfiguration, or malicious deployers.`,
          t`If you believe this pool has been incorrectly flagged, contact us.`,
        ]}
        navUrl={getPath(props, ROUTE.PAGE_POOLS)}
        navTitle={t`Go back to pools`}
        contactUrl={CURVE_SOCIALS.telegram.en}
        contactTitle={t`Contact us`}
      />
    )

  // Strict check with null as `undefined` means unresolved; null means 'doesn't exist'.
  if (pool === null)
    return (
      <ErrorPage
        title="404"
        subtitle={t`Pool Not Found`}
        continueUrl={getPath(props, ROUTE.PAGE_POOLS)}
        userAddress={curveApi?.signerAddress}
      />
    )

  /**
   * We're phasing out pool ids and redirect to pool address in URL, which we can only do after hydration.
   * The URL updates before useParams, so rerenders can restart the redirect with the old pool id.
   * Render null while navigating to let the address params update and prevent a redirect loop.
   * Would also happen with programmatic navigate, so that wouldn't be a solution.
   */
  if (pool && !isAddress(poolIdOrAddress, { strict: false })) {
    return isNavigating ? null : (
      <Navigate to={getPath(props, `${ROUTE.PAGE_POOLS}/${pool.address}`)} search replace resetScroll={false} />
    )
  }

  return (
    pool && (
      <PoolContextProvider network={network} pool={pool}>
        <Transfer params={props} />
      </PoolContextProvider>
    )
  )
}
