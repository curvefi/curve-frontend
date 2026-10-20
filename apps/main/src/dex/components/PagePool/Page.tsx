import { useMemo } from 'react'
import { getAddress, isAddress, isAddressEqual } from 'viem'
import { Transfer } from '@/dex/components/PagePool/index'
import { ROUTE } from '@/dex/constants'
import { useNetworkByChain } from '@/dex/entities/networks'
import { PoolContextProvider } from '@/dex/features/pool-context'
import { useChainId } from '@/dex/hooks/useChainId'
import { usePoolLookup } from '@/dex/queries/pool-lookup.query'
import { usePoolsBlacklist } from '@/dex/queries/pools-blacklist.query'
import type { PoolAddressParams } from '@/dex/types/main.types'
import { getPath } from '@/dex/utils/utilsRouter'
import type { Chain } from '@curvefi/prices-api'
import { useCurve } from '@evm-ui/features/connect-wallet'
import { maybe } from '@primitives/objects.utils'
import { ErrorPage } from '@ui/features/errors/ErrorPage'
import { PageBlacklist } from '@ui/features/layout/PageBlacklist'
import { fakeLoadingQ, mapQuery } from '@ui/features/queries/util'
import { useParams } from '@ui/hooks/router'
import { t } from '@ui/lib/i18n'
import { CURVE_SOCIALS } from '@ui/lib/resource.constants'

export const PagePool = () => {
  const { curveApi, isHydrated } = useCurve()
  const props = useParams<PoolAddressParams>()
  const { poolAddress: rPoolAddress, network: blockchainId } = props
  const poolAddress = isAddress(rPoolAddress, { strict: false }) ? getAddress(rPoolAddress) : undefined
  const chainId = useChainId(blockchainId)
  const { data: network } = useNetworkByChain({ chainId })

  const lookup = usePoolLookup({ chainId, poolAddress })
  const pool = isHydrated ? lookup : fakeLoadingQ(undefined) // We want to have a loading state during hydration (pool query is disabled until then)

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
  if (pool.data === null || !poolAddress)
    return (
      <ErrorPage
        title="404"
        subtitle={t`Pool Not Found`}
        continueUrl={getPath(props, ROUTE.PAGE_POOLS)}
        userAddress={curveApi?.signerAddress}
      />
    )

  // Typescript is not smart enough to narrow the type of pool to exclude `null`
  return (
    <PoolContextProvider network={network} pool={mapQuery(pool, data => data ?? undefined)} poolAddress={poolAddress}>
      <Transfer params={props} />
    </PoolContextProvider>
  )
}
