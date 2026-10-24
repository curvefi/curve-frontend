import { styled } from 'styled-components'
import { DAO_CHART_HEIGHT } from '@/dao/components/Charts/constants'
import { useVeCrvLocksQuery } from '@/dao/entities/vecrv-locks'
import { EvmChartStateWrapper } from '@evm-ui/shared/ui/Chart/EvmChartStateWrapper'
import Box from '@mui/material/Box'
import { q } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import { PositiveAndNegativeBarChart } from './PositiveAndNegativeBarChart'

const DAILY_LOCKS_DAYS = 100

export const DailyLocks = () => {
  const locks = useVeCrvLocksQuery({ days: DAILY_LOCKS_DAYS })

  return (
    <Box sx={{ backgroundColor: t => t.design.Layer[1].Fill }}>
      <BoxTitle>{t`Daily veCRV Locks Last ${DAILY_LOCKS_DAYS} Days`}</BoxTitle>
      <Content>
        <EvmChartStateWrapper
          query={q(locks)}
          height={DAO_CHART_HEIGHT}
          isEmpty={locks.data?.length === 0}
          errorState={{ description: t`Unable to fetch daily veCRV locks.`, onReload: locks.refetch }}
        >
          {data => <PositiveAndNegativeBarChart height={DAO_CHART_HEIGHT} data={data} />}
        </EvmChartStateWrapper>
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
