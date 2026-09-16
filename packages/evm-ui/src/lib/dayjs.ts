// Keep plugin type augmentations in the declarations consumed by other projects.
/// <reference types="dayjs/plugin/customParseFormat" preserve="true" />
/// <reference types="dayjs/plugin/isLeapYear" preserve="true" />
/// <reference types="dayjs/plugin/localizedFormat" preserve="true" />
/// <reference types="dayjs/plugin/utc" preserve="true" />

/* eslint-disable import-x/no-named-as-default-member */
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
