import { enforce, test } from 'vest'
import { useUserProfileStore } from '@evm-ui/features/user-profile'
import { createValidationSuite } from '@evm-ui/lib'
import type { Decimal } from '@primitives/decimal.utils'
import { pick } from '@primitives/objects.utils'
import { useForm } from '@ui/features/forms'
import { t } from '@ui/lib/i18n'
import { MAX_SLIPPAGE, MIN_SLIPPAGE, SLIPPAGE_TYPES, SlippageSettings, SlippageType } from './slippage.utils'

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

export function useSlippageSettingsForm({
  onChanged,
  current,
}: {
  onChanged: (data: SlippageSettingsFormData) => void
  current?: { type: SlippageType; value: Decimal }
}) {
  const maxSlippage = useUserProfileStore(state => state.maxSlippage)
  const setMaxSlippage = useUserProfileStore(state => state.setMaxSlippage)
  const defaultValues: SlippageSettingsFormData = {
    ...pick(maxSlippage, ...SLIPPAGE_TYPES),
    ...(current && { [current.type]: current.value }),
  }
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
