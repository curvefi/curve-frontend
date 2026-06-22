import { styled } from 'styled-components'
import { DAO_CHART_HEIGHT } from '@/dao/components/Charts/constants'
import { useVeCrvLocksQuery } from '@/dao/entities/vecrv-locks'
import Box from '@mui/material/Box'
import { t } from '@ui-kit/lib/i18n'
import { ChartStateWrapper } from '@ui-kit/shared/ui/Chart'
import { PositiveAndNegativeBarChart } from './PositiveAndNegativeBarChart'

const DAILY_LOCKS_DAYS = 100

export const DailyLocks = () => {
  const { data: locks, isLoading, error, refetch } = useVeCrvLocksQuery({ days: DAILY_LOCKS_DAYS })

  return (
    <Box sx={{ backgroundColor: t => t.design.Layer[1].Fill }}>
      <BoxTitle>{t`Daily veCRV Locks Last ${DAILY_LOCKS_DAYS} Days`}</BoxTitle>
      <Content>
        <ChartStateWrapper
          height={DAO_CHART_HEIGHT}
          isLoading={isLoading}
          isEmpty={!isLoading && !error && locks?.length === 0}
          error={error}
          errorMessage={t`Unable to fetch daily veCRV locks.`}
          refreshData={() => refetch()}
        >
          {locks && <PositiveAndNegativeBarChart height={DAO_CHART_HEIGHT} data={locks} />}
        </ChartStateWrapper>
      </Content>
    </Box>
  )
}

const BoxTitle = styled.h4`
  font-size: var(--font-size-3);
  font-weight: bold;
  padding: var(--spacing-3);
`

const Content = styled.div`
  padding: 0 var(--spacing-3) var(--spacing-3);
`
