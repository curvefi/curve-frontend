import { useMemo } from 'react'
import { styled } from 'styled-components'
import { useVeCrvFeesQuery } from '@/dao/entities/vecrv-fees'
import { Box } from '@ui/Box'
import { t } from '@ui-kit/lib/i18n'
import { ChartStateWrapper } from '@ui-kit/shared/ui/Chart'
import { FeesBarChart } from './FeesBarChart'

const CHART_HEIGHT = 500

export const VeCrvFeesChart = () => {
  const { data = [], isLoading, error, refetch } = useVeCrvFeesQuery({})

  const reverseOrderFees = useMemo(() => {
    if (data.length === 0) return []

    return [...data].reverse().slice(-52)
  }, [data])

  return (
    <Wrapper>
      <TitleRow>
        <BoxTitle>{t`veCRV Fees Last 52 Weeks`}</BoxTitle>
      </TitleRow>
      <Content>
        <ChartStateWrapper
          height={CHART_HEIGHT}
          isLoading={isLoading}
          isEmpty={!isLoading && !error && reverseOrderFees.length === 0}
          error={error}
          errorMessage={t`Unable to fetch veCRV fees data.`}
          refreshData={() => refetch()}
        >
          <FeesBarChart height={CHART_HEIGHT} data={reverseOrderFees} />
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
