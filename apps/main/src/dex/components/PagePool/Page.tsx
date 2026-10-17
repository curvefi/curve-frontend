import { useMemo } from 'react'
import { getAddress, isAddress, isAddressEqual } from 'viem'
import { Transfer } from '@/dex/components/PagePool/index'
import { ROUTE } from '@/dex/constants'
import { useNetworkByChain } from '@/dex/entities/networks'
import { PoolContextProvider } from '@/dex/features/pool-context'
import { useChainId } from '@/dex/hooks/useChainId'
import { usePoolLookup } from '@/dex/queries/pool-lookup.query'
import { usePoolsBlacklist } from '@/dex/queries/pools-blacklist.query'
import type { PoolUrlParams } from '@/dex/types/main.types'
import { getPath } from '@/dex/utils/utilsRouter'
import type { Chain } from '@curvefi/prices-api'
import { useCurve } from '@evm-ui/features/connect-wallet'
import { useHydratedQuery } from '@evm-ui/hooks/useHydratedQuery'
import { maybe } from '@primitives/objects.utils'
import { Navigate, useRouterState } from '@tanstack/react-router'
import { ErrorPage } from '@ui/features/errors/ErrorPage'
import { PageBlacklist } from '@ui/features/layout/PageBlacklist'
import { fakeLoadingQ, mapQuery } from '@ui/features/queries/util'
import { useParams } from '@ui/hooks/router'
import { t } from '@ui/lib/i18n'
import { CURVE_SOCIALS } from '@ui/lib/resource.constants'

export const PagePool = () => {
  const { curveApi, isHydrated } = useCurve()
  const props = useParams<PoolUrlParams>()
  const isNavigating = useRouterState({ select: state => state.status === 'pending' })
  const { poolIdOrAddress, network: blockchainId } = props
  const chainId = useChainId(blockchainId)
  const { data: network } = useNetworkByChain({ chainId })

  const lookup = useHydratedQuery(usePoolLookup, { chainId, poolIdOrAddress })
  const pool = isHydrated ? lookup : fakeLoadingQ(undefined)

  const { data: blacklist } = usePoolsBlacklist({ blockchainId: blockchainId as Chain })
  const isBlacklisted = useMemo(
    () =>
      maybe(pool.data?.address, address => blacklist?.some(badPool => isAddressEqual(badPool, getAddress(address)))) ??
      false,
    [blacklist, pool.data?.address],
  )

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
  if (pool.data === null)
    return (
      <ErrorPage
        title="404"
        subtitle={t`Pool Not Found`}
        continueUrl={getPath(props, ROUTE.PAGE_POOLS)}
        userAddress={curveApi?.signerAddress}
      />
    )

  const poolAddress = isAddress(poolIdOrAddress, { strict: false }) ? getAddress(poolIdOrAddress) : undefined

  /**
   * We're phasing out pool ids and redirect to pool address in URL, which we can only do after hydration.
   * The URL updates before useParams, so rerenders can restart the redirect with the old pool id.
   * Render null while navigating to let the address params update and prevent a redirect loop.
   * Would also happen with programmatic navigate, so that wouldn't be a solution.
   */
  if (pool.data && !poolAddress) {
    return isNavigating ? null : (
      <Navigate to={getPath(props, `${ROUTE.PAGE_POOLS}/${pool.data.address}`)} search replace resetScroll={false} />
    )
  }

  // Render null without a pool address, which is only expected during redirects from legacy pool ids.
  // Handling this rare case added too much complexity in an earlier attempt.
  return (
    poolAddress && (
      // Typescript is not smart enough to narrow the type of pool to exclude `null`
      <PoolContextProvider network={network} pool={mapQuery(pool, data => data ?? undefined)} poolAddress={poolAddress}>
        <Transfer params={props} />
      </PoolContextProvider>
    )
  )
}
