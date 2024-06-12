import { parseUnits } from 'ethers'

export function gweiToWai(gwei: number) {
  return Math.trunc(gwei * 1e9)
}

export function weiToGwei(wai: number) {
  return Math.trunc(wai) / 1e9
}

export function gweiToEther(gwei: number) {
  return gwei / 1e9
}

export function weiToEther(wei: number) {
  return wei / 1e18
}

export function _biCalculatePercentage(startingNumber: bigint, percentage: bigint) {
  return (startingNumber * percentage) / 100n
}

export function _getTokenDecimal(val: string) {
  return val.includes('.') ? val.split('.')[1].length : 0
}

export function _parseBigIntValue(val: string | bigint, tokenDecimal: number | undefined = 18) {
  return typeof val === 'bigint' ? val : _parseUnits(val, tokenDecimal)
}

export function _parseUnits(val: string, tokenDecimal: number | undefined = 18) {
  // parseUnits will throw error if value is empty string
  let parsedVal = val || '0'

  // parseUnits will throw error if decimal part is > token decimal
  if (parsedVal.includes('.')) {
    const [integerPart, decimalPart] = parsedVal.split('.')
    const parsedIntegerPart = decimalPart.substring(0, tokenDecimal)
    parsedVal = `${integerPart}.${parsedIntegerPart}`
  }

  return parseUnits(parsedVal, tokenDecimal)
}

export function _biSum(values: (string | bigint)[], tokenDecimal: number | undefined = 18) {
  let sum = 0n

  values.forEach((val) => {
    sum += _parseBigIntValue(val, tokenDecimal)
  })

  return sum
}

export function _biMinus(val1: string, val2: string, tokenDecimal: number | undefined = 18) {
  const biVal1 = _parseUnits(val1, tokenDecimal)
  const biVal2 = _parseUnits(val2, tokenDecimal)

  return biVal1 - biVal2
}

export function _biIsGreaterThan(
  inputVal: bigint | string,
  compareValue: string,
  tokenDecimal: number | undefined = 18
) {
  const biInputValue = _parseBigIntValue(inputVal)
  const biCompareValue = _parseUnits(compareValue, tokenDecimal)

  return biInputValue > biCompareValue
}

export function _biIsGreaterThanOrEqualTo(
  inputVal: bigint | string,
  compareValue: string,
  tokenDecimal: number | undefined = 18
) {
  const biInputValue = _parseBigIntValue(inputVal, tokenDecimal)
  const biCompareValue = _parseUnits(compareValue, tokenDecimal)

  return biInputValue >= biCompareValue
}
