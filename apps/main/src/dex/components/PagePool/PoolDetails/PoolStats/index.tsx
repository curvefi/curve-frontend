import { useEffect } from 'react'
import { styled } from 'styled-components'
import { CurrencyReserves } from '@/dex/components/PagePool/PoolDetails/CurrencyReserves'
import { PoolParameters } from '@/dex/components/PagePool/PoolDetails/PoolStats/PoolParameters'
import { Rewards as RewardsComp } from '@/dex/components/PagePool/PoolDetails/PoolStats/Rewards'
import type { PageTransferProps } from '@/dex/components/PagePool/types'
import { usePoolIdByAddressOrId } from '@/dex/hooks/usePoolIdByAddressOrId'
import { useTokenAlert } from '@/dex/hooks/useTokenAlert'
import { useStore } from '@/dex/store/useStore'
import { PoolAlert, TokensMapper, type UrlParams } from '@/dex/types/main.types'
import { getPath } from '@/dex/utils/utilsRouter'
import { AlertBox } from '@ui/AlertBox'
import { Box } from '@ui/Box'
import { InternalLink } from '@ui/Link'
import { ExternalLink } from '@ui/Link/ExternalLink'
import { breakpoints } from '@ui/utils/responsive'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { useParams } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'

type PoolStatsProps = {
  poolAlert: PoolAlert | null
  tokensMapper: TokensMapper
} & Pick<PageTransferProps, 'poolData' | 'poolDataCacheOrApi' | 'routerParams'>

export const PoolStats = ({ routerParams, poolAlert, poolData, poolDataCacheOrApi, tokensMapper }: PoolStatsProps) => {
  const tokenAlert = useTokenAlert(poolData?.tokenAddressesAll ?? [])
  const { rChainId, rPoolIdOrAddress } = routerParams
  const poolId = usePoolIdByAddressOrId({ chainId: rChainId, poolIdOrAddress: rPoolIdOrAddress })
  const rewardsApy = useStore((state) => state.pools.rewardsApyMapper[rChainId]?.[poolId ?? ''])
  const tvl = useStore((state) => state.pools.tvlMapper[rChainId]?.[poolId ?? ''])

  const { curveApi } = useCurve()
  const fetchPoolStats = useStore((state) => state.pools.fetchPoolStats)

  const risksPathname = getPath(useParams<UrlParams>(), `/disclaimer`)

  // This loads various pool stats in the zustand store, like currency reserves.
  // If you remove this, all forms will be disabled as important data will be missing.
  // We can remove this once everything inside the function has been converted to queries.
  useEffect(() => {
    if (curveApi && poolData) {
      void fetchPoolStats(curveApi, poolData)
    }
  }, [curveApi, fetchPoolStats, poolData])

  return (
    <GridContainer>
      <MainStatsContainer flex flexColumn>
        <MainStatsWrapper grid>
          <Box grid gridRowGap={3}>
            <CurrencyReserves rChainId={rChainId} rPoolId={poolId ?? ''} tvl={tvl} tokensMapper={tokensMapper} />
            {poolData && <RewardsComp chainId={rChainId} poolData={poolData} rewardsApy={rewardsApy} />}
            <Box grid gridRowGap={2}>
              {poolAlert && !poolAlert.isDisableDeposit && !poolAlert.isInformationOnlyAndShowInForm && (
                <AlertBox {...poolAlert}>{poolAlert.message}</AlertBox>
              )}
              {tokenAlert && tokenAlert.isInformationOnly && <AlertBox {...tokenAlert}>{tokenAlert.message}</AlertBox>}

              {poolDataCacheOrApi.pool.referenceAsset === 'CRYPTO' && (
                <AlertBox alertType="info" title={t`${poolDataCacheOrApi.pool.name} is a Cryptoswap pool`}>
                  {t`Cryptoswap pools contain non pegged assets. Liquidity providers are exposed to all assets in the pools.`}{' '}
                  <ExternalLink $noStyles href="https://docs.curve.finance/user/dex/overview">
                    {t`Click here to learn more about Cryptoswap pools`}
                  </ExternalLink>
                </AlertBox>
              )}
              <AlertBox alertType="info" flexAlignItems="center">
                <InternalLink $noStyles href={risksPathname} target="_blank">
                  {t`Risks of using ${poolDataCacheOrApi.pool.name}`}
                </InternalLink>
              </AlertBox>
            </Box>
          </Box>
        </MainStatsWrapper>
      </MainStatsContainer>

      <OtherStatsWrapper>
        <PoolParameters poolData={poolData} poolDataCacheOrApi={poolDataCacheOrApi} routerParams={routerParams} />
      </OtherStatsWrapper>
    </GridContainer>
  )
}

const GridContainer = styled.div`
  display: grid;
  transition: 200ms;
  grid-template-columns: 1fr;
  grid-template-rows: 25.6875rem 10rem auto auto;
  @media (min-width: 75rem) {
    grid-template-columns: 1fr 18.75rem;
    grid-template-rows: 25.6875rem 10rem 1fr;
  }
`

const MainStatsContainer = styled(Box)`
  grid-row: 1 / 4;
  grid-column: 1 / 2;
`

const MainStatsWrapper = styled(Box)`
  align-items: flex-start;
  display: grid;
  padding: 1.5rem var(--spacing-narrow);

  @media (min-width: ${breakpoints.sm}rem) {
    padding: 1.5rem var(--spacing-normal);
  }

  @media (min-width: ${breakpoints.lg}rem) {
    padding: 1.5rem;
  }
`

const OtherStatsWrapper = styled(Box)`
  padding: 1.5rem 1rem;
  background-color: var(--box--secondary--content--background-color);
  grid-row: 4 / 4;
  grid-column: 1 / 1;

  > article:not(.last-of-type) {
    margin-bottom: 1.5rem;
  }

  @media (min-width: 75rem) {
    grid-row: 1 / 4;
    grid-column: 2 / 3;
  }

  @media (min-width: ${breakpoints.lg}rem) {
    height: 100%;
  }
`
