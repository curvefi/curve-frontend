import { enforce, group, test } from 'vest'
import { createValidationSuite } from '@ui-kit/lib/validation'

export const loanExistsValidationGroup = ({ loanExists }: { loanExists?: boolean | undefined | null }) =>
  group('loanExistsValidation', () => {
    test('loanExists', 'Loan must exist', () => {
      enforce(loanExists).isBoolean().equals(true)
    })
  })

export const loanExistsValidationSuite = createValidationSuite(loanExistsValidationGroup)
