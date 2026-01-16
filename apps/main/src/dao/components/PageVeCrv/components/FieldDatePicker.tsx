import { useMemo, useState } from 'react'
import { styled } from 'styled-components'
import type { FormType, VecrvInfo } from '@/dao/components/PageVeCrv/types'
import { CurveApi } from '@/dao/types/dao.types'
import { toCalendarDate } from '@/dao/utils/utilsDates'
import type { DateValue } from '@internationalized/date'
import { Button } from '@ui/Button'
import { DatePicker } from '@ui/DatePicker'
import { Chip } from '@ui/Typography'
import { formatDate } from '@ui/utils'
import { formatNumber } from '@ui/utils/utilsFormat'
import { dayjs } from '@ui-kit/lib/dayjs'
import { t } from '@ui-kit/lib/i18n'

const QUICK_ACTIONS: { unit?: dayjs.ManipulateType; value?: number; label: string }[] = [
  { unit: 'week', value: 1, label: t`1 week` },
  { unit: 'month', value: 1, label: t`1 month` },
  { unit: 'month', value: 3, label: t`3 months` },
  { unit: 'year', value: 1, label: t`1 year` },
  { unit: 'year', value: 4, label: t`4 years` },
  { label: t`Max` },
]

export const FieldDatePicker = ({
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
  lockedAmt,
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
  lockedAmt?: string
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
  const isCreateLock = formType === 'create'

  const futureVeCrv = useMemo(() => {
    if (!curve || !utcDate) return undefined

    if (isCreateLock) {
      if (!lockedAmt) return undefined
      return curve.boosting.calculateVeCrv(
        Number(lockedAmt),
        Math.floor(dayjs.utc(utcDate.toString()).valueOf() / 1000),
      )
    }
    return curve.boosting.calculateVeCrv(
      vecrvInfo.lockedAmountAndUnlockTime.lockedAmount,
      Math.floor(dayjs.utc(utcDate.toString()).valueOf() / 1000),
    )
  }, [curve, utcDate, isCreateLock, lockedAmt, vecrvInfo.lockedAmountAndUnlockTime.lockedAmount])

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
                // Determine the number of buttons in the current visual row (max 3).
                // This is used to adjust the flex-basis of each button so they collectively fill the row width.
                // Given quickActions.length (totalCount) is at most 6:
                // Example with totalCount = 5:
                // Row 0 (indices 0,1,2): itemsInThisRow will be min(5 - 0*3, 3) = min(5, 3) = 3
                // Row 1 (indices 3,4):   itemsInThisRow will be min(5 - 1*3, 3) = min(2, 3) = 2
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
      {curve && typeof futureVeCrv === 'number' && (
        <>
          <Chip size="xs">
            {t`Future veCRV:`} {!isCreateLock && `${formatNumber(vecrvInfo.veCrv)} → `} {formatNumber(futureVeCrv)}
          </Chip>
          <br />
        </>
      )}
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
            ? formatDate(vecrvInfo.lockedAmountAndUnlockTime.unlockTime)
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
