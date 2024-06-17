import type { PageTransferProps } from '@/components/PagePool/types'

import { t } from '@lingui/macro'
import React, { useEffect } from 'react'
import styled from 'styled-components'

import { breakpoints } from '@/ui/utils/responsive'
import useTokenAlert from '@/hooks/useTokenAlert'
import useStore from '@/store/useStore'
import { getPath } from '@/utils/utilsRouter'

import AlertBox from '@/ui/AlertBox'
import Box from '@/ui/Box'
import CurrencyReserves from '@/components/PagePool/PoolDetails/CurrencyReserves'
import ExternalLink from '@/ui/Link/ExternalLink'
import PoolParameters from '@/components/PagePool/PoolDetails/PoolStats/PoolParameters'
import RewardsComp from '@/components/PagePool/PoolDetails/PoolStats/Rewards'
import { InternalLink } from '@/ui/Link'

type PoolStatsProps = {
  poolAlert: PoolAlert | null
  tokensMapper: TokensMapper
} & Pick<PageTransferProps, 'curve' | 'poolData' | 'poolDataCacheOrApi' | 'routerParams'>

const PoolStats: React.FC<PoolStatsProps> = ({
  curve,
  routerParams,
  poolAlert,
  poolData,
  poolDataCacheOrApi,
  tokensMapper,
}) => {
  const tokenAlert = useTokenAlert(poolData?.tokenAddressesAll ?? [])

  const { rChainId, rPoolId } = routerParams
  const { chainId } = curve ?? {}

  const rewardsApy = useStore((state) => state.pools.rewardsApyMapper[rChainId]?.[rPoolId])
  const tvl = useStore((state) => state.pools.tvlMapper[rChainId]?.[rPoolId])
  const fetchPoolStats = useStore((state) => state.pools.fetchPoolStats)
  const params = useStore((state) => state.routerProps?.params)

  const poolId = poolData?.pool?.id

  const risksPathname = params && getPath(params, `/risk-disclaimer`)

  // fetch stats
  useEffect(() => {
    if (curve && poolData) {
      fetchPoolStats(curve, poolData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, poolId])

  return (
    <GridContainer>
      <MainStatsContainer flex flexColumn>
        <MainStatsWrapper grid>
          <Box grid gridRowGap={3}>
            <CurrencyReserves rChainId={rChainId} rPoolId={rPoolId} tvl={tvl} tokensMapper={tokensMapper} />
            {poolData && <RewardsComp chainId={rChainId} poolData={poolData} rewardsApy={rewardsApy} />}
            <Box grid gridRowGap={2}>
              {poolAlert && !poolAlert.isDisableDeposit && <AlertBox {...poolAlert}>{poolAlert.message}</AlertBox>}
              {tokenAlert && tokenAlert.isInformationOnly && <AlertBox {...tokenAlert}>{tokenAlert.message}</AlertBox>}

              {poolDataCacheOrApi.pool.referenceAsset === 'CRYPTO' && (
                <AlertBox alertType="info" title={t`${poolDataCacheOrApi.pool.name} is a Cryptoswap pool`}>
                  {t`Cryptoswap pools contain non pegged assets. Liquidity providers are exposed to all assets in the pools.`}{' '}
                  <ExternalLink $noStyles href="https://resources.curve.fi/base-features/understanding-crypto-pools/">
                    {t`Click here to learn more about Cryptoswap pools`}
                  </ExternalLink>
                </AlertBox>
              )}
              {params && (
                <AlertBox alertType="info" flexAlignItems="center">
                  <InternalLink $noStyles href={risksPathname} target="_blank">
                    {t`Risks of using ${poolDataCacheOrApi.pool.name}`}
                  </InternalLink>
                </AlertBox>
              )}
            </Box>
          </Box>
        </MainStatsWrapper>
      </MainStatsContainer>

      <OtherStatsWrapper>
        {poolData?.parameters && (
          <PoolParameters
            parameters={poolData.parameters}
            poolData={poolData}
            poolDataCacheOrApi={poolDataCacheOrApi}
            routerParams={routerParams}
          />
        )}
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
  padding: 1.5rem 1rem;

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

export default PoolStats
