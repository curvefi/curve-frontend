import { BD } from '@/shared/curve-lib'
import { isAddress, zeroAddress } from 'viem'

export const extendEnforce = (enforce: typeof import('vest').enforce) =>
  enforce.extend({
    isAddress: <T extends unknown>(value: T) => {
      return {
        pass: !!value && typeof value === 'string' && isAddress(value),
        message: () => 'Must be a valid Ethereum address',
      }
    },
    isBigDecimal: <T extends unknown>(value: T) => {
      return {
        pass: !!value && BD.isValid(value),
        message: () => 'Must be a valid BigDecimal',
      }
    },
    isNotZeroAddress: <T extends unknown>(value: T) => {
      return {
        pass: value !== zeroAddress,
        message: () => 'Address cannot be the zero address',
      }
    },
    isPositiveNumber: <T extends unknown>(value: T) => {
      return {
        pass: typeof value === 'number' && value > 0,
        message: () => 'Must be a positive number',
      }
    },
    isValidChainId: <T extends unknown>(value: T) => {
      return {
        pass: typeof value === 'number', // && value > 0,
        message: () => 'Must be a valid chain ID',
      }
    },
  })
