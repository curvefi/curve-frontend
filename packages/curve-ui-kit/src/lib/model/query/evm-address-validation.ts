import { enforce, group, skipWhen, test } from 'vest'
import { isAddress } from 'viem'
import { createValidationSuite } from '@ui-kit/lib/validation'
import type { UserParams } from './root-keys'

type EvmAddressValidationParams<T extends string, TField extends string = 'evmAddress'> = {
  evmAddress?: T | null
  fieldName?: TField
  required?: boolean
}

export const evmAddressValidationGroup = <T extends string, TField extends string = 'evmAddress'>({
  evmAddress,
  fieldName,
  required = true,
}: EvmAddressValidationParams<T, TField>) => {
  const field = fieldName ?? 'evmAddress'
  return group(`${field}Validation`, () => {
    skipWhen(
      () => !required && !evmAddress,
      () => {
        test(field, 'Address is required', () => {
          enforce(evmAddress).isNotEmpty()
        })

        test(field, 'Invalid EVM address', () => {
          if (evmAddress) {
            enforce(isAddress(evmAddress)).equals(true)
          }
        })
      },
    )
  })
}

export const evmAddressValidationSuite = createValidationSuite(evmAddressValidationGroup)

export const userAddressValidationGroup = <T extends string>({
  userAddress,
  required = true,
}: UserParams<T> & { required?: boolean }) =>
  evmAddressValidationGroup({
    evmAddress: userAddress,
    fieldName: 'userAddress',
    required,
  })

export const userAddressValidationSuite = createValidationSuite(userAddressValidationGroup)
