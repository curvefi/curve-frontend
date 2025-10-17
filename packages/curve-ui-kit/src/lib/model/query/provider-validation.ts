import { useWallet } from '@ui-kit/features/connect-wallet'
import { enforce, group, test } from '@ui-kit/lib/validation/lib'

export const providerValidationGroup = () =>
  group('providerValidation', () => {
    test('provider', 'Provider should be available', () => {
      enforce(useWallet.getState()?.provider).message('Provider should not be null').isNotNull()
    })
  })
