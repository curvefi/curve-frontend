import { useEffect, useMemo, useState } from 'react'
import { isAddress, isAddressEqual } from 'viem'
import { Transfer } from '@/dex/components/PagePool/index'
import { ROUTE } from '@/dex/constants'
import { useNetworkByChain } from '@/dex/entities/networks'
import { PoolContextProvider } from '@/dex/features/pool-context'
import { useChainId } from '@/dex/hooks/useChainId'
import { usePoolIdByAddressOrId } from '@/dex/hooks/usePoolIdByAddressOrId'
import { usePoolsBlacklist } from '@/dex/queries/pools-blacklist.query'
import { useStore } from '@/dex/store/useStore'
import type { PoolUrlParams } from '@/dex/types/main.types'
import { getPath } from '@/dex/utils/utilsRouter'
import type { Chain } from '@curvefi/prices-api'
import { useCurve } from '@evm-ui/features/connect-wallet'
import { ErrorPage } from '@ui/features/errors/ErrorPage'
import { useParams } from '@ui/hooks/router'
import { t } from '@ui/lib/i18n'

export const PagePool = () => {
  const { curveApi = null, isHydrated } = useCurve()
  const props = useParams<PoolUrlParams>()
  const { poolIdOrAddress: rPoolIdOrAddress, network: blockchainId } = props
  const chainId = useChainId(blockchainId)
  const poolId = usePoolIdByAddressOrId({ chainId, poolIdOrAddress: rPoolIdOrAddress })

  const fetchNewPool = useStore(state => state.pools.fetchNewPool)
  const pool = useStore(state => state.pools.poolsMapper[chainId]?.[poolId ?? ''])
  const { data: network } = useNetworkByChain({ chainId })
  const [poolNotFound, setPoolNotFound] = useState(false)

  // Legacy jank to refetch new pools. If we're fully hydrated yet the pool's missing it's probably a new one.
  useEffect(() => {
    if (!pool && poolId && curveApi && isHydrated) {
      fetchNewPool(curveApi, poolId)
        .then(found => setPoolNotFound(!found))
        .catch(() => setPoolNotFound(true))
    }
  }, [curveApi, fetchNewPool, isHydrated, pool, poolId])

  const { data: blacklist } = usePoolsBlacklist({ blockchainId: blockchainId as Chain })
  const isBlacklisted = useMemo(
    () =>
      isAddress(rPoolIdOrAddress, { strict: false /* address comes from URL which might be lowercase */ }) &&
      blacklist?.some(badPool => isAddressEqual(badPool, rPoolIdOrAddress)),
    [blacklist, rPoolIdOrAddress],
  )

  return poolNotFound || isBlacklisted ? (
    <ErrorPage
      title="404"
      subtitle={t`Pool Not Found`}
      continueUrl={getPath(props, ROUTE.PAGE_POOLS)}
      userAddress={curveApi?.signerAddress}
    />
  ) : (
    poolId && pool?.id === poolId && isHydrated && (
      <PoolContextProvider key={`${chainId}:${poolId}`} network={network} poolIdOrAddress={rPoolIdOrAddress}>
        <Transfer params={props} />
      </PoolContextProvider>
    )
  )
}
