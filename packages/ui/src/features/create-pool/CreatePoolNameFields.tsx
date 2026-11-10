import Stack from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { CreatePoolField } from './CreatePoolField'

const { Spacing } = SizesAndSpaces
const encoder = new TextEncoder()

export const CreatePoolNameFields = ({
  disabled,
  nameMaxBytes,
  symbolMaxBytes,
  poolName,
  symbol,
}: {
  disabled: boolean
  nameMaxBytes: number
  symbolMaxBytes: number
  poolName: string | undefined
  symbol: string | undefined
}) => (
  <Stack sx={{ gap: Spacing.sm }}>
    {(
      [
        { name: 'symbol', label: t`LP token symbol`, limit: symbolMaxBytes, value: symbol },
        { name: 'poolName', label: t`Pool name`, limit: nameMaxBytes, value: poolName },
      ] as const
    ).map(({ name, label, limit, value }) => (
      <CreatePoolField
        key={name}
        name={name}
        inputType="text"
        label={label}
        disabled={disabled}
        placeholder={t`Fills in from the tokens`}
        helperText={value ? t`${encoder.encode(value).length} / ${limit} bytes` : t`Up to ${limit} bytes`}
      />
    ))}
  </Stack>
)
