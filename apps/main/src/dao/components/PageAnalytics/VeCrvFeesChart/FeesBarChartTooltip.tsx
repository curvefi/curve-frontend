import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'

import { TooltipProps } from 'recharts'
import styled from 'styled-components'
import { t } from '@lingui/macro'

import { formatNumber } from '@ui/utils/utilsFormat'

import Box from '@ui/Box'
import type { Distribution } from '@curvefi/prices-api/revenue'

type Payload = Distribution & { date: string }

const FeesBarChartTooltip: React.FC<TooltipProps<ValueType, NameType>> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { date, feesUsd, timestamp } = payload[0].payload as Payload

    return (
      <TooltipWrapper>
        <Box flex flexColumn flexGap={'var(--spacing-1)'}>
          <TooltipColumn>
            <TooltipDataTitle>{t`Distribution Date`}</TooltipDataTitle>
            {date ? (
              <TooltipData>
                {date}
                {timestamp.getTime() > Date.now() && <strong> {t`(in progress)`}</strong>}
              </TooltipData>
            ) : (
              <TooltipDataNotAvailable>{t`N/A`}</TooltipDataNotAvailable>
            )}
          </TooltipColumn>
        </Box>

        <Box flex flexColumn flexGap={'var(--spacing-1)'}>
          <TooltipColumn>
            <TooltipDataTitle>{t`veCRV Fees`}</TooltipDataTitle>
            {feesUsd ? (
              <TooltipData>{formatNumber(feesUsd, { currency: 'USD', notation: 'compact' })}</TooltipData>
            ) : (
              <TooltipDataNotAvailable>{t`N/A`}</TooltipDataNotAvailable>
            )}
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
const TooltipDataNotAvailable = styled.p`
  font-size: var(--font-size-1);
  font-weight: var(--semi-bold);
  color: var(--page--text-color);
  font-style: italic;
`

export default FeesBarChartTooltip
