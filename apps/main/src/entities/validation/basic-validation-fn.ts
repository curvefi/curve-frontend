import { enforce } from 'vest'

// TODO: move to Token validation lib
export const tokenIdValidationFn = <T extends unknown>(value: T) => {
  enforce(value).isNotEmpty('Token address is required').isAddress().isNotZeroAddress()
}

export const amountValidationFn = <T extends unknown>(value: T) => {
  enforce(value).isNotEmpty('Amount is required').isBigDecimal()
}

export const addressValidationFn = <T extends unknown>(value: T) => {
  enforce(value).isNotEmpty('Address is required').isAddress().isNotZeroAddress()
}

export const numberValidationFn = <T extends unknown>(value: T) => {
  enforce(value).isNotEmpty('Number is required').isNumber()
}
