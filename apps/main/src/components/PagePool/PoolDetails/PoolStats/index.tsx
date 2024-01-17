import type { PageTransferProps } from '@/components/PagePool/types'

import { t } from '@lingui/macro'
import React, { useEffect, useMemo } from 'react'
import styled from 'styled-components'

import { breakpoints } from '@/ui/utils/responsive'
import networks from '@/networks'
import useTokenAlert from '@/hooks/useTokenAlert'
import useStore from '@/store/useStore'

import AlertBox from '@/ui/AlertBox'
import Box from '@/ui/Box'
import CurrencyReserves from '@/components/PagePool/PoolDetails/CurrencyReserves'
import ExternalLink from '@/ui/Link/ExternalLink'
import PoolParameters from '@/components/PagePool/PoolDetails/PoolStats/PoolParameters'
import RewardsComp from '@/components/PagePool/PoolDetails/PoolStats/Rewards'

const PoolStats = ({
  curve,
  routerParams,
  poolAlert,
  poolData,
  poolDataCacheOrApi,
  tokensMapper,
}: {
  className?: string
  poolAlert: PoolAlert | null
  tokensMapper: TokensMapper
} & Pick<PageTransferProps, 'curve' | 'poolData' | 'poolDataCacheOrApi' | 'routerParams'>) => {
  const tokenAlert = useTokenAlert(poolData?.tokenAddressesAll ?? [])

  const { rChainId, rPoolId } = routerParams
  const { chainId } = curve ?? {}

  const rewardsApy = useStore((state) => state.pools.rewardsApyMapper[rChainId]?.[rPoolId])
  const tvl = useStore((state) => state.pools.tvlMapper[rChainId]?.[rPoolId])
  const fetchPoolStats = useStore((state) => state.pools.fetchPoolStats)

  const poolId = poolData?.pool?.id
  const pathname = networks[rChainId].orgUIPath

  const risksPathname = useMemo(() => {
    let [, , id] = poolDataCacheOrApi.pool.id.split('-')

    if (poolDataCacheOrApi.pool.id.startsWith('factory-crypto')) {
      return `${pathname}/factory-crypto/${id}/risks`
    } else if (poolDataCacheOrApi.pool.id.startsWith('factory-')) {
      return `${pathname}/factory/${id}/risks`
    }

    id = poolDataCacheOrApi.pool.id
    if (poolDataCacheOrApi.pool.id === 'susd') id = 'susdv2'

    return `${pathname}/${id}/risks`
  }, [pathname, poolDataCacheOrApi.pool.id])

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
            <CurrencyReserves routerParams={routerParams} tvl={tvl} tokensMapper={tokensMapper} />
            {poolData && <RewardsComp chainId={rChainId} poolData={poolData} rewardsApy={rewardsApy} />}
            <Box grid gridRowGap={2}>
              {poolAlert && !poolAlert.isDisableDeposit && <AlertBox {...poolAlert}>{poolAlert.message}</AlertBox>}
              {tokenAlert && tokenAlert.isInformationOnly && <AlertBox {...tokenAlert}>{tokenAlert.message}</AlertBox>}

              {poolDataCacheOrApi.pool.referenceAsset === 'CRYPTO' && (
                <AlertBox alertType="info" title={t`${poolDataCacheOrApi.pool.name} is a v2 pool`}>
                  {t`V2 pools contain non pegged assets. Liquidity providers are exposed to all assets in the pools.`}{' '}
                  <ExternalLink $noStyles href="https://resources.curve.fi/base-features/understanding-crypto-pools">
                    {t`Click here to learn more about v2 pools`}
                  </ExternalLink>
                </AlertBox>
              )}

              {risksPathname && (
                <AlertBox alertType="info" flexAlignItems="center">
                  <ExternalLink $noStyles href={risksPathname}>
                    {t`Risks of using ${poolDataCacheOrApi.pool.name}`}
                  </ExternalLink>
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

PoolStats.defaultProps = {
  className: '',
  showUserBalances: false,
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
