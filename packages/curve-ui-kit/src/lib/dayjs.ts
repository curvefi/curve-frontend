export { default as dayjs } from 'dayjs'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import isLeapYear from 'dayjs/plugin/isLeapYear'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import utc from 'dayjs/plugin/utc'

dayjs.extend(isLeapYear)
dayjs.extend(utc)
dayjs.extend(customParseFormat)
dayjs.extend(localizedFormat)
