import type { DateValue } from '@internationalized/date'
import type { FormType, VecrvInfo } from '@/dao/components/PageVeCrv/types'

import { t } from '@lingui/macro'
import React, { useMemo, useState } from 'react'
import styled from 'styled-components'

import { breakpoints } from '@ui/utils/responsive'
import { formatDisplayDate, toCalendarDate } from '@/dao/utils/utilsDates'
import dayjs from '@ui-kit/lib/dayjs'

import { Chip } from '@ui/Typography'
import Button from '@ui/Button'
import DatePicker from '@ui/DatePicker'
import { CurveApi } from '@/dao/types/dao.types'

const QUICK_ACTIONS: { unit: dayjs.ManipulateType; value: number; label: string }[] = [
  { unit: 'week', value: 1, label: t`1 week` },
  { unit: 'month', value: 1, label: t`1 month` },
  { unit: 'month', value: 3, label: t`3 months` },
  { unit: 'month', value: 6, label: t`6 months` },
  { unit: 'year', value: 1, label: t`1 year` },
  { unit: 'year', value: 4, label: t`4 years` },
]

const FieldDatePicker = ({
  curve,
  currUnlockUtcTime,
  calcdUtcDate,
  disabled,
  formType,
  isMax,
  utcDate,
  utcDateError,
  minUtcDate,
  maxUtcDate,
  vecrvInfo,
  handleInpEstUnlockedDays,
  handleBtnClickQuickAction,
  ...rest
}: {
  curve: CurveApi | null
  currUnlockUtcTime: dayjs.Dayjs
  disabled?: boolean
  formType: FormType | ''
  isDisabled?: boolean
  isMax?: boolean
  calcdUtcDate: string
  utcDate: DateValue | null
  utcDateError: 'invalid-date' | string
  minUtcDate: dayjs.Dayjs
  maxUtcDate: dayjs.Dayjs | null
  vecrvInfo: VecrvInfo
  handleInpEstUnlockedDays: (curve: CurveApi, updatedLockedDays: DateValue) => void
  handleBtnClickQuickAction: (curve: CurveApi, value: number, unit: dayjs.ManipulateType) => dayjs.Dayjs
}) => {
  const [quickActionValue, setQuickActionValue] = useState<dayjs.Dayjs | null>(null)

  // only add duration <= 4 years
  const quickActions = useMemo(
    () =>
      QUICK_ACTIONS.filter(({ unit, value }) => {
        const quickActionUtcDate = currUnlockUtcTime.add(value, unit)
        return (
          (quickActionUtcDate.isSame(minUtcDate, 'd') || quickActionUtcDate.isAfter(minUtcDate, 'd')) &&
          (quickActionUtcDate.isSame(maxUtcDate, 'd') || quickActionUtcDate.isBefore(maxUtcDate, 'd'))
        )
      }),
    [currUnlockUtcTime, maxUtcDate, minUtcDate],
  )

  const isDateUnavailable = (date: DateValue) => {
    const todayUtcDate = dayjs.utc(date.toString()).day()
    const dayZeroUtcDate = dayjs.utc(new Date(0)).day()
    return todayUtcDate !== dayZeroUtcDate
  }

  const loading = typeof vecrvInfo === 'undefined' || !curve

  return (
    <div>
      <DatePicker
        {...rest}
        granularity="day"
        inputProviderProps={{
          grid: true,
          gridRowGap: 1,
          id: `${formType}-date-picker`,
          hasError: !!utcDateError,
          showError: !!curve?.signerAddress,
        }}
        isDisabled={loading || disabled || isMax}
        isDateUnavailable={isDateUnavailable}
        label={t`Select unlock date`}
        minValue={toCalendarDate(minUtcDate)}
        maxValue={maxUtcDate ? toCalendarDate(maxUtcDate) : null}
        value={utcDate}
        onChange={(val: DateValue) => {
          if (curve) handleInpEstUnlockedDays(curve, val)
        }}
        quickActionValue={quickActionValue}
        quickActions={
          <>
            <QuickActionsWrapper>
              {quickActions.map(({ unit, value, label }) => (
                <QuickActionButton
                  key={label}
                  variant="outlined"
                  onClick={() => {
                    if (curve) setQuickActionValue(handleBtnClickQuickAction(curve, value, unit))
                  }}
                >
                  {label}
                </QuickActionButton>
              ))}
            </QuickActionsWrapper>
          </>
        }
      />
      {!!curve?.signerAddress && utcDateError ? (
        <Chip size="xs" isError>
          {utcDateError === 'invalid-date' ? t`Invalid date` : utcDateError}
        </Chip>
      ) : calcdUtcDate && utcDate ? (
        <Chip size="xs" isBold>
          Unlock date will be set to {calcdUtcDate}
        </Chip>
      ) : formType !== 'create' && currUnlockUtcTime ? (
        <Chip size="xs">
          {t`Current unlock date:`}{' '}
          {vecrvInfo.lockedAmountAndUnlockTime.unlockTime
            ? formatDisplayDate(dayjs(vecrvInfo.lockedAmountAndUnlockTime.unlockTime))
            : '-'}{' '}
          UTC
        </Chip>
      ) : (
        ''
      )}

      {Array.isArray(quickActions) && quickActions.length > 0 && (
        <QuickActionsWrapper>
          {quickActions.map(({ unit, value, label }) => (
            <QuickActionButton
              key={label}
              variant="outlined"
              onClick={() => {
                if (curve) setQuickActionValue(handleBtnClickQuickAction(curve, value, unit))
              }}
            >
              {label}
            </QuickActionButton>
          ))}
        </QuickActionsWrapper>
      )}
    </div>
  )
}

const QuickActionButton = styled(Button)`
  color: inherit;
  margin: 0.25rem;
  padding: 0.5rem 0.25rem;
  font-size: var(--button--font-size);
`

const QuickActionsWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin-top: 1rem;

  @media (min-width: ${breakpoints.xs}rem) {
    grid-template-columns: 1fr 1fr 1fr;
  }
`

export default FieldDatePicker
