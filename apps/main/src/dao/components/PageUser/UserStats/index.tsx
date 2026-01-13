import { styled } from 'styled-components'
import { MetricsColumnData, MetricsComp } from '@/dao/components/MetricsComp'
import type { Locker } from '@curvefi/prices-api/dao'
import { Box } from '@ui/Box'
import { formatNumber, formatDate } from '@ui/utils/'
import { t } from '@ui-kit/lib/i18n'

interface UserStatsProps {
  veCrvHolder: Locker
  holdersLoading: boolean
}

export const UserStats = ({ veCrvHolder, holdersLoading }: UserStatsProps) => (
  <Wrapper>
    <h4>{t`USER STATS`}</h4>
    <MetricsContainer>
      <MetricsComp
        loading={holdersLoading}
        title={t`Total veCRV`}
        data={<MetricsColumnData>{formatNumber(veCrvHolder.weight.fromWei())}</MetricsColumnData>}
      />
      <MetricsComp
        loading={holdersLoading}
        title={t`Locked CRV`}
        data={<MetricsColumnData>{formatNumber(veCrvHolder.locked.fromWei())}</MetricsColumnData>}
      />
      <MetricsComp
        loading={holdersLoading}
        title={t`Unlock Time`}
        data={
          <MetricsColumnData>{veCrvHolder.unlockTime ? formatDate(veCrvHolder.unlockTime) : 'N/A'}</MetricsColumnData>
        }
      />
      <MetricsComp
        loading={holdersLoading}
        title={t`Weight Ratio`}
        data={<MetricsColumnData>{formatNumber(veCrvHolder.weightRatio)}%</MetricsColumnData>}
      />
    </MetricsContainer>
  </Wrapper>
)

const Wrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  gap: var(--spacing-3);
  padding: var(--spacing-3) var(--spacing-3);
  border-bottom: 1px solid var(--gray-500a20);
`

const MetricsContainer = styled(Box)`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-3) var(--spacing-4);
  @media (min-width: 28.75rem) {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
`
