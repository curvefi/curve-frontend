import { useCallback, useMemo } from 'react'
import { styled } from 'styled-components'
import { useConnection } from 'wagmi'
import { DAO_COMPACT_CHART_HEIGHT } from '@/dao/components/Charts/constants'
import { useUserGaugeWeightVotesQuery } from '@/dao/entities/user-gauge-weight-votes'
import { useGauges } from '@/dao/queries/gauges.query'
import { GaugeFormattedData, UserGaugeVoteWeight } from '@/dao/types/dao.types'
import { truncateToShortenedAddressLength } from '@/dao/utils'
import { useTheme } from '@mui/material/styles'
import { sortBy, toArray } from '@primitives/array.utils'
import { recordValues, notFalsy } from '@primitives/objects.utils'
import { Box } from '@ui/Box'
import { t } from '@ui-kit/lib/i18n'
import {
  CHART_X_AXIS_LABEL_ROTATION,
  ChartStateWrapper,
  createChartSeriesColorScale,
  EChartsBarChart,
  formatChartAxisNumber,
} from '@ui-kit/shared/ui/Chart'
import { Chain } from '@ui-kit/utils/network'
import { GaugesBarChartCustomTooltip } from '../../Charts/GaugesBarChartCustomTooltip'
import { GaugeVotingBarChartCustomTooltip } from '../../Charts/GaugeVotingBarChartCustomTooltip'

// Show every other x-axis label for large gauge sets to reduce visual busyness of labels.
const getXAxisInterval = (length: number) => (length > 50 ? 1 : 0)

type GaugeWeightDistributionProps = {
  isUserVotes: boolean
}

export const GaugeWeightDistribution = ({ isUserVotes }: GaugeWeightDistributionProps) => {
  const theme = useTheme()
  const barColors = useMemo(() => createChartSeriesColorScale(theme), [theme])
  const getBarColor = useCallback((_: unknown, index: number) => barColors[index % barColors.length], [barColors])
  const { address: userAddress } = useConnection()
  const {
    data: userGaugeWeightVotes,
    isLoading: userGaugeWeightsLoading,
    error: userGaugeWeightsError,
    refetch: refetchUserGaugeWeights,
  } = useUserGaugeWeightVotesQuery({
    chainId: Chain.Ethereum, // DAO is only used on mainnet
    userAddress: userAddress ?? '',
  })
  const {
    data: gaugeMapper,
    isLoading: gaugesIsLoading,
    error: gaugesError,
    refetch: refetchGaugeMapper,
  } = useGauges({})

  const isLoading = isUserVotes ? userGaugeWeightsLoading || gaugesIsLoading : gaugesIsLoading
  const error = isUserVotes ? (userGaugeWeightsError ?? gaugesError) : gaugesError

  const userVoteData: UserGaugeVoteWeight[] = useMemo(
    () =>
      toArray(userGaugeWeightVotes?.gauges).map(gauge => ({
        ...gauge,
        title: gaugeMapper?.[gauge.gaugeAddress]?.title ?? '',
      })),
    [gaugeMapper, userGaugeWeightVotes?.gauges],
  )

  const gaugeData: GaugeFormattedData[] = useMemo(
    () =>
      sortBy(
        recordValues(gaugeMapper ?? {}).filter(gauge => gauge.gauge_relative_weight > 0.5),
        gauge => gauge.gauge_relative_weight,
        'desc',
      ),
    [gaugeMapper],
  )

  const dataLength = isUserVotes ? userVoteData.length : gaugeData.length
  const refreshData = () =>
    Promise.all(notFalsy<Promise<unknown>>(isUserVotes && refetchUserGaugeWeights(), refetchGaugeMapper()))

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
        <ChartStateWrapper
          height={DAO_COMPACT_CHART_HEIGHT}
          isLoading={isLoading}
          isEmpty={!isLoading && !error && dataLength === 0}
          emptyMessage={isUserVotes ? t`No gauge votes found` : t`No gauges with >0.5% relative gauge weight found`}
          error={error}
          errorMessage={isUserVotes ? t`Unable to fetch user gauge votes.` : t`Unable to fetch gauges.`}
          refreshData={refreshData}
        >
          {isUserVotes ? (
            <EChartsBarChart
              data={userVoteData}
              xKey="title"
              yKey="userPower"
              barColor={getBarColor}
              height={DAO_COMPACT_CHART_HEIGHT}
              renderTooltip={GaugeVotingBarChartCustomTooltip}
              xAxisInterval={getXAxisInterval(userVoteData.length)}
              xAxisLabelRotate={CHART_X_AXIS_LABEL_ROTATION}
              xTickFormatter={value => truncateToShortenedAddressLength(String(value))}
              yTickFormatter={value => formatChartAxisNumber(+value, { unit: 'percentage' })}
            />
          ) : (
            <EChartsBarChart
              data={gaugeData}
              xKey="title"
              yKey="gauge_relative_weight"
              barColor={getBarColor}
              height={DAO_COMPACT_CHART_HEIGHT}
              renderTooltip={GaugesBarChartCustomTooltip}
              xAxisInterval={getXAxisInterval(gaugeData.length)}
              xAxisLabelRotate={CHART_X_AXIS_LABEL_ROTATION}
              xTickFormatter={value => truncateToShortenedAddressLength(String(value))}
              yTickFormatter={value => formatChartAxisNumber(+value, { unit: 'percentage' })}
            />
          )}
        </ChartStateWrapper>
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
