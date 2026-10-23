import { useCallback, useMemo } from 'react'
import { styled } from 'styled-components'
import { useConnection } from 'wagmi'
import { DAO_COMPACT_CHART_HEIGHT } from '@/dao/components/Charts/constants'
import { useUserGaugeWeightVotesQuery } from '@/dao/entities/user-gauge-weight-votes'
import { useGauges } from '@/dao/queries/gauges.query'
import { GaugeMapper } from '@/dao/types/dao.types'
import { truncateToShortenedAddressLength } from '@/dao/utils'
import {
  CHART_X_AXIS_LABEL_ROTATION,
  createChartSeriesColorScale,
  formatChartAxisNumber,
} from '@evm-ui/shared/ui/Chart/chart.utils'
import { EChartsBarChart } from '@evm-ui/shared/ui/Chart/EChartsBarChart'
import { EvmChartStateWrapper } from '@evm-ui/shared/ui/Chart/EvmChartStateWrapper'
import { Box } from '@legacy-ui/Box'
import { useTheme } from '@mui/material/styles'
import { sortBy, toArray } from '@primitives/array.utils'
import { Chain } from '@primitives/network.utils'
import { recordValues } from '@primitives/objects.utils'
import { useCombinedQueries } from '@ui/features/queries/combine'
import { type QueryData, useMappedQuery } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import { GaugesBarChartCustomTooltip } from '../../Charts/GaugesBarChartCustomTooltip'
import { GaugeVotingBarChartCustomTooltip } from '../../Charts/GaugeVotingBarChartCustomTooltip'

// Show every other x-axis label for large gauge sets to reduce visual busyness of labels.
const getXAxisInterval = (length: number) => (length > 50 ? 1 : 0)

const toUserVoteRows = (votes: QueryData<typeof useUserGaugeWeightVotesQuery>, gauges: GaugeMapper) =>
  toArray(votes.gauges).map(gauge => ({ ...gauge, title: gauges[gauge.gaugeAddress]?.title ?? '' }))

const toTopGaugeRows = (gauges: GaugeMapper) =>
  sortBy(
    recordValues(gauges).filter(gauge => gauge.gauge_relative_weight > 0.5),
    gauge => gauge.gauge_relative_weight,
    'desc',
  )

type GaugeWeightDistributionProps = { isUserVotes: boolean }

export const GaugeWeightDistribution = ({ isUserVotes }: GaugeWeightDistributionProps) => {
  const theme = useTheme()
  const barColors = useMemo(() => createChartSeriesColorScale(theme), [theme])
  const getBarColor = useCallback((_: unknown, index: number) => barColors[index % barColors.length], [barColors])
  const { address: userAddress } = useConnection()
  const userVotes = useUserGaugeWeightVotesQuery({
    chainId: Chain.Ethereum, // DAO is only used on mainnet
    userAddress: userAddress ?? '',
  })
  const gauges = useGauges({})
  const userVoteRows = useCombinedQueries([userVotes, gauges], toUserVoteRows)
  const gaugeRows = useMappedQuery(gauges, toTopGaugeRows)

  if (!userAddress && isUserVotes) {
    return (
      <Wrapper variant="secondary">
        <Box flex flexColumn padding="var(--spacing-3) 0 0">
          <ChartTitle>{isUserVotes ? t`Your Vote Weight Distribution` : t`Relative Weight Distribution`}</ChartTitle>
          <ErrorMessageWrapper>{t`No user address connected`}</ErrorMessageWrapper>
        </Box>
      </Wrapper>
    )
  }

  return (
    <Wrapper variant="secondary">
      <Box flex flexColumn padding="var(--spacing-3) 0 0">
        <ChartTitle>{isUserVotes ? t`User Vote Weight Distribution` : t`Relative Weight Distribution`}</ChartTitle>
        {isUserVotes ? (
          <EvmChartStateWrapper
            query={userVoteRows}
            height={DAO_COMPACT_CHART_HEIGHT}
            emptyState={{ description: t`No gauge votes found` }}
            errorState={{
              description: t`Unable to fetch user gauge votes.`,
              onReload: () => Promise.all([userVotes.refetch(), gauges.refetch()]),
            }}
          >
            {data => (
              <EChartsBarChart
                data={data}
                xKey="title"
                yKey="userPower"
                barColor={getBarColor}
                height={DAO_COMPACT_CHART_HEIGHT}
                renderTooltip={GaugeVotingBarChartCustomTooltip}
                xAxisInterval={getXAxisInterval(data.length)}
                xAxisLabelRotate={CHART_X_AXIS_LABEL_ROTATION}
                xTickFormatter={value => truncateToShortenedAddressLength(String(value))}
                yTickFormatter={value => formatChartAxisNumber(+value, { unit: 'percentage' })}
              />
            )}
          </EvmChartStateWrapper>
        ) : (
          <EvmChartStateWrapper
            query={gaugeRows}
            height={DAO_COMPACT_CHART_HEIGHT}
            emptyState={{ description: t`No gauges with >0.5% relative gauge weight found` }}
            errorState={{ description: t`Unable to fetch gauges.`, onReload: gauges.refetch }}
          >
            {data => (
              <EChartsBarChart
                data={data}
                xKey="title"
                yKey="gauge_relative_weight"
                barColor={getBarColor}
                height={DAO_COMPACT_CHART_HEIGHT}
                renderTooltip={GaugesBarChartCustomTooltip}
                xAxisInterval={getXAxisInterval(data.length)}
                xAxisLabelRotate={CHART_X_AXIS_LABEL_ROTATION}
                xTickFormatter={value => truncateToShortenedAddressLength(String(value))}
                yTickFormatter={value => formatChartAxisNumber(+value, { unit: 'percentage' })}
              />
            )}
          </EvmChartStateWrapper>
        )}
      </Box>
      {!isUserVotes && <ChartDescription>{t`Showing gauges with >0.5% relative gauge weight`}</ChartDescription>}
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  padding: 0 var(--spacing-3);
  @media (max-width: 54.6875rem) {
    display: none;
  }
`

const ChartTitle = styled.h4`
  font-weight: var(--bold);
  text-transform: uppercase;
  margin: 0 0 var(--spacing-2);
`

const ChartDescription = styled.p`
  font-size: var(--font-size-1);
  margin-bottom: var(--spacing-3);
`

const ErrorMessageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-width: 100%;
  padding: var(--spacing-5);
  margin-bottom: var(--spacing-2);
`
