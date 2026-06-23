import { useMemo } from 'react'
import { styled } from 'styled-components'
import { DAO_CHART_HEIGHT } from '@/dao/components/Charts/constants'
import { useVeCrvFeesQuery } from '@/dao/entities/vecrv-fees'
import { Box } from '@ui/Box'
import { t } from '@ui-kit/lib/i18n'
import { ChartStateWrapper } from '@ui-kit/shared/ui/Chart'
import { FeesBarChart } from './FeesBarChart'

const VECRV_FEES_WEEKS = 52

export const VeCrvFeesChart = () => {
  const { data: veCrvFees, isLoading, error, refetch } = useVeCrvFeesQuery({ weeks: VECRV_FEES_WEEKS })
  // The API returns newest distributions first; charts read more naturally from oldest to newest.
  const chartData = useMemo(() => veCrvFees?.toReversed(), [veCrvFees])

  return (
    <Wrapper>
      <TitleRow>
        <BoxTitle>{t`veCRV Fees Last ${VECRV_FEES_WEEKS} Weeks`}</BoxTitle>
      </TitleRow>
      <Content>
        <ChartStateWrapper
          height={DAO_CHART_HEIGHT}
          isLoading={isLoading}
          isEmpty={!isLoading && !error && chartData?.length === 0}
          error={error}
          errorMessage={t`Unable to fetch veCRV fees data.`}
          refreshData={() => refetch()}
        >
          {chartData && <FeesBarChart height={DAO_CHART_HEIGHT} data={chartData} />}
        </ChartStateWrapper>
      </Content>
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  width: 100%;
  margin-bottom: auto;
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-3);
`

const BoxTitle = styled.h4`
  font-size: var(--font-size-3);
  font-weight: bold;
`

const Content = styled.div`
  padding: 0 var(--spacing-3) var(--spacing-3);
`
