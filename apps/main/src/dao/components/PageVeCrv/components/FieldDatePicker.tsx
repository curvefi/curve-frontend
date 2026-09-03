import { useMemo, useState } from 'react'
import { styled } from 'styled-components'
import { useConnection } from 'wagmi'
import { isDateUnavailable, isQuickActionInRange } from '@/dao/components/PageVeCrv/utils/vecrv-calculations'
import { useLockerLockedAmountAndUnlockTime } from '@/dao/entities/locker-vecrv-info'
import { toCalendarDate } from '@/dao/utils/utilsDates'
import { dayjs } from '@evm-ui/lib/dayjs'
import { t } from '@evm-ui/lib/i18n'
import { HelperMessage } from '@evm-ui/shared/ui/LargeTokenInput'
import { VECRV_MAX_LOCK_YEARS } from '@evm-ui/utils/vecrv'
import type { DateValue } from '@internationalized/date'
import { Button } from '@legacy-ui/Button'
import { DatePicker } from '@legacy-ui/DatePicker'
import { Chip } from '@legacy-ui/Typography'
import { formatDate } from '@legacy-ui/utils'

const QUICK_ACTIONS: { unit: dayjs.ManipulateType | undefined; value: number | undefined; label: string }[] = [
  { unit: 'week', value: 1, label: t`1 week` },
  { unit: 'month', value: 1, label: t`1 month` },
  { unit: 'month', value: 3, label: t`3 months` },
  { unit: 'year', value: 1, label: t`1 year` },
  { unit: 'year', value: VECRV_MAX_LOCK_YEARS, label: t`${VECRV_MAX_LOCK_YEARS} years` },
  { unit: undefined, value: undefined, label: t`Max` },
]

export const FieldDatePicker = ({
  chainId,
  currentUnlockUtcTime,
  effectiveUnlockDateLabel,
  id,
  disabled,
  isMax,
  noCurrentLock,
  utcDate,
  utcDateError,
  minUtcDate,
  maxUtcDate,
  handleInputEstimatedUnlockedDays,
  handleQuickActionClick,
  ...rest
}: {
  chainId: number
  currentUnlockUtcTime: dayjs.Dayjs | null
  id: string
  disabled?: boolean
  isDisabled?: boolean
  isMax?: boolean
  /** Set for create-lock flows, where there is no existing lock to compare against. */
  noCurrentLock?: boolean
  effectiveUnlockDateLabel: string | undefined
  utcDate: DateValue | null
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents -- Existing violation before enabling this rule.
  utcDateError: 'invalid-date' | string
  minUtcDate: dayjs.Dayjs | null
  maxUtcDate: dayjs.Dayjs | null
  handleInputEstimatedUnlockedDays: (updatedLockedDays: DateValue) => void
  handleQuickActionClick: (value: number | undefined, unit: dayjs.ManipulateType | undefined) => dayjs.Dayjs
}) => {
  const [quickActionValue, setQuickActionValue] = useState<dayjs.Dayjs | null>(null)
  const { address: userAddress } = useConnection()
  const currentLock = useLockerLockedAmountAndUnlockTime({ chainId, userAddress }, !noCurrentLock)

  // Only add durations that fit the maximum veCRV lock window.
  const quickActions = useMemo(
    () =>
      QUICK_ACTIONS.filter(({ unit, value }) => {
        if (!currentUnlockUtcTime || !minUtcDate || !maxUtcDate) return false
        if (!value || !unit) return !isMax // max button, only show if not already at max
        return isQuickActionInRange({ currentUnlockUtcTime, maxUtcDate, minUtcDate, value, unit })
      }),
    [currentUnlockUtcTime, maxUtcDate, minUtcDate, isMax],
  )

  return (
    <div data-testid={`${id}-field`}>
      <DatePicker
        {...rest}
        granularity="day"
        inputProviderProps={{ grid: true, gridRowGap: 1, id, hasError: !!utcDateError, showError: !!userAddress }}
        isDisabled={[disabled, isMax, !minUtcDate, !maxUtcDate, !noCurrentLock && !currentLock.data].some(Boolean)}
        isDateUnavailable={isDateUnavailable}
        label={t`Select unlock date`}
        minValue={minUtcDate && toCalendarDate(minUtcDate)}
        maxValue={maxUtcDate && toCalendarDate(maxUtcDate)}
        value={utcDate}
        onChange={(val: DateValue | null) => {
          if (val) handleInputEstimatedUnlockedDays(val)
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
                    type="button"
                    variant="outlined"
                    fillWidth
                    testId={`${id}-modal-quick-action-${index}`}
                    itemsInRow={itemsInThisRow}
                    onClick={() => setQuickActionValue(handleQuickActionClick(value, unit))}
                  >
                    {label}
                  </QuickActionButton>
                )
              })}
            </QuickActionsWrapper>
          </>
        }
      />
      {userAddress && utcDateError ? (
        <Chip size="xs" isError>
          {utcDateError === 'invalid-date' ? t`Invalid date` : utcDateError}
        </Chip>
      ) : effectiveUnlockDateLabel && utcDate ? (
        <HelperMessage message={`${t`Unlock date will be set to`} ${effectiveUnlockDateLabel}`} isError />
      ) : (
        !noCurrentLock && (
          <Chip size="xs">
            {t`Current unlock date:`} {currentLock.data?.unlockTime ? formatDate(currentLock.data.unlockTime) : '-'} UTC
          </Chip>
        )
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
                type="button"
                variant="outlined"
                testId={`${id}-inline-quick-action-${index}`}
                itemsInRow={itemsInThisRow}
                onClick={() => setQuickActionValue(handleQuickActionClick(value, unit))}
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
