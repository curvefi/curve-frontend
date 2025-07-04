import { useMemo } from 'react'
import { formatDisplayDate } from '@/dao/utils'
import { StyledInformationSquare16 } from '@/dex/components/PagePool/PoolDetails/PoolStats/styles'
import { PoolData } from '@/dex/types/main.types'
import { formatDisplayDate } from '@/dex/utils/utilsDates'
import Item from '@ui/Items/Item'
import Chip from '@ui/Typography/Chip'
import { formatNumber } from '@ui/utils'
import dayjs from '@ui-kit/lib/dayjs'
import { t } from '@ui-kit/lib/i18n'

const PoolParametersA = ({ parameters }: { parameters: PoolData['parameters'] }) => {
  const { A, initial_A, initial_A_time, future_A, future_A_time, virtualPrice } = parameters ?? {}

  const rampADetails = useMemo(() => {
    if (initial_A_time && initial_A && future_A_time && future_A) {
      return {
        isFutureATimePassedToday: dayjs().isAfter(future_A_time, 'day'),
        isFutureATimeToday: dayjs().isSame(future_A_time, 'day'),
        isRampUp: Number(future_A) > Number(initial_A),
      }
    }
  }, [future_A, future_A_time, initial_A, initial_A_time])

  return (
    <>
      {virtualPrice && (
        <Item>
          {t`A:`}{' '}
          <Chip
            isBold
            size="md"
            tooltip={
              <>
                {t`Amplification coefficient chosen from fluctuation of prices around 1.`}
                {rampADetails && rampADetails?.isFutureATimePassedToday && (
                  <>
                    <br />{' '}
                    {t`Last change occurred between ${formatDisplayDate(dayjs(initial_A_time))} and ${formatDisplayDate(
                      dayjs(future_A_time),
                    )}, when A ramped from ${initial_A} to ${future_A}.`}
                  </>
                )}
              </>
            }
            tooltipProps={{ minWidth: '200px' }}
          >
            {formatNumber(A, { useGrouping: false })}
            <StyledInformationSquare16 name="InformationSquare" size={16} className="svg-tooltip" />
          </Chip>
        </Item>
      )}
      {rampADetails && !rampADetails.isFutureATimePassedToday && (
        <>
          <Item>
            {t`Ramping A:`}{' '}
            <Chip
              isBold
              size="md"
              tooltip={t`Slowly changing up A so that it doesn't negatively change virtual price growth of shares`}
            >
              {formatNumber(initial_A, { useGrouping: false })} → {formatNumber(future_A, { useGrouping: false })}{' '}
              <StyledInformationSquare16 name="InformationSquare" size={16} className="svg-tooltip" />
            </Chip>
          </Item>
          <Item>
            <strong>
              {formatDisplayDate(dayjs(initial_A_time))} to {formatDisplayDate(dayjs(future_A_time))}
            </strong>
          </Item>
        </>
      )}
    </>
  )
}

export default PoolParametersA
