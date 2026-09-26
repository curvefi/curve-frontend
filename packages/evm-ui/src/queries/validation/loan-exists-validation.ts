import { group, test } from 'vest'
import type { Nullish } from '@primitives/objects.utils'
import { enforce } from '@ui/lib/validation/enforce-extension'

export const loanExistsValidationGroup = ({ loanExists }: { loanExists?: boolean | Nullish }) =>
  group('loanExistsValidation', () => {
    test('loanExists', 'Loan must exist', () => {
      enforce(loanExists).isBoolean().equals(true)
    })
  })
