import { parseUnits as ethersParseUnits, formatUnits as ethersFormatUnits } from 'ethers'

export function getPercentage(val: bigint, percentage: bigint) {
  return (val * percentage) / 100n
}

export function sum(values: (string | bigint)[], unit: number | undefined = 18) {
  let sum = 0n

  values.forEach((val) => {
    sum += parseUnits(val, unit)
  })

  return sum
}

export function minus(val1: string, val2: string, unit: number | undefined = 18) {
  const biVal1 = parseUnits(val1, unit)
  const biVal2 = parseUnits(val2, unit)

  return biVal1 - biVal2
}

export function isGreaterThan(inputVal: bigint | string, compareValue: string, unit: number | undefined = 18) {
  const biInputValue = parseUnits(inputVal)
  const biCompareValue = parseUnits(compareValue, unit)

  return biInputValue > biCompareValue
}

export function isGreaterThanOrEqualTo(inputVal: bigint | string, compareValue: string, unit: number | undefined = 18) {
  const biInputValue = parseUnits(inputVal, unit)
  const biCompareValue = parseUnits(compareValue, unit)

  return biInputValue >= biCompareValue
}

export function parseUnits(val: string | bigint, unit: number | undefined = 18) {
  if (typeof val === 'bigint') return val

  // parseUnits will throw error if value is empty string
  let parsedVal = val || '0'

  // parseUnits will throw error if decimal part is > token decimal
  if (parsedVal.includes('.')) {
    const [integerPart, decimalPart] = parsedVal.split('.')
    const parsedIntegerPart = decimalPart.substring(0, unit)
    parsedVal = `${integerPart}.${parsedIntegerPart}`
  }

  return ethersParseUnits(parsedVal, unit)
}

export function formatUnits(val: bigint, unit: number | undefined = 18) {
  return ethersFormatUnits(val, unit)
}
