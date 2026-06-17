import { styled } from 'styled-components'
import { MetricsColumnData, MetricsComp } from '@/dao/components/MetricsComp'
import type { VeCrvHolder } from '@/dao/entities/vecrv-holders'
import Stack from '@mui/material/Stack'
import { Box } from '@ui/Box'
import { formatDate } from '@ui/utils/'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

type UserStatsProps = {
  veCrvHolder?: VeCrvHolder
  holdersLoading: boolean
}

export const UserStats = ({ veCrvHolder, holdersLoading }: UserStatsProps) => (
  <Stack sx={{ backgroundColor: t => t.design.Layer[1].Fill, padding: Spacing.md }}>
    <h4>{t`USER STATS`}</h4>
    <MetricsContainer>
      <MetricsComp
        loading={holdersLoading}
        title={t`Total veCRV`}
        data={
          <MetricsColumnData>
            {formatNumber(veCrvHolder?.weight, { abbreviate: false, fallback: 'N/A' })}
          </MetricsColumnData>
        }
      />
      <MetricsComp
        loading={holdersLoading}
        title={t`Locked CRV`}
        data={
          <MetricsColumnData>
            {formatNumber(veCrvHolder?.locked, { abbreviate: false, fallback: 'N/A' })}
          </MetricsColumnData>
        }
      />
      <MetricsComp
        loading={holdersLoading}
        title={t`Unlock Time`}
        data={
          <MetricsColumnData>{veCrvHolder?.unlockTime ? formatDate(veCrvHolder.unlockTime) : 'N/A'}</MetricsColumnData>
        }
      />
      <MetricsComp
        loading={holdersLoading}
        title={t`Weight Ratio`}
        data={
          <MetricsColumnData>
            {veCrvHolder ? `${formatNumber(veCrvHolder.weightRatio, { abbreviate: false })}%` : 'N/A'}
          </MetricsColumnData>
        }
      />
    </MetricsContainer>
  </Stack>
)

const MetricsContainer = styled(Box)`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-3) var(--spacing-4);
  @media (min-width: 28.75rem) {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
`
