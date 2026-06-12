import { TooltipProps } from 'recharts'
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'
import { styled } from 'styled-components'
import { Box } from '@ui/Box'
import { t } from '@ui-kit/lib/i18n'
import { formatNumber, amount } from '@ui-kit/utils'

export const GaugeVotingBarChartCustomTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
  if (active && payload?.length) {
    return (
      <TooltipWrapper>
        {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule. */}
        <TooltipTitle>{payload[0].payload.title}</TooltipTitle>
        <Box flex flexColumn flexGap="var(--spacing-1)">
          <TooltipColumn>
            <TooltipDataTitle>{t`User Weight`}</TooltipDataTitle>
            {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule. */}
            <TooltipData>{payload[0].payload.userPower}%</TooltipData>
          </TooltipColumn>
          <TooltipColumn>
            <TooltipDataTitle>{t`User veCRV`}</TooltipDataTitle>
            <TooltipData>
              {/* eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule. */}
              {formatNumber(amount(payload[0].payload.userVeCrv), { abbreviate: true, fallback: '-' })} veCRV
            </TooltipData>
          </TooltipColumn>
        </Box>
      </TooltipWrapper>
    )
  }

  return null
}

const TooltipWrapper = styled.div`
  background-color: var(--summary_content--background-color);
  padding: var(--spacing-3);
  border-radius: var(--border-radius-1);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
`

const TooltipTitle = styled.p`
  font-size: var(--font-size-3);
  color: var(--page--text-color);
  font-weight: var(--bold);
`

const TooltipColumn = styled.div`
  display: flex;
  flex-direction: column;
`

const TooltipDataTitle = styled.p`
  font-size: var(--font-size-1);
  font-weight: var(--bold);
  opacity: 0.7;
  color: var(--page--text-color);
`

const TooltipData = styled.p`
  font-size: var(--font-size-2);
  color: var(--page--text-color);
  font-weight: var(--bold);
  &.positive {
    color: var(--chart-green);
  }
  &.negative {
    color: var(--chart-red);
  }
`
