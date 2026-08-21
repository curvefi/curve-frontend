import { enforce, group, test } from 'vest'
import { createValidationSuite } from '@ui-kit/lib/validation'
import { pricesApiChainNameValidationGroup } from './prices-chain-validation'
import { ContractParams } from './root-keys'

export const contractValidationGroup = ({ blockchainId, contractAddress }: ContractParams) =>
  group('contractValidation', () => {
    pricesApiChainNameValidationGroup({ blockchainId })

    test('contractAddress', () => {
      enforce(contractAddress)
        .isNotEmpty()
        .message('Contract address is required')
        .isNotZeroAddress()
        .message('Invalid contract address')
    })
  })

export const contractValidationSuite = createValidationSuite(contractValidationGroup)
