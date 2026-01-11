import { useMemo } from 'react'
import { styled } from 'styled-components'
import { ErrorMessage } from '@/dao/components/ErrorMessage'
import { useUserGaugeWeightVotesQuery } from '@/dao/entities/user-gauge-weight-votes'
import { refetchGauges, useGauges } from '@/dao/queries/gauges.query'
import { GaugeFormattedData, UserGaugeVoteWeight } from '@/dao/types/dao.types'
import { Box } from '@ui/Box'
import { SpinnerWrapper, Spinner } from '@ui/Spinner'
import { t } from '@ui-kit/lib/i18n'
import { Chain } from '@ui-kit/utils/network'
import { BarChartComponent } from '../../Charts/BarChartComponent'
import { GaugesBarChartCustomTooltip } from '../../Charts/GaugesBarChartCustomTooltip'
import { GaugeVotingBarChartCustomTooltip } from '../../Charts/GaugeVotingBarChartCustomTooltip'

type GaugeWeightDistributionProps = {
  isUserVotes: boolean
  userAddress?: string
}

export const GaugeWeightDistribution = ({ isUserVotes, userAddress }: GaugeWeightDistributionProps) => {
  const {
    data: userGaugeWeightVotes,
    isSuccess: userGaugeWeightsSuccess,
    isLoading: userGaugeWeightsLoading,
    isError: userGaugeWeightsError,
  } = useUserGaugeWeightVotesQuery({
    chainId: Chain.Ethereum, // DAO is only used on mainnet
    userAddress: userAddress ?? '',
  })
  const {
    data: gaugeMapper = {},
    isSuccess: isSuccessGauges,
    isLoading: isLoadingGauges,
    isError: isErrorGauges,
  } = useGauges({})

  const isLoading = isUserVotes ? userGaugeWeightsLoading : isLoadingGauges
  const isError = isUserVotes ? userGaugeWeightsError : isErrorGauges
  const isSuccess = isUserVotes ? userGaugeWeightsSuccess : isSuccessGauges

  const dataKey = isUserVotes ? 'userPower' : 'gauge_relative_weight'
  const formattedData: (UserGaugeVoteWeight | GaugeFormattedData)[] = useMemo(() => {
    if (isUserVotes) {
      return (
        userGaugeWeightVotes?.gauges.map((gauge) => ({
          ...gauge,
          title: gaugeMapper[gauge.gaugeAddress]?.title ?? '',
        })) ?? []
      )
    }

    return Object.values(gaugeMapper)
      .filter((gauge) => gauge.gauge_relative_weight > 0.5)
      .sort((a, b) => b.gauge_relative_weight - a.gauge_relative_weight)
  }, [gaugeMapper, isUserVotes, userGaugeWeightVotes?.gauges])

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
        {isLoading && (
          <StyledSpinnerWrapper>
            <Spinner size={24} />
          </StyledSpinnerWrapper>
        )}
        {isError && (
          <ErrorMessageWrapper>
            <ErrorMessage message={t`Error fetching gauges`} onClick={() => refetchGauges({})} />
          </ErrorMessageWrapper>
        )}
        {isSuccess && formattedData.length > 0 && (
          <BarChartComponent
            data={formattedData}
            dataKey={dataKey as keyof (typeof formattedData)[0]}
            CustomTooltip={isUserVotes ? GaugeVotingBarChartCustomTooltip : GaugesBarChartCustomTooltip}
          />
        )}
        {!isLoading && !isError && formattedData.length === 0 && (
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
