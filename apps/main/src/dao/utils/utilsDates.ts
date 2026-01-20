import type { Dayjs } from 'dayjs'
import { parseDate } from '@internationalized/date'

export const toCalendarDate = (date: Dayjs) => parseDate(date.format('YYYY-MM-DD'))
