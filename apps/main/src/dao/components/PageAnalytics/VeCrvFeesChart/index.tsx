import { styled } from 'styled-components'
import { useVeCrvFeesQuery } from '@/dao/entities/vecrv-fees'
import { Box } from '@ui/Box'
import { t } from '@ui-kit/lib/i18n'
import { ChartStateWrapper } from '@ui-kit/shared/ui/Chart'
import { FeesBarChart } from './FeesBarChart'

const CHART_HEIGHT = 500
const VECRV_FEES_WEEKS = 52

export const VeCrvFeesChart = () => {
  const { data: veCrvFees, isLoading, error, refetch } = useVeCrvFeesQuery({ order: 'asc', weeks: VECRV_FEES_WEEKS })

  return (
    <Wrapper>
      <TitleRow>
        <BoxTitle>{t`veCRV Fees Last ${VECRV_FEES_WEEKS} Weeks`}</BoxTitle>
      </TitleRow>
      <Content>
        <ChartStateWrapper
          height={CHART_HEIGHT}
          isLoading={isLoading}
          isEmpty={!isLoading && !error && veCrvFees?.length === 0}
          error={error}
          errorMessage={t`Unable to fetch veCRV fees data.`}
          refreshData={() => refetch()}
        >
          {veCrvFees && <FeesBarChart height={CHART_HEIGHT} data={veCrvFees} />}
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
