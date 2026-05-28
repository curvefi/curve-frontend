import { enforce, test } from 'vest'
import type { Decimal } from '@primitives/decimal.utils'
import { pick, recordEntries } from '@primitives/objects.utils'
import { useForm } from '@ui-kit/features/forms'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { createValidationSuite } from '@ui-kit/lib'
import { t } from '@ui-kit/lib/i18n'
import { SLIPPAGE_TYPES, SlippageSettings } from './slippage.utils'

function isSlippage(nr: Decimal) {
  enforce(nr)
    .message(t`Invalid percentage number`)
    .isDecimal()
    .gte(0)
    .lte(100)
}

export type SlippageSettingsFormData = SlippageSettings

const validation = createValidationSuite(({ stable, leverage, crypto }: SlippageSettingsFormData) => {
  test('stable', () => isSlippage(stable))
  test('leverage', () => isSlippage(leverage))
  test('crypto', () => isSlippage(crypto))
})

export function useSlippageSettingsForm({ onChanged }: { onChanged: (data: SlippageSettingsFormData) => void }) {
  const maxSlippage = useUserProfileStore(state => state.maxSlippage)
  const setMaxSlippage = useUserProfileStore(state => state.setMaxSlippage)
  const defaultValues = pick(maxSlippage, ...SLIPPAGE_TYPES)
  const form = useForm<SlippageSettingsFormData>({ validation, defaultValues })
  return {
    form,
    onSubmit: form.handleSubmit(data => {
      recordEntries(data).map(([key, value]) => setMaxSlippage(value, key))
      onChanged(data)
    }),
    reset: () => form.reset(defaultValues),
  }
}
