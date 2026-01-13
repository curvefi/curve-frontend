import { dayjs } from 'curve-ui-kit/src/lib/dayjs'
import { ReactNode, useEffect, useRef } from 'react'
import type { AriaButtonProps, DateValue } from 'react-aria'
import {
  useButton,
  useCalendar,
  useCalendarCell,
  useCalendarGrid,
  useDateField,
  useDatePicker,
  useDateSegment,
  useLocale,
} from 'react-aria'
import { useCalendarState, useDateFieldState, useDatePickerState } from 'react-stately'
import { styled } from 'styled-components'
import { createCalendar, getWeeksInMonth } from '@internationalized/date'
import { AriaCalendarCellProps, AriaCalendarGridProps } from '@react-aria/calendar'
import { AriaDateFieldOptions } from '@react-aria/datepicker'
import { CalendarState, RangeCalendarState } from '@react-stately/calendar'
import { DateFieldState } from '@react-stately/datepicker'
import { AriaCalendarProps } from '@react-types/calendar'
import { AriaDatePickerProps, DatePickerProps } from '@react-types/datepicker'
import { Box } from 'ui/src/Box'
import { ModalDialog } from 'ui/src/Dialog/ModalDialog'
import { Icon } from 'ui/src/Icon'
import { IconButton } from 'ui/src/IconButton'
import { InputProvider } from 'ui/src/InputComp'
import { Chip } from 'ui/src/Typography/Chip'
import { type InputProviderProps } from '../InputComp/InputContext'

// See https://react-spectrum.adobe.com/react-aria/useDatePicker.html for details
function Button(props: AriaButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const { buttonProps } = useButton(props, ref)

  return (
    <StyledButton {...buttonProps} ref={ref}>
      {props.children}
    </StyledButton>
  )
}

type DateFieldProps<T extends DateValue> = AriaDateFieldOptions<T> & { state: DateFieldState }

function DateField<T extends DateValue>({ state, ...props }: DateFieldProps<T>) {
  const ref = useRef<HTMLDivElement>(null)
  const { labelProps, fieldProps } = useDateField(props, state, ref)

  return (
    <DateFieldWrapper>
      <span {...labelProps}>{props.label}</span>
      <DateFieldField {...fieldProps} ref={ref}>
        {state.segments.map((segment, i) => (
          <DateSegment key={i} segment={segment} state={state} />
        ))}{' '}
        {state.value ? 'UTC' : ''} {/*// TODO: refactor to avoid harding UTC timezone*/}
      </DateFieldField>
    </DateFieldWrapper>
  )
}

function DateSegment({ segment, state }: { state: DateFieldState; segment: Parameters<typeof useDateSegment>[0] }) {
  const ref = useRef<HTMLDivElement>(null)
  const { segmentProps } = useDateSegment(segment, state, ref)
  return (
    <div {...segmentProps} ref={ref} className={`segment ${segment.isPlaceholder ? 'placeholder' : ''}`}>
      {segment.text}
    </div>
  )
}

function Calendar<T extends DateValue>(props: AriaCalendarProps<T>) {
  const { locale } = useLocale()
  const state = useCalendarState({
    ...props,
    locale,
    createCalendar,
  })

  const ref = useRef<HTMLDivElement>(null)
  const { calendarProps, prevButtonProps, nextButtonProps, title } = useCalendar(props, state)

  return (
    <CalendarWrapper {...calendarProps} ref={ref} className="calendar">
      <CalendarHeader>
        <CalendarTitle>{title}</CalendarTitle>
        <Box flex>
          <Button {...prevButtonProps}>
            <Icon name="ChevronLeft" size={16} />
          </Button>
          <Button {...nextButtonProps}>
            <Icon name="ChevronRight" size={16} />
          </Button>
        </Box>
      </CalendarHeader>
      <CalendarGrid state={state} />
    </CalendarWrapper>
  )
}

function CalendarGrid({ state, ...props }: AriaCalendarGridProps & { state: CalendarState | RangeCalendarState }) {
  const { locale } = useLocale()
  const { gridProps, headerProps, weekDays } = useCalendarGrid(props, state)

  // Get the number of weeks in the month so we can render the proper number of rows.
  const weeksInMonth = getWeeksInMonth(state.visibleRange.start, locale)

  return (
    <table {...gridProps}>
      <thead {...headerProps}>
        <tr>
          {weekDays.map((day, index) => (
            <th key={index}>{day}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[...new Array(weeksInMonth).keys()].map((weekIndex) => (
          <tr key={weekIndex}>
            {state
              .getDatesInWeek(weekIndex)
              .map((date, i) => (date ? <CalendarCell key={i} state={state} date={date} /> : <td key={i} />))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function CalendarCell({ state, date }: AriaCalendarCellProps & { state: CalendarState | RangeCalendarState }) {
  const ref = useRef<HTMLDivElement>(null)
  const { cellProps, buttonProps, isSelected, isOutsideVisibleRange, isDisabled, isUnavailable, formattedDate } =
    useCalendarCell({ date }, state, ref)

  return (
    <td {...cellProps}>
      <Cell
        {...buttonProps}
        ref={ref}
        hidden={isOutsideVisibleRange}
        className={`cell ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''} ${
          isUnavailable ? 'unavailable' : ''
        }`}
      >
        {formattedDate}
      </Cell>
    </td>
  )
}

export function DatePicker<T extends DateValue>(
  props: AriaDatePickerProps<T> & { quickActionValue?: dayjs.Dayjs | null; quickActions?: ReactNode } & {
    inputProviderProps: Partial<InputProviderProps> & { hasError?: boolean; showError?: boolean; id: string }
    dateFieldProps?: Omit<DatePickerProps<T>, 'locale' | 'createCalendar'>
  },
) {
  const { locale } = useLocale()
  const state = useDatePickerState(props)
  const ref = useRef<HTMLDivElement>(null)

  const { groupProps, labelProps, fieldProps, buttonProps, calendarProps } = useDatePicker(props, state, ref)
  const dateFieldProps: AriaDateFieldOptions<T> = { ...fieldProps, ...props.dateFieldProps }

  const dateFieldState = useDateFieldState({
    ...dateFieldProps,
    locale,
    createCalendar,
  })

  // close modal after clicking on quick actions btn
  useEffect(() => {
    if (props.quickActionValue) {
      state.setOpen(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.quickActionValue])

  return (
    <>
      <InputProvider
        {...(props.inputProviderProps ?? {})}
        disabled={props.isDisabled}
        inputVariant={
          (dateFieldState.validationState === 'invalid' || props.inputProviderProps.hasError) &&
          props.inputProviderProps.showError
            ? 'error'
            : ''
        }
      >
        <Box flexAlignItems="center" grid gridTemplateColumns="1fr auto" {...groupProps} ref={ref}>
          <Box grid gridRowGap={1}>
            <Chip size="xs" {...labelProps}>
              {props.label}
            </Chip>
            <DateField {...dateFieldProps} state={dateFieldState} />
          </Box>
          <Button {...buttonProps} isDisabled={props.isDisabled}>
            <Icon name="Calendar" size={24} />
          </Button>
        </Box>

        {state.isOpen && (
          <ModalDialog title="" maxWidth="22.5rem" state={{ ...state, close: state.close }}>
            <Calendar {...calendarProps} />
            {props.quickActions}
            <HelperText>
              <Chip size="xs">Date shown in UTC timezone</Chip>
            </HelperText>
          </ModalDialog>
        )}
      </InputProvider>
    </>
  )
}

const Cell = styled.div`
  cursor: pointer;

  &:hover:not(:disabled) {
    color: var(--dropdown--hover--color);
    background-color: var(--dropdown--hover--background-color);
  }
`

const HelperText = styled.div`
  margin-top: 1rem;
`

const DateFieldField = styled.div`
  align-items: baseline;
  display: inline-flex;
`

const DateFieldWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  .segment {
    padding: 0 2px;
    font-variant-numeric: tabular-nums;
    text-align: end;
  }

  .segment.placeholder {
  }

  .segment:focus {
    color: white;
    background: var(--focus);
    outline: none;
    border-radius: 2px;
  }
`

const CalendarHeader = styled.header`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
`

const CalendarTitle = styled.h3`
  margin-left: 0.9375rem; //15px
`

const CalendarWrapper = styled.div`
  table {
    width: 100%;
  }

  .cell {
    cursor: default;
    text-align: center;
    padding: 0.5rem 0;
  }

  .selected {
    background: var(--active_filled--background-color);
    color: var(--active_filled--color);
  }

  .unavailable,
  .disabled {
    color: var(--input--disabled--color);
    opacity: 0.7;
  }
`

const StyledButton = styled(IconButton)`
  color: inherit;
`
