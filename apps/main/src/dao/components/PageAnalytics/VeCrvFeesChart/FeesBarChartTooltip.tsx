import { TooltipProps } from 'recharts'
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'
import { styled } from 'styled-components'
import type { Distribution } from '@curvefi/prices-api/revenue'
import { Box } from '@ui/Box'
import { formatDate, formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'

export const FeesBarChartTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    const { feesUsd, timestamp } = payload[0].payload as Distribution

    return (
      <TooltipWrapper>
        <Box flex flexColumn flexGap={'var(--spacing-1)'}>
          <TooltipColumn>
            <TooltipDataTitle>{t`Distribution Date`}</TooltipDataTitle>
            <TooltipData>
              {formatDate(timestamp)}
              {timestamp > new Date() && <strong> {t`(in progress)`}</strong>}
            </TooltipData>
          </TooltipColumn>
        </Box>

        <Box flex flexColumn flexGap={'var(--spacing-1)'}>
          <TooltipColumn>
            <TooltipDataTitle>{t`veCRV Fees`}</TooltipDataTitle>
            <TooltipData>{formatNumber(feesUsd, { currency: 'USD', notation: 'compact' })}</TooltipData>
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
