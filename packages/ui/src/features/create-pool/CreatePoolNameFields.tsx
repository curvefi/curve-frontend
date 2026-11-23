import Stack from '@mui/material/Stack'
import type { UseFormReturn } from '@ui/features/forms'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { CreatePoolField } from './CreatePoolField'
import type { CreatePoolFormValues } from './types'

const { Spacing } = SizesAndSpaces
const encoder = new TextEncoder()

export const CreatePoolNameFields = ({
  form,
  disabled,
  nameMaxBytes,
  symbolMaxBytes,
}: {
  form: UseFormReturn<CreatePoolFormValues>
  disabled: boolean
  nameMaxBytes: number
  symbolMaxBytes: number
}) => (
  <Stack sx={{ gap: Spacing.sm }}>
    {(
      [
        { name: 'symbol', label: t`LP token symbol`, limit: symbolMaxBytes, value: form.values.symbol },
        { name: 'poolName', label: t`Pool name`, limit: nameMaxBytes, value: form.values.poolName },
      ] as const
    ).map(({ name, label, limit, value }) => (
      <CreatePoolField
        key={name}
        form={form}
        name={name}
        inputType="text"
        label={label}
        disabled={disabled}
        placeholder={t`Fills in from the tokens`}
        helperText={value ? `${encoder.encode(value).length} / ` + t`${limit} bytes` : t`Up to ${limit} bytes`}
      />
    ))}
  </Stack>
)
