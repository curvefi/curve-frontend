import { TooltipProps } from 'recharts'
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'
import { styled } from 'styled-components'
import { Box } from '@ui/Box'
import { formatDateFromTimestamp, formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'

export const CustomTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    const { gauge_weight, gauge_relative_weight, epoch, emissions } = payload[0].payload

    return (
      <TooltipWrapper>
        <Box flex flexColumn flexGap={'var(--spacing-1)'}>
          <TooltipColumn>
            <TooltipDataTitle>{t`Date`}</TooltipDataTitle>
            {epoch ? (
              <TooltipData>{formatDateFromTimestamp(epoch)}</TooltipData>
            ) : (
              <TooltipDataNotAvailable>{t`N/A`}</TooltipDataNotAvailable>
            )}
          </TooltipColumn>
          <TooltipColumn>
            <TooltipDataTitle>{t`Gauge Weight`}</TooltipDataTitle>
            {gauge_weight ? (
              <TooltipData>
                {formatNumber(gauge_weight, {
                  notation: 'compact',
                })}
              </TooltipData>
            ) : (
              <TooltipDataNotAvailable>{t`N/A`}</TooltipDataNotAvailable>
            )}
          </TooltipColumn>
          <TooltipColumn>
            <TooltipDataTitle>{t`Relative Gauge Weight`}</TooltipDataTitle>
            {gauge_relative_weight ? (
              <TooltipData>
                {formatNumber(gauge_relative_weight, {
                  notation: 'compact',
                })}
              </TooltipData>
            ) : (
              <TooltipDataNotAvailable>{t`N/A`}</TooltipDataNotAvailable>
            )}
          </TooltipColumn>
          <TooltipColumn>
            <TooltipDataTitle>{t`Emissions`}</TooltipDataTitle>
            {emissions ? (
              <TooltipData>
                {formatNumber(emissions, {
                  notation: 'compact',
                })}
              </TooltipData>
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
