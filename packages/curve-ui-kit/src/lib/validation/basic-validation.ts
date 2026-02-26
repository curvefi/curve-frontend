import { enforce, test } from 'vest'
import type { Decimal } from '@primitives/decimal.utils'

// TODO: move to Token validation lib
export const tokenIdValidationFn = <T>(value: T) => {
  enforce(value)
    .message('Token address is required')
    .isNotEmpty()
    .message('Invalid token address')
    .isAddress()
    .message('Token address cannot be zero address')
    .isNotZeroAddress()
}

export const amountValidationFn = <T>(value: T) => {
  enforce(value)
    .message('Amount is required')
    .isNotEmpty()
    .message('Amount should be a decimal number with up to 18 decimal places')
    .isDecimal({ decimal_digits: '0,18' })
}

export const addressValidationFn = <T>(value: T) => {
  enforce(value)
    .message('Address is required')
    .isNotEmpty()
    .message('Invalid address')
    .isAddress()
    .message('Address cannot be zero address')
    .isNotZeroAddress()
}

export const numberValidationFn = <T>(value: T) => {
  enforce(value).message('Number is required').isNotEmpty().message('Invalid number').isNumber()
}

export const validateSlippage = (slippage: Decimal | null | undefined) => {
  test('slippage', 'Slippage must be a number between 0 and 100', () => {
    enforce(slippage).isNumeric().gte(0).lte(100)
  })
}
