import type { Dayjs } from 'dayjs'
import { parseDate } from '@internationalized/date'
import dayjs from '@ui-kit/lib/dayjs'

export const toCalendarDate = (date: Dayjs) => parseDate(date.format('YYYY-MM-DD'))

export function formatDisplayDate(date: Dayjs | string) {
  const parsedDate = typeof date === 'string' ? dayjs(date) : date
  return parsedDate.format('LL')
}
