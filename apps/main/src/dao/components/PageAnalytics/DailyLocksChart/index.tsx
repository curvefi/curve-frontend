import { styled } from 'styled-components'
import { useVeCrvLocksQuery } from '@/dao/entities/vecrv-locks'
import Box from '@mui/material/Box'
import { t } from '@ui-kit/lib/i18n'
import { ChartStateWrapper } from '@ui-kit/shared/ui/Chart'
import { PositiveAndNegativeBarChart } from './PositiveAndNegativeBarChart'

const CHART_HEIGHT = 520
const DAILY_LOCKS_DAYS = 100

export const DailyLocks = () => {
  const { data: locks, isLoading, error, refetch } = useVeCrvLocksQuery({ days: DAILY_LOCKS_DAYS })

  return (
    <Box sx={{ backgroundColor: t => t.design.Layer[1].Fill }}>
      <BoxTitle>{t`Daily veCRV Locks Last ${DAILY_LOCKS_DAYS} Days`}</BoxTitle>
      <Content>
        <ChartStateWrapper
          height={CHART_HEIGHT}
          isLoading={isLoading}
          isEmpty={!isLoading && !error && locks?.length === 0}
          error={error}
          errorMessage={t`Unable to fetch daily veCRV locks.`}
          refreshData={() => refetch()}
        >
          {locks && <PositiveAndNegativeBarChart height={CHART_HEIGHT} data={locks} />}
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
