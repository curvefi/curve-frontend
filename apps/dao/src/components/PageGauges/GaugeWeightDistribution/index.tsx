import styled from 'styled-components'
import { t } from '@lingui/macro'
import { useMemo } from 'react'

import useStore from '@dao/store/useStore'

import BarChartComponent from '../../Charts/BarChartComponent'
import Spinner, { SpinnerWrapper } from '@ui/Spinner'
import ErrorMessage from '@dao/components/ErrorMessage'
import Box from '@ui/Box'
import GaugeVotingCustomTooltip from '../../Charts/GaugeVotingBarChartCustomTooltip'
import GaugesCustomTooltip from '../../Charts/GaugesBarChartCustomTooltip'
import { GaugeFormattedData, UserGaugeVoteWeight } from '@dao/types/dao.types'

type GaugeWeightDistributionProps = {
  isUserVotes: boolean
  userAddress?: string
}

const GaugeWeightDistribution = ({ isUserVotes, userAddress }: GaugeWeightDistributionProps) => {
  const { getGauges, gaugesLoading, gaugeMapper } = useStore((state) => state.gauges)
  const { userGaugeVoteWeightsMapper } = useStore((state) => state.user)
  const userData = userAddress ? userGaugeVoteWeightsMapper[userAddress] : null

  const loading = isUserVotes ? userData?.fetchingState === 'LOADING' : gaugesLoading === 'LOADING'
  const error = isUserVotes ? userData?.fetchingState === 'ERROR' : gaugesLoading === 'ERROR'
  const success = isUserVotes ? userData?.fetchingState === 'SUCCESS' : gaugesLoading === 'SUCCESS'

  const dataKey = isUserVotes ? 'userPower' : 'gauge_relative_weight'
  const formattedData: (UserGaugeVoteWeight | GaugeFormattedData)[] = useMemo(() => {
    if (isUserVotes) {
      return (
        userData?.data?.gauges.map((gauge) => ({
          ...gauge,
          title: gaugeMapper[gauge.gaugeAddress]?.title ?? '',
        })) ?? []
      )
    }

    return Object.values(gaugeMapper)
      .filter((gauge) => gauge.gauge_relative_weight > 0.5)
      .sort((a, b) => b.gauge_relative_weight - a.gauge_relative_weight)
  }, [gaugeMapper, isUserVotes, userData])

  if (!userAddress && isUserVotes) {
    return (
      <Wrapper variant="secondary">
        <Box flex flexColumn padding={'var(--spacing-3) 0 0'}>
          <ChartTitle>{isUserVotes ? t`Your Vote Weight Distribution` : t`Relative Weight Distribution`}</ChartTitle>
          <ErrorMessageWrapper>{t`No user address connected`}</ErrorMessageWrapper>
        </Box>
      </Wrapper>
    )
  }

  return (
    <Wrapper variant="secondary">
      <Box flex flexColumn padding={'var(--spacing-3) 0 0'}>
        <ChartTitle>{isUserVotes ? t`User Vote Weight Distribution` : t`Relative Weight Distribution`}</ChartTitle>
        {loading && (
          <StyledSpinnerWrapper>
            <Spinner size={24} />
          </StyledSpinnerWrapper>
        )}
        {error && (
          <ErrorMessageWrapper>
            <ErrorMessage message={t`Error fetching gauges`} onClick={() => getGauges(true)} />
          </ErrorMessageWrapper>
        )}
        {success && formattedData.length > 0 && (
          <BarChartComponent
            data={formattedData}
            dataKey={dataKey as keyof (typeof formattedData)[0]}
            CustomTooltip={isUserVotes ? GaugeVotingCustomTooltip : GaugesCustomTooltip}
          />
        )}
        {success && formattedData.length === 0 && (
          <ErrorMessageWrapper>
            <ErrorMessage
              message={isUserVotes ? t`No gauge votes found` : t`No gauges with with >0.5% relative gauge weight found`}
            />
          </ErrorMessageWrapper>
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

const StyledSpinnerWrapper = styled(SpinnerWrapper)`
  width: 100%;
  min-width: 100%;
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

export default GaugeWeightDistribution
