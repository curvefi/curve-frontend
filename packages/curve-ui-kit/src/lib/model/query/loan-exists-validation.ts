import { enforce, group, test } from 'vest'

export const loanExistsValidationGroup = ({ loanExists }: { loanExists?: boolean | undefined | null }) =>
  group('loanExistsValidation', () => {
    test('loanExists', 'Loan must exist', () => {
      enforce(loanExists).isBoolean().equals(true)
    })
  })
