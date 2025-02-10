import dayjs from 'dayjs'
import isLeapYear from 'dayjs/plugin/isLeapYear'
import utc from 'dayjs/plugin/utc'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import localizedFormat from 'dayjs/plugin/localizedFormat'

dayjs.extend(isLeapYear)
dayjs.extend(utc)
dayjs.extend(customParseFormat)
dayjs.extend(localizedFormat)

export default dayjs
