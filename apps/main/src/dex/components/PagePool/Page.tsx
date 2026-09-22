import { useMemo } from 'react'
import { isAddress, isAddressEqual } from 'viem'
import { Transfer } from '@/dex/components/PagePool/index'
import { ROUTE } from '@/dex/constants'
import { useNetworkByChain } from '@/dex/entities/networks'
import { PoolContextProvider } from '@/dex/features/pool-context'
import { useChainId } from '@/dex/hooks/useChainId'
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
  const props = useParams<PoolUrlParams>()
  const { poolIdOrAddress, network: blockchainId } = props

  const { curveApi = null, isHydrated } = useCurve()
  const chainId = useChainId(blockchainId)

  // Not proud of this one, but whether there's a pool depends on if the given curveapi is hydrated or not. Temp until we migrate to Prices API.
  const pool = useMemo(
    () => maybe(curveApi, curveApi => tryGetPool(poolIdOrAddress, curveApi)),
    // eslint-disable-next-line @eslint-react/exhaustive-deps
    [curveApi, poolIdOrAddress, isHydrated],
  )
  const { data: network } = useNetworkByChain({ chainId })

  const { data: blacklist } = usePoolsBlacklist({ blockchainId: blockchainId as Chain })
  const isBlacklisted = useMemo(
    () =>
      isAddress(poolIdOrAddress, { strict: false /* address comes from URL which might be lowercase */ }) &&
      blacklist?.some(badPool => isAddressEqual(badPool, poolIdOrAddress)),
    [blacklist, poolIdOrAddress],
  )

  return isHydrated && (pool == null || isBlacklisted) ? (
    <ErrorPage
      title="404"
      subtitle={t`Pool Not Found`}
      continueUrl={getPath(props, ROUTE.PAGE_POOLS)}
      userAddress={curveApi?.signerAddress}
    />
  ) : (
    pool && isHydrated && (
      <PoolContextProvider key={`${chainId}:${poolIdOrAddress}`} network={network} pool={pool}>
        <Transfer params={props} />
      </PoolContextProvider>
    )
  )
}
