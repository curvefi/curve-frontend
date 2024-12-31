import dayjs from 'dayjs'
import isLeapYear from 'dayjs/plugin/isLeapYear'
import utc from 'dayjs/plugin/utc'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import localizedFormat from 'dayjs/plugin/localizedFormat'

import type { Locale } from './i18n'

dayjs.extend(isLeapYear)
dayjs.extend(utc)
dayjs.extend(customParseFormat)
dayjs.extend(localizedFormat)

// https://github.com/iamkun/dayjs/tree/dev/src/locale for a list of locales
export function setDayjsLocale(locale: Locale['value']) {
  if (locale === 'zh-Hans') {
    import('dayjs/locale/zh-cn').then(() => dayjs.locale('zh-cn'))
  } else if (locale === 'zh-Hant') {
    import('dayjs/locale/zh-hk').then(() => dayjs.locale('zh-hk'))
  } else {
    import('dayjs/locale/en').then(() => dayjs.locale('en'))
  }
}

export default dayjs
