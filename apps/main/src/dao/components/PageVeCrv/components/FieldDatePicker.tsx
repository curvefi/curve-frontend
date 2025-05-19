import { useMemo, useState } from 'react'
import styled from 'styled-components'
import type { FormType, VecrvInfo } from '@/dao/components/PageVeCrv/types'
import { CurveApi } from '@/dao/types/dao.types'
import { formatDisplayDate, toCalendarDate } from '@/dao/utils/utilsDates'
import type { DateValue } from '@internationalized/date'
import Button from '@ui/Button'
import DatePicker from '@ui/DatePicker'
import { Chip } from '@ui/Typography'
import dayjs from '@ui-kit/lib/dayjs'
import { t } from '@ui-kit/lib/i18n'

const QUICK_ACTIONS: { unit?: dayjs.ManipulateType; value?: number; label: string }[] = [
  { unit: 'week', value: 1, label: t`1 week` },
  { unit: 'month', value: 1, label: t`1 month` },
  { unit: 'month', value: 3, label: t`3 months` },
  { unit: 'year', value: 1, label: t`1 year` },
  { unit: 'year', value: 4, label: t`4 years` },
  { label: t`Max` },
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
  handleBtnClickQuickAction: (curve: CurveApi, value?: number, unit?: dayjs.ManipulateType) => dayjs.Dayjs
}) => {
  const [quickActionValue, setQuickActionValue] = useState<dayjs.Dayjs | null>(null)

  // only add duration <= 4 years
  const quickActions = useMemo(
    () =>
      QUICK_ACTIONS.filter(({ unit, value }) => {
        if (!value || !unit) return !isMax // max button, only show if not already at max
        const quickActionUtcDate = currUnlockUtcTime.add(value, unit)
        return (
          (quickActionUtcDate.isSame(minUtcDate, 'd') || quickActionUtcDate.isAfter(minUtcDate, 'd')) &&
          (quickActionUtcDate.isSame(maxUtcDate, 'd') || quickActionUtcDate.isBefore(maxUtcDate, 'd'))
        )
      }),
    [currUnlockUtcTime, maxUtcDate, minUtcDate, isMax],
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
        onChange={(val: DateValue | null) => {
          if (curve && val) handleInpEstUnlockedDays(curve, val)
        }}
        quickActionValue={quickActionValue}
        quickActions={
          <>
            <QuickActionsWrapper>
              {quickActions.map(({ unit, value, label }, index) => {
                const totalCount = quickActions.length
                const rowIndex = Math.floor(index / 3)
                // Calculate how many items are meant to be in the current item's visual row
                const itemsInThisRow = Math.min(totalCount - rowIndex * 3, 3)

                return (
                  <QuickActionButton
                    key={label}
                    variant="outlined"
                    fillWidth
                    itemsInRow={itemsInThisRow}
                    onClick={() => {
                      if (curve) setQuickActionValue(handleBtnClickQuickAction(curve, value, unit))
                    }}
                  >
                    {label}
                  </QuickActionButton>
                )
              })}
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
          {quickActions.map(({ unit, value, label }, index) => {
            const totalCount = quickActions.length
            const rowIndex = Math.floor(index / 3)
            const itemsInThisRow = Math.min(totalCount - rowIndex * 3, 3)

            return (
              <QuickActionButton
                key={label}
                variant="outlined"
                itemsInRow={itemsInThisRow}
                onClick={() => {
                  if (curve) setQuickActionValue(handleBtnClickQuickAction(curve, value, unit))
                }}
              >
                {label}
              </QuickActionButton>
            )
          })}
        </QuickActionsWrapper>
      )}
    </div>
  )
}

const QuickActionButton = styled(Button)<{ itemsInRow: number }>`
  color: inherit;
  padding: 0.5rem 0.25rem;
  font-size: var(--button--font-size);
  flex-grow: 1;

  /* Dynamically set flex-basis based on itemsInRow */
  ${({ itemsInRow }) => {
    if (itemsInRow === 1) {
      return 'flex-basis: 100%;'
    }
    if (itemsInRow === 2) {
      // Adjust for the 0.5rem gap from the parent (QuickActionsWrapper)
      return 'flex-basis: calc(50% - 0.25rem);'
    }
    // Default for 3 items
    // Adjust for two 0.5rem gaps from the parent, distributed among 3 items
    return 'flex-basis: calc(33.333% - (2 * 0.5rem / 3));'
  }}
`

const QuickActionsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
  margin-top: 1rem;
`

export default FieldDatePicker
