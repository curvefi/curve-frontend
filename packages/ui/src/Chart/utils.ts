import type { TimeOptions } from './types'

export const combinations = <T>(inputArray: T[], size: number): T[][] => {
  const combinationHelper = (start: number, chosen: T[]): T[][] => {
    if (chosen.length === size) {
      return [chosen]
    }
    let result: T[][] = []
    for (let i = start; i < inputArray.length; i++) {
      const newChosen = [...chosen, inputArray[i]]
      result = [...result, ...combinationHelper(i + 1, newChosen)]
    }
    return result
  }

  return combinationHelper(0, [])
}

const seconds = {
  '5m': 5 * 60,
  '15m': 15 * 60,
  '30m': 30 * 60,
  '1h': 60 * 60,
  '4h': 4 * 60 * 60,
  '6h': 6 * 60 * 60,
  '12h': 12 * 60 * 60,
  '1d': 24 * 60 * 60,
  '7d': 7 * 24 * 60 * 60,
  '14d': 14 * 24 * 60 * 60,
}

export const subtractTimeUnit = (timeOption: TimeOptions, timestamp: number) => timestamp - seconds[timeOption]

export const getThreeHundredResultsAgo = (timeOption: TimeOptions, timestamp: number) =>
  Math.floor(timestamp - 299 * seconds[timeOption])

export const getAggNumber = (timeOption: TimeOptions) => {
  if (timeOption === '15m') return 15 // interval 900
  if (timeOption === '30m') return 30
  if (timeOption === '1h') return 1 // interval 3600
  if (timeOption === '4h') return 4 // interval 14400
  if (timeOption === '6h') return 6
  if (timeOption === '12h') return 12
  if (timeOption === '1d') return 1 // interval 86400
  if (timeOption === '7d') return 7
  if (timeOption === '14d') return 14
}

export const getTimeUnit = (timeOption: TimeOptions) => {
  if (timeOption === '15m') return 'minute'
  if (timeOption === '30m') return 'minute'
  if (timeOption === '1h') return 'hour'
  if (timeOption === '4h') return 'hour'
  if (timeOption === '6h') return 'hour'
  if (timeOption === '12h') return 'hour'
  if (timeOption === '1d') return 'day'
  if (timeOption === '7d') return 'day'
  if (timeOption === '14d') return 'day'
}

export const getMilliseconds = (timeOption: TimeOptions) => seconds[timeOption] * 1000

export const getLiquidationRange = (
  price1: string,
  price2: string,
  priceDataLength: number,
  timeOption: TimeOptions,
) => {
  const endDate = new Date()
  const interval = getMilliseconds(timeOption)
  const startDate = new Date(endDate.getTime() - priceDataLength * interval)

  const dataSeries1 = []
  const dataSeries2 = []

  for (let i = 0; i < priceDataLength; i++) {
    const date = new Date(startDate.getTime() + i * interval)
    const timeStamp = Math.floor(date.getTime() / 1000)

    const value1 = price1 ? +price1.replace(/,/g, '') : 0
    const value2 = price2 ? +price2.replace(/,/g, '') : 0

    dataSeries1.push({ time: timeStamp, value: value1 })
    dataSeries2.push({ time: timeStamp, value: value2 })
  }

  return {
    upperRange: dataSeries1,
    lowerRange: dataSeries2,
  }
}

export const convertToLocaleTimestamp = (unixTimestamp: number) => {
  const offsetInSeconds = new Date().getTimezoneOffset() * 60
  const localTimestamp = unixTimestamp - offsetInSeconds
  return localTimestamp
}
