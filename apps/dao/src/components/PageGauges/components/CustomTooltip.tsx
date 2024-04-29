import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'

import { TooltipProps } from 'recharts'
import styled from 'styled-components'
import { t } from '@lingui/macro'

import Box from '@/ui/Box'

const CustomTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    const sevenDayDelta = payload[0].payload.gauge_weight_7d_delta
    const sixtyDayDelta = payload[0].payload.gauge_weight_60d_delta

    return (
      <TooltipWrapper>
        <TooltipTitle>{payload[0].payload.title}</TooltipTitle>
        <Box flex flexColumn flexGap={'var(--spacing-1)'}>
          <TooltipColumn>
            <TooltipDataTitle>{t`Relative Weight`}</TooltipDataTitle>
            <TooltipData>{payload[0].payload.gauge_relative_weight}%</TooltipData>
          </TooltipColumn>
          <TooltipColumn>
            <TooltipDataTitle>{t`Gauge weight 7d delta`}</TooltipDataTitle>
            {sevenDayDelta ? (
              <TooltipData className={sevenDayDelta > 0 ? 'positive' : 'negative'}>{sevenDayDelta}%</TooltipData>
            ) : (
              <TooltipDataNotAvailable>{t`N/A`}</TooltipDataNotAvailable>
            )}
          </TooltipColumn>
          <TooltipColumn>
            <TooltipDataTitle>{t`Gauge weight 60d delta`}</TooltipDataTitle>
            {sixtyDayDelta ? (
              <TooltipData className={sixtyDayDelta > 0 ? 'positive' : 'negative'}>{sixtyDayDelta}%</TooltipData>
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
  background-color: var(--page--background-color);
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
const TooltipDataNotAvailable = styled.p`
  font-size: var(--font-size-1);
  font-weight: var(--semi-bold);
  color: var(--page--text-color);
  font-style: italic;
`

export default CustomTooltip
