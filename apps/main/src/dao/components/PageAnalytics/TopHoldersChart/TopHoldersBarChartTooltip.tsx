import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'

import { TooltipProps } from 'recharts'
import styled from 'styled-components'
import { t } from '@lingui/macro'
import { formatNumber, formatDateFromTimestamp, convertToLocaleTimestamp } from '@ui/utils'

import Box from '@ui/Box'
import type { Locker } from '@curvefi/prices-api/dao'

type Payload = Omit<Locker, 'weight' | 'locked'> & {
  weight: number
  locked: number
}

const TopHoldersBarChartTooltip: React.FC<TooltipProps<ValueType, NameType>> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { user, locked, weight, weightRatio, unlockTime } = payload[0].payload as Payload

    return (
      <TooltipWrapper>
        <Box flex flexColumn flexGap={'var(--spacing-1)'}>
          <TooltipColumn>
            <TooltipDataTitle>{t`Holder`}</TooltipDataTitle>
            <TooltipData>{user}</TooltipData>
          </TooltipColumn>
          <TooltipColumn>
            <TooltipDataTitle>{t`Relative Weight`}</TooltipDataTitle>
            <TooltipData>{weightRatio}%</TooltipData>
          </TooltipColumn>
          <TooltipColumn>
            <TooltipDataTitle>{t`veCRV`}</TooltipDataTitle>
            <TooltipData>{formatNumber(weight, { showDecimalIfSmallNumberOnly: true })}</TooltipData>
          </TooltipColumn>
          <TooltipColumn>
            <TooltipDataTitle>{t`Locked CRV`}</TooltipDataTitle>
            <TooltipData>{formatNumber(locked, { showDecimalIfSmallNumberOnly: true })}</TooltipData>
          </TooltipColumn>
          <TooltipColumn>
            <TooltipDataTitle>{t`Unlock Date`}</TooltipDataTitle>
            {unlockTime ? (
              <TooltipData>
                {formatDateFromTimestamp(convertToLocaleTimestamp(unlockTime.getUTCTimestamp()))}
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
  max-width: 10rem;
  @media (min-width: 25rem) {
    max-width: 15rem;
  }
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
  word-break: break-all;
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

export default TopHoldersBarChartTooltip
