import type { Dayjs } from 'dayjs'
import { parseDate } from '@internationalized/date'
import dayjs from '@ui-kit/lib/dayjs'

export function todayInMilliseconds() {
  const parsedToday = dayjs().format('YYYY-MM-DD')
  return dayjs(parsedToday).valueOf()
}

export function toCalendarDate(date: Dayjs) {
  return parseDate(date.format('YYYY-MM-DD'))
}

export function formatDisplayDate(date: Dayjs | string) {
  const parsedDate = typeof date === 'string' ? dayjs(date) : date
  return parsedDate.format('LL')
}
