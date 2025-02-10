// @ts-nocheck
import {
  useDateRangePicker,
  useCalendarCell,
  useCalendarGrid,
  useRangeCalendar,
  useLocale,
  useButton,
  useDateField,
  useDateSegment,
} from 'react-aria'
import { useDateRangePickerState } from 'react-stately'
import { useRangeCalendarState } from 'react-stately'
import { createCalendar, getWeeksInMonth } from '@internationalized/date'
import { useDateFieldState } from 'react-stately'
import { useRef } from 'react'
import styled from 'styled-components'

// Reuse the DateField, Popover, Dialog, RangeCalendar, and Button from your component library.
import Dialog from './Dialog'
import Popover from './Popover'

function Button(props) {
  let ref = useRef(null)
  let { buttonProps } = useButton(props, ref)
  return (
    <button {...buttonProps} ref={ref}>
      {props.children}
    </button>
  )
}

function RangeCalendar(props) {
  let { locale } = useLocale()
  let state = useRangeCalendarState({
    ...props,
    locale,
    createCalendar,
  })

  let ref = useRef(null)
  let { calendarProps, prevButtonProps, nextButtonProps, title } = useRangeCalendar(props, state, ref)

  return (
    <CalendarStyles {...calendarProps} ref={ref}>
      <CalendarHeader>
        <h2>{title}</h2>
        <Button {...prevButtonProps}>&lt;</Button>
        <Button {...nextButtonProps}>&gt;</Button>
      </CalendarHeader>
      <CalendarGrid state={state} />
    </CalendarStyles>
  )
}

function CalendarGrid({ state, ...props }) {
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

function CalendarCell({ state, date }) {
  const ref = useRef<HTMLDivElement>(null)
  const { cellProps, buttonProps, isSelected, isOutsideVisibleRange, isDisabled, isUnavailable, formattedDate } =
    useCalendarCell({ date }, state, ref)

  return (
    <td {...cellProps}>
      <Cell
        {...buttonProps}
        ref={ref}
        hidden={isOutsideVisibleRange}
        className={`${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''} ${
          isUnavailable ? 'unavailable' : ''
        }`}
      >
        {formattedDate}
      </Cell>
    </td>
  )
}

function DateSegment({ segment, state }) {
  let ref = useRef(null)
  let { segmentProps } = useDateSegment(segment, state, ref)

  return (
    <DateSegmentStyles {...segmentProps} ref={ref} className={`segment ${segment.isPlaceholder ? 'placeholder' : ''}`}>
      {segment.text}
    </DateSegmentStyles>
  )
}

function DateField(props) {
  let { locale } = useLocale()
  let state = useDateFieldState({
    ...props,
    locale,
    createCalendar,
  })

  let ref = useRef(null)
  let { labelProps, fieldProps } = useDateField(props, state, ref)

  return (
    <DateFieldStyles>
      <span {...labelProps}>{props.label}</span>
      <div {...fieldProps} ref={ref} className="field">
        {state.segments.map((segment, i) => (
          <DateSegment key={i} segment={segment} state={state} />
        ))}
      </div>
    </DateFieldStyles>
  )
}

function DateRangePicker(props) {
  let state = useDateRangePickerState(props)
  let ref = useRef(null)
  let { labelProps, groupProps, startFieldProps, endFieldProps, buttonProps, dialogProps, calendarProps } =
    useDateRangePicker(props, state, ref)

  return (
    <DateRangePickerWrapper>
      <span {...labelProps}>{props.label}</span>
      <div {...groupProps} ref={ref} style={{ display: 'flex' }}>
        <div className="field">
          <DateField {...startFieldProps} />
          <span style={{ padding: '0 4px' }}>–</span>
          <DateField {...endFieldProps} />
          {state.validationState === 'invalid' && <span aria-hidden="true">🚫</span>}
        </div>
        <Button {...buttonProps}>🗓</Button>
      </div>
      {state.isOpen && (
        <Popover state={state} triggerRef={ref} placement="bottom start">
          <Dialog role="dialog" {...dialogProps}>
            <RangeCalendar {...calendarProps} />
          </Dialog>
        </Popover>
      )}
    </DateRangePickerWrapper>
  )
}

const DateSegmentStyles = styled.div`
  .segment {
    padding: 0 2px;
    font-variant-numeric: tabular-nums;
    text-align: end;
  }

  .segment.placeholder {
    color: var(--react-spectrum-datepicker-placeholder-color);
  }

  .segment:focus {
    color: white;
    background: var(--blue);
    outline: none;
    border-radius: 2px;
  }
`

const DateFieldStyles = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  .field {
    display: inline-flex;
    padding: 2px 4px;
    border-radius: 2px;
    border: 1px solid var(--gray);
    background: var(--spectrum-global-color-gray-50);
    max-width: 100%;
    overflow: auto;
  }

  .field:focus-within {
    border-color: var(--blue);
  }

  .field .field {
    all: initial;
    display: inline-flex;
    color: inherit;
  }
`

const CalendarHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0 8px;
  h2 {
    flex: 1;
    margin: 0;
  }
`

const DateRangePickerWrapper = styled.div`
  display: inline-flex;
  flex-direction: column;

  .unavailable {
    color: var(--spectrum-global-color-red-600);
  }

  .disabled {
    color: gray;
  }
`

const CalendarStyles = styled.div`
  width: 220px;
  table {
    width: 100%;
  }
`

const Cell = styled.div`
  cursor: pointer;
  text-align: center;
  .selected {
    background: var(--blue);
    color: white;
  }

  &:hover:not(:disabled) {
    color: var(--dropdown--hover--color);
    background-color: var(--dropdown--hover--background-color);
  }
`

export default DateRangePicker
