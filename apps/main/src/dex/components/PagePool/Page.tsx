import { useMemo } from 'react'
import { getAddress, isAddressEqual } from 'viem'
import { Transfer } from '@/dex/components/PagePool/index'
import { ROUTE } from '@/dex/constants'
import { useNetworkByChain } from '@/dex/entities/networks'
import { PoolContextProvider } from '@/dex/features/pool-context'
import { useChainId } from '@/dex/hooks/useChainId'
import { useLitePool } from '@/dex/queries/lite-pool.query'
import { usePoolPricesApi } from '@/dex/queries/pool-prices-api.query'
import { usePool } from '@/dex/queries/pool.query'
import { usePoolsBlacklist } from '@/dex/queries/pools-blacklist.query'
import type { PoolAddressParams } from '@/dex/types/main.types'
import type { Chain } from '@curvefi/prices-api'
import { useCurve } from '@evm-ui/features/connect-wallet'
import { isLiteChain } from '@evm-ui/features/connect-wallet/lib/wagmi/chains'
import { PageBlacklist } from '@ui/features/layout/PageBlacklist'
import { PageState } from '@ui/features/layout/PageState'
import { fallbackQ, mapQuery, q } from '@ui/features/queries/util'
import { useParams } from '@ui/hooks/router'
import { t } from '@ui/lib/i18n'
import { CURVE_SOCIALS } from '@ui/lib/resource.constants'

export const PagePool = () => {
  const { curveApi } = useCurve()
  const props = useParams<PoolAddressParams>()
  const { poolAddress: rPoolAddress, network: blockchainId } = props
  const poolAddress = getAddress(rPoolAddress)
  const chainId = useChainId(blockchainId)
  const { data: network } = useNetworkByChain({ chainId })

  const pool = usePool({ chainId, poolAddress })
  const apiPool = usePoolPricesApi({ chainId, poolAddress }, !isLiteChain(chainId))
  const litePool = useLitePool({ chainId, poolAddress })

  const { data: blacklist } = usePoolsBlacklist({ blockchainId: blockchainId as Chain })
  const isBlacklisted = useMemo(
    () => blacklist?.some(badPool => isAddressEqual(badPool, poolAddress)) ?? false,
    [blacklist, poolAddress],
  )

  if (isBlacklisted)
    return (
      <PageBlacklist
        title={t`Blacklisted pool`}
        description={[
          t`Access through the Curve interface is blocked to help protect you from unsafe deposits. Pools may be blacklisted because of deprecated or exploited assets, misconfiguration, or malicious deployers.`,
          t`If you believe this pool has been incorrectly flagged, contact us.`,
        ]}
        navUrl={ROUTE.pools({ blockchainId: props.network })}
        navTitle={t`Go back to pools`}
        contactUrl={CURVE_SOCIALS.telegram.en}
        contactTitle={t`Contact us`}
      />
    )

  return (
    <PageState
      query={fallbackQ(q(pool), q(apiPool), litePool)}
      notFound={t`Pool Not Found`}
      continueUrl={ROUTE.pools({ blockchainId: props.network })}
      userAddress={curveApi?.signerAddress}
    >
      <PoolContextProvider network={network} pool={mapQuery(pool, data => data ?? undefined)} poolAddress={poolAddress}>
        <Transfer params={props} />
      </PoolContextProvider>
    </PageState>
  )
}
