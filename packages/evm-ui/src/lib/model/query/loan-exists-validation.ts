import { group, test } from 'vest'
import { enforce } from '@ui/lib/validation/enforce-extension'

export const loanExistsValidationGroup = ({ loanExists }: { loanExists?: boolean | undefined | null }) =>
  group('loanExistsValidation', () => {
    test('loanExists', 'Loan must exist', () => {
      enforce(loanExists).isBoolean().equals(true)
    })
  })
