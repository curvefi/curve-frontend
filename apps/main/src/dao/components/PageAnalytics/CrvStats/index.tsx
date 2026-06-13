import lodash from 'lodash'
import { useMemo } from 'react'
import { styled } from 'styled-components'
import { useStatsVecrvQuery } from '@/dao/entities/stats-vecrv'
import { useStore } from '@/dao/store/useStore'
import { Box } from '@ui/Box'
import { useCurve, useWallet } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { mapQuery, q } from '@ui-kit/types/util'
import { formatNumber, MAINNET_CRV_ADDRESS } from '@ui-kit/utils'
import { Chain } from '@ui-kit/utils/network'

export const CrvStats = () => {
  const statsQuery = useStatsVecrvQuery({})
  const { data: veCrvData, isLoading: statsLoading, error } = statsQuery
  const { provider } = useWallet()
  const { curveApi: { chainId } = {} } = useCurve()
  const veCrvFees = useStore(state => state.analytics.veCrvFees)
  const veCrvHolders = useStore(state => state.analytics.veCrvHolders)
  const {
    data: crv,
    isFetching: isLoadingCrv,
    error: crvError,
  } = useTokenUsdRate({ chainId, tokenAddress: MAINNET_CRV_ADDRESS })

  // protect against trying to load data on non-mainnet networks
  const notMainnet = chainId !== Chain.Ethereum
  const noProvider = !provider || notMainnet
  const veCrvFeesLoading = veCrvFees.fetchStatus === 'LOADING'
  const aprLoading = statsLoading || veCrvFeesLoading || isLoadingCrv || crv == null

  const veCrvApr = useMemo(
    () =>
      aprLoading || notMainnet || !veCrvData
        ? { current: 0, fourDayAverage: 0 }
        : {
            current: calculateApr(veCrvFees.fees[1].feesUsd, veCrvData.totalVeCrv.fromWei(), crv),
            fourDayAverage: calculateFourWeekAverageApr(
              veCrvFees.fees.slice(1, 5).map(fee => fee.feesUsd),
              veCrvData.totalVeCrv.fromWei(),
              crv,
            ),
          },
    [aprLoading, notMainnet, veCrvFees, veCrvData, crv],
  )

  const isLoading = Boolean(provider && statsLoading)
  const veCrvStats = q({
    ...statsQuery,
    data: noProvider ? undefined : statsQuery.data,
    isLoading,
    error: noProvider ? null : error,
  })

  return (
    <Wrapper>
      <Container>
        <h4>{t`VECRV METRICS`}</h4>
        <MetricsContainer>
          <Metric
            size="small"
            label={t`Total CRV`}
            value={mapQuery(veCrvStats, ({ totalCrv }) => totalCrv.fromWei())}
            valueOptions={{}}
          />
          <Metric
            size="small"
            label={t`Locked CRV`}
            value={mapQuery(veCrvStats, ({ totalLockedCrv }) => totalLockedCrv.fromWei())}
            valueOptions={{}}
          />
          <Metric
            size="small"
            label={t`veCRV`}
            value={mapQuery(veCrvStats, ({ totalVeCrv }) => totalVeCrv.fromWei())}
            valueOptions={{}}
          />
          <Metric
            size="small"
            label={t`Holders`}
            value={q({
              data: veCrvHolders.totalHolders,
              isLoading: veCrvHolders.fetchStatus === 'LOADING',
              error: null,
            })}
            valueOptions={{ abbreviate: false, decimals: 0 }}
            labelTooltip={{
              title: t`${veCrvHolders.canCreateVote} veCRV holders can create a new proposal (minimum 2500 veCRV is required)`,
            }}
          />
          <Metric
            size="small"
            label={t`CRV Supply Locked`}
            value={mapQuery(veCrvStats, ({ lockedPercentage }) => lockedPercentage)}
            valueOptions={{ unit: 'percentage' }}
          />
          <Metric
            size="small"
            label={t`veCRV APR`}
            value={q({
              data: noProvider ? undefined : veCrvApr?.current,
              isLoading: Boolean(isLoading || veCrvFeesLoading || aprLoading),
              error: noProvider ? null : (error ?? crvError),
            })}
            valueOptions={{ unit: 'percentage' }}
            notional={
              isLoading || veCrvFeesLoading || aprLoading
                ? undefined
                : `${formatNumber(veCrvApr.fourDayAverage, 'percent.value')} 4w avg`
            }
          />
        </MetricsContainer>
      </Container>
    </Wrapper>
  )
}

const calculateApr = (fees: number, totalVeCrv: number, crvPrice: number) =>
  (((fees / totalVeCrv) * 52) / crvPrice) * 100

const calculateFourWeekAverageApr = (fees: number[], totalVeCrv: number, crvPrice: number) =>
  lodash.meanBy(fees, fee => calculateApr(fee, totalVeCrv, crvPrice))

const Wrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  background-color: var(--box--secondary--background-color);
`

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  background-color: var(--box--secondary--background-color);
  @media (min-width: 20.625rem) {
    grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
  }
  @media (min-width: 48rem) {
    display: flex;
    column-gap: var(--spacing-4);
  }
`

const MetricsContainer = styled(Box)`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-3) var(--spacing-4);
  @media (min-width: 28.125rem) {
    grid-template-columns: 1fr 1fr 1fr;
  }
`
