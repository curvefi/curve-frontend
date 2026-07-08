import { meanBy, sumBy } from 'lodash'
import { useCallback } from 'react'
import { styled } from 'styled-components'
import { useStatsVecrvQuery } from '@/dao/entities/stats-vecrv'
import { useVeCrvFeesQuery } from '@/dao/entities/vecrv-fees'
import { useVeCrvHoldersQuery } from '@/dao/entities/vecrv-holders'
import { Box } from '@ui/Box'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { useCombinedQueries } from '@ui-kit/lib'
import { t } from '@ui-kit/lib/i18n'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { constQ, mapQuery } from '@ui-kit/types/util'
import { formatNumber, MAINNET_CRV_ADDRESS } from '@ui-kit/utils'
import { Chain } from '@ui-kit/utils/network'

const WEEKS_PER_YEAR = 52
const VECRV_APR_AVERAGE_WEEKS = 4
const VECRV_APR_FEE_WEEKS = VECRV_APR_AVERAGE_WEEKS + 1
const PROPOSAL_MIN_VECRV = 2500
const METRIC_CATEGORY = 'dao.crvStats'

const weeklyRateToApr = (weeklyRate: number) => weeklyRate * WEEKS_PER_YEAR * 100

export const CrvStats = () => {
  const { curveApi: { chainId } = {} } = useCurve()
  const statsQuery = useStatsVecrvQuery({})
  const feesQuery = useVeCrvFeesQuery({ weeks: VECRV_APR_FEE_WEEKS })
  const holdersQuery = useVeCrvHoldersQuery({})
  const isMainnet = chainId === Chain.Ethereum
  const crvUsdRateQuery = useTokenUsdRate({ chainId, tokenAddress: MAINNET_CRV_ADDRESS }, isMainnet)
  const crvUsdRate = isMainnet ? crvUsdRateQuery : constQ(0)

  const holdersSummary = mapQuery(holdersQuery, holders => ({
    totalHolders: holders.length,
    canCreateVote: sumBy(holders, holder => (+holder.weight > PROPOSAL_MIN_VECRV ? 1 : 0)),
  }))

  const veCrvApr = useCombinedQueries(
    [statsQuery, crvUsdRate, feesQuery],
    useCallback(
      (veCrvData, crvPrice, fees) => {
        if (!isMainnet) return { current: 0, fourWeekAverage: 0 }

        const totalVeCrvUsd = +veCrvData.totalVeCrv * crvPrice
        if (!totalVeCrvUsd) return { current: 0, fourWeekAverage: 0 }

        const completedFees = fees.slice(1, VECRV_APR_AVERAGE_WEEKS + 1)

        return {
          current: weeklyRateToApr(+(fees[1]?.feesUsd ?? 0) / totalVeCrvUsd),
          fourWeekAverage:
            completedFees.length && meanBy(completedFees, fee => weeklyRateToApr(+fee.feesUsd / totalVeCrvUsd)),
        }
      },
      [isMainnet],
    ),
  )

  return (
    <Wrapper>
      <Container>
        <h4>{t`VECRV METRICS`}</h4>
        <MetricsContainer>
          <Metric
            category={METRIC_CATEGORY}
            label={t`Total CRV`}
            value={mapQuery(statsQuery, ({ totalCrv }) => totalCrv)}
            valueOptions={{}}
          />
          <Metric
            category={METRIC_CATEGORY}
            label={t`Locked CRV`}
            value={mapQuery(statsQuery, ({ totalLockedCrv }) => totalLockedCrv)}
            valueOptions={{}}
          />
          <Metric
            category={METRIC_CATEGORY}
            label={t`veCRV`}
            value={mapQuery(statsQuery, ({ totalVeCrv }) => totalVeCrv)}
            valueOptions={{}}
          />
          <Metric
            category={METRIC_CATEGORY}
            label={t`Holders`}
            value={mapQuery(holdersSummary, ({ totalHolders }) => totalHolders)}
            valueOptions={{ abbreviate: false, decimals: 0 }}
            labelTooltip={{
              title: t`${holdersSummary.data?.canCreateVote ?? '...'} veCRV holders can create a new proposal (minimum 2500 veCRV is required)`,
            }}
          />
          <Metric
            category={METRIC_CATEGORY}
            label={t`CRV Supply Locked`}
            value={mapQuery(statsQuery, ({ lockedPercentage }) => lockedPercentage)}
            valueOptions={{ unit: 'percentage' }}
          />
          <Metric
            category={METRIC_CATEGORY}
            label={t`veCRV APR`}
            value={mapQuery(veCrvApr, ({ current }) => current)}
            valueOptions={{ unit: 'percentage' }}
            notional={mapQuery(
              veCrvApr,
              v => `${formatNumber(v.fourWeekAverage, 'percent.value')} ${VECRV_APR_AVERAGE_WEEKS}w avg`,
            )}
          />
        </MetricsContainer>
      </Container>
    </Wrapper>
  )
}

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
