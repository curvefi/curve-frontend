import { enforce, test } from 'vest'
import type { Decimal } from '@primitives/decimal.utils'
import { pick } from '@primitives/objects.utils'
import { useForm } from '@ui-kit/features/forms'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { createValidationSuite } from '@ui-kit/lib'
import { t } from '@ui-kit/lib/i18n'
import { MAX_SLIPPAGE, MIN_SLIPPAGE, SLIPPAGE_TYPES, SlippageSettings } from './slippage.utils'

function isSlippage(nr: Decimal) {
  enforce(nr)
    .message(t`Invalid percentage number`)
    .isDecimal()
  enforce(nr)
    .message(t`Slippage cannot be smaller than ${MIN_SLIPPAGE}%`)
    .gte(MIN_SLIPPAGE)
  enforce(nr)
    .message(t`Slippage cannot be larger than ${MAX_SLIPPAGE}%`)
    .lte(MAX_SLIPPAGE)
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
      setMaxSlippage(data)
      onChanged(data)
    }),
    reset: () => form.reset(defaultValues),
  }
}
