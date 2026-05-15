import { useMemo } from 'react'
import { isAddressEqual, type Address } from 'viem'
import { ROUTE } from '@/dex/constants'
import { BorrowInformationContainer } from '@/dex/features/refuel/components/BorrowInformationContainer'
import { RecentRefuels } from '@/dex/features/refuel/components/recent-refuels'
import { RefuelFormTabs } from '@/dex/features/refuel/RefuelFormTabs'
import { useChainId } from '@/dex/hooks/useChainId'
import { usePoolIdByAddressOrId } from '@/dex/hooks/usePoolIdByAddressOrId'
import { useStore } from '@/dex/store/useStore'
import type { PoolDataCacheOrApi, PoolUrlParams } from '@/dex/types/main.types'
import { getPath } from '@/dex/utils/utilsRouter'
import type { Chain } from '@curvefi/prices-api'
import Stack from '@mui/material/Stack'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { useParams } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { ErrorPage } from '@ui-kit/pages/ErrorPage'
import { DetailPageLayout } from '@ui-kit/widgets/DetailPageLayout/DetailPageLayout'

const getRefuelTokens = (poolData: PoolDataCacheOrApi) => {
  const [tokenASymbol, tokenBSymbol] = poolData.tokens
  const [tokenAAddress, tokenBAddress] = poolData.tokenAddresses
  const getTokenDecimals = (tokenAddress: string) => {
    const index = poolData.tokenAddressesAll.findIndex(address =>
      isAddressEqual(address as Address, tokenAddress as Address),
    )
    return index >= 0 ? poolData.tokenDecimalsAll?.[index] : undefined
  }
  const tokenADecimals = tokenAAddress ? getTokenDecimals(tokenAAddress) : undefined
  const tokenBDecimals = tokenBAddress ? getTokenDecimals(tokenBAddress) : undefined

  return tokenASymbol &&
    tokenBSymbol &&
    tokenAAddress &&
    tokenBAddress &&
    tokenADecimals != null &&
    tokenBDecimals != null
    ? {
        tokenA: { symbol: tokenASymbol, address: tokenAAddress as Address, decimals: tokenADecimals },
        tokenB: { symbol: tokenBSymbol, address: tokenBAddress as Address, decimals: tokenBDecimals },
      }
    : undefined
}

export const Refuel = () => {
  const { isHydrated } = useCurve()
  const params = useParams<PoolUrlParams>()
  const { network, poolIdOrAddress } = params
  const chainId = useChainId(network)
  const poolId = usePoolIdByAddressOrId({ chainId, poolIdOrAddress })
  const haveAllPools = useStore(state => state.pools.haveAllPools[chainId])
  const poolDataCache = useStore(state => state.storeCache.poolsMapper[chainId]?.[poolId ?? ''])
  const poolData = useStore(state => state.pools.poolsMapper[chainId]?.[poolId ?? ''])
  const poolDataCacheOrApi = useMemo(() => poolData || poolDataCache, [poolData, poolDataCache])
  const isPoolFound = poolId && poolDataCacheOrApi?.pool?.id === poolId
  const poolAddress = poolDataCacheOrApi?.pool.address as Address | undefined
  const refuelTokens = poolDataCacheOrApi && getRefuelTokens(poolDataCacheOrApi)

  if (isHydrated && haveAllPools && !isPoolFound) {
    return <ErrorPage title="404" subtitle={t`Pool Not Found`} continueUrl={getPath(params, ROUTE.PAGE_POOLS)} />
  }

  return (
    isPoolFound &&
    poolAddress &&
    refuelTokens &&
    isHydrated && (
      <DetailPageLayout
        formTabs={
          <RefuelFormTabs chainId={chainId} blockchainId={network} poolAddress={poolAddress} tokens={refuelTokens} />
        }
        testId="refuel-page"
      >
        <Stack>
          <BorrowInformationContainer blockchainId={network as Chain} poolAddress={poolAddress} />
          <RecentRefuels chainId={chainId} blockchainId={network as Chain} poolAddress={poolAddress} />
        </Stack>
      </DetailPageLayout>
    )
  )
}
