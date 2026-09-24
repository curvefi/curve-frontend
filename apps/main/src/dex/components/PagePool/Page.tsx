import { useEffect, useMemo, useState } from 'react'
import { isAddress, isAddressEqual } from 'viem'
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
import { useCurve } from '@evm-ui/features/connect-wallet'
import { maybe } from '@primitives/objects.utils'
import { ErrorPage } from '@ui/features/errors/ErrorPage'
import { useParams } from '@ui/hooks/router'
import { t } from '@ui/lib/i18n'

export const PagePool = () => {
  const { curveApi = null, isHydrated } = useCurve()
  const props = useParams<PoolUrlParams>()
  const { poolIdOrAddress, network: blockchainId } = props
  const chainId = useChainId(blockchainId)

  const { data: network } = useNetworkByChain({ chainId })
  const [poolNotFound, setPoolNotFound] = useState<boolean>()

  // Whether there's a pool depends on if the given curve api is hydrated or not.
  const pool = useMemo(
    () => maybe(curveApi, curveApi => tryGetPool(poolIdOrAddress, curveApi)),
    // eslint-disable-next-line @eslint-react/exhaustive-deps
    [curveApi, poolIdOrAddress, isHydrated, poolNotFound],
  )

  useEffect(() => {
    if (!pool && poolIdOrAddress && curveApi && isHydrated) {
      // eslint-disable-next-line @eslint-react/set-state-in-effect -- Reset the previous lookup while checking this pool.
      setPoolNotFound(undefined)
      fetchNewPools(curveApi)
        .then(() => setPoolNotFound(!tryGetPool(poolIdOrAddress, curveApi)))
        .catch(() => setPoolNotFound(true))
    }
  }, [curveApi, isHydrated, pool, poolIdOrAddress])

  const { data: blacklist } = usePoolsBlacklist({ blockchainId: blockchainId as Chain })
  const isBlacklisted = useMemo(
    () =>
      isAddress(poolIdOrAddress, { strict: false /* address comes from URL which might be lowercase */ }) &&
      blacklist?.some(badPool => isAddressEqual(badPool, poolIdOrAddress)),
    [blacklist, poolIdOrAddress],
  )

  return isHydrated && (isBlacklisted || (!pool && poolNotFound)) ? (
    <ErrorPage
      title="404"
      subtitle={t`Pool Not Found`}
      continueUrl={getPath(props, ROUTE.PAGE_POOLS)}
      userAddress={curveApi?.signerAddress}
    />
  ) : (
    pool && isHydrated && (
      <PoolContextProvider network={network} pool={pool}>
        <Transfer params={props} />
      </PoolContextProvider>
    )
  )
}
