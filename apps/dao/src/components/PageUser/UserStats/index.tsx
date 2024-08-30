import styled from 'styled-components'
import { t } from '@lingui/macro'

import { formatNumber, formatDateFromTimestamp, convertToLocaleTimestamp } from '@/ui/utils/'
import MetricsComp, { MetricsColumnData } from '@/components/MetricsComp'
import Box from '@/ui/Box'

interface UserStatsProps {
  veCrvHolder: VeCrvHolder
  holdersLoading: boolean
}

const UserStats = ({ veCrvHolder, holdersLoading }: UserStatsProps) => {
  return (
    <Wrapper>
      <h4>{t`USER STATS`}</h4>
      <Box grid gridTemplateColumns="1fr 1fr 1fr 1fr" flexGap="var(--spacing-3) var(--spacing-4)">
        <MetricsComp
          loading={holdersLoading}
          title={t`Total veCRV`}
          data={
            <MetricsColumnData>
              {formatNumber(veCrvHolder.weight, { showDecimalIfSmallNumberOnly: true })}
            </MetricsColumnData>
          }
        />
        <MetricsComp
          loading={holdersLoading}
          title={t`Locked CRV`}
          data={
            <MetricsColumnData>
              {formatNumber(veCrvHolder.locked, { showDecimalIfSmallNumberOnly: true })}
            </MetricsColumnData>
          }
        />
        <MetricsComp
          loading={holdersLoading}
          title={t`Unlock Time`}
          data={
            <MetricsColumnData>
              {veCrvHolder.unlock_time
                ? formatDateFromTimestamp(convertToLocaleTimestamp(new Date(veCrvHolder.unlock_time).getTime()))
                : 'N/A'}
            </MetricsColumnData>
          }
        />
        <MetricsComp
          loading={holdersLoading}
          title={t`Weight Ratio`}
          data={<MetricsColumnData>{formatNumber(veCrvHolder.weight_ratio)}%</MetricsColumnData>}
        />
      </Box>
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  gap: var(--spacing-3);
  padding: var(--spacing-3) var(--spacing-3);
  border-bottom: 1px solid var(--gray-500a20);
`

export default UserStats
