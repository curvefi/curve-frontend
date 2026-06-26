import { useCallback, useRef, useState, type ChangeEvent, type MouseEvent } from 'react'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { t } from '@ui-kit/lib/i18n'
import { sortDateUrlRange } from '@ui-kit/shared/ui/DataTable/urlFilter.utils'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { PoolListDateRange } from '../hooks/usePoolListFilters'

const { IconSize, Spacing } = SizesAndSpaces

type InputIndex = 0 | 1

type PoolListDateRangeFilterProps = {
  range: PoolListDateRange
  setRange: (range: PoolListDateRange) => void
}

export const PoolListDateRangeFilter = ({ range, setRange }: PoolListDateRangeFilterProps) => {
  const [focusedInput, setFocusedInput] = useState<InputIndex | null>(null)
  const inputRef = useRef<Record<InputIndex, HTMLInputElement | null>>({ 0: null, 1: null })

  const handleInputChange = useCallback(
    (index: InputIndex) => (event: ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value || null
      const nextRange: PoolListDateRange = index === 0 ? [nextValue, range[1]] : [range[0], nextValue]

      setRange(nextRange)
    },
    [range, setRange],
  )

  const handleInputBlur = useCallback(() => {
    setFocusedInput(null)
    setRange(sortDateUrlRange(range))
  }, [range, setRange])

  const openDatePicker = useCallback(
    (index: InputIndex) => (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault()
      setFocusedInput(index)
      requestAnimationFrame(() => {
        const input = inputRef.current[index]
        input?.focus()
        try {
          // Native date inputs are used to avoid adding a date picker dependency, so the custom icon has to proxy the browser picker.
          input?.showPicker?.()
        } catch {
          // Some browsers block programmatic picker opening; focusing still enables date entry.
        }
      })
    },
    [],
  )

  const renderInputField = ({ index, label, testId }: { index: InputIndex; label: string; testId: string }) => (
    <TextField
      size="small"
      variant="outlined"
      fullWidth
      // Empty native date inputs render a browser-specific date mask instead of our placeholder.
      // Keep the resting empty state as text, then switch to date when the user edits or a value exists.
      type={focusedInput === index || range[index] ? 'date' : 'text'}
      placeholder={label}
      value={range[index] ?? ''}
      onFocus={() => setFocusedInput(index)}
      onChange={handleInputChange(index)}
      onBlur={handleInputBlur}
      inputRef={(input: HTMLInputElement | null) => {
        inputRef.current[index] = input
      }}
      slotProps={{
        htmlInput: { 'aria-label': label },
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                size="extraSmall"
                aria-label={t`Open date picker`}
                onMouseDown={event => event.preventDefault()}
                onClick={openDatePicker(index)}
                sx={{
                  color: theme => theme.design.Inputs.Text.Value,
                  '& svg': { height: IconSize.sm, width: IconSize.sm },
                }}
              >
                <CalendarMonthIcon />
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
      data-testid={`range-filter-creation-date-${testId}`}
      sx={{
        flex: 1,
        // The native calendar icon cannot be colored with theme tokens, so use the MUI adornment above instead.
        '& input[type="date"]::-webkit-calendar-picker-indicator': {
          display: 'none',
          WebkitAppearance: 'none',
        },
      }}
    />
  )

  return (
    <Stack direction="row" sx={{ gap: Spacing.sm }}>
      {renderInputField({ index: 0, label: t`From`, testId: 'min' })}
      {renderInputField({ index: 1, label: t`To`, testId: 'max' })}
    </Stack>
  )
}
