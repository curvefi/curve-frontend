import { test } from 'vest'
import { curveApiValidationGroup } from '@evm-ui/queries/validation/curve-api-validation'
import { userAddressValidationGroup } from '@evm-ui/queries/validation/evm-address-validation'
import { recordValues } from '@primitives/objects.utils'
import { t } from '@ui/lib/i18n'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@ui/lib/validation/lib'
import { CLAIM_FEES_TOKENS, type ClaimFeesQuery } from './claim-fees.types'

export const claimFeesValidationSuite = createValidationSuite(({ chainId, userAddress, token }: ClaimFeesQuery) => {
  curveApiValidationGroup({ chainId })
  userAddressValidationGroup({ userAddress })
  test('token', t`Select a valid fee token`, () => {
    enforce(recordValues(CLAIM_FEES_TOKENS).includes(token)).isTruthy()
  })
})
