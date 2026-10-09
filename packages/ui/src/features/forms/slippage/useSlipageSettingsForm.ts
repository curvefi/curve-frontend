import { z } from 'zod/v4'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Decimal } from '@primitives/decimal.utils'
import { pick } from '@primitives/objects.utils'
import { useForm } from '@ui/features/forms'
import {
  MAX_SLIPPAGE,
  MIN_SLIPPAGE,
  SLIPPAGE_TYPES,
  SlippageSettings,
  SlippageType,
} from '@ui/features/forms/slippage/slippage.utils'
import { useUserProfileStore } from '@ui/features/user-profile/store'
import { t } from '@ui/lib/i18n'
import { zodDecimal } from '@ui/lib/validation/lib'

export type SlippageSettingsFormData = Partial<SlippageSettings>

const slippageSchema = zodDecimal(t`Invalid percentage number`)
  .refine(value => Number(value) >= MIN_SLIPPAGE, { error: t`Slippage cannot be smaller than ${MIN_SLIPPAGE}%` })
  .refine(value => Number(value) <= MAX_SLIPPAGE, { error: t`Slippage cannot be larger than ${MAX_SLIPPAGE}%` })

const validation: z.ZodType<SlippageSettings, SlippageSettingsFormData> = z.object({
  stable: slippageSchema,
  leverage: slippageSchema,
  crypto: slippageSchema,
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
  const form = useForm<SlippageSettingsFormData>({ resolver: zodResolver(validation), defaultValues })
  return {
    form,
    onSubmit: form.handleSubmit(data => {
      const settings = data as SlippageSettings // validated by the schema
      setMaxSlippage(settings)
      onChanged(settings)
    }),
    reset: () => form.reset(defaultValues),
  }
}
