import { test } from 'vest'
import type { Decimal } from '@primitives/decimal.utils'
import { pick } from '@primitives/objects.utils'
import { useForm } from '@ui/features/forms'
import {
  SLIPPAGE_TYPES,
  SlippageSettings,
  SlippageType,
  MAX_SLIPPAGE,
  MIN_SLIPPAGE,
} from '@ui/features/forms/slippage/slippage.utils'
import { useUserProfileStore } from '@ui/features/user-profile'
import { t } from '@ui/lib/i18n'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@ui/lib/validation/lib'

function isSlippage(nr: Decimal | undefined) {
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

export type SlippageSettingsFormData = Partial<SlippageSettings>

const validation = createValidationSuite(({ stable, leverage, crypto }: SlippageSettingsFormData) => {
  test('stable', () => isSlippage(stable))
  test('leverage', () => isSlippage(leverage))
  test('crypto', () => isSlippage(crypto))
})

export function useSlippageSettingsForm({
  onChanged,
  current,
}: {
  onChanged: (data: SlippageSettings) => void
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
      const settings = data as SlippageSettings // validated by the suite
      setMaxSlippage(settings)
      onChanged(settings)
    }),
    reset: () => form.reset(defaultValues),
  }
}
