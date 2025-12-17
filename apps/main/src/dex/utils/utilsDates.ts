import type { Dayjs } from 'dayjs'
import dayjs from '@ui-kit/lib/dayjs'

export function formatDisplayDate(date: Dayjs | string) {
  const parsedDate = typeof date === 'string' ? dayjs(date) : date
  return parsedDate.format('LL')
}
