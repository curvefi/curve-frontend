import Stack from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { CREATE_POOL_COLUMNS } from './constants'
import { CreatePoolField } from './CreatePoolField'

const { Spacing } = SizesAndSpaces
const FIELDS = [
  { name: 'poolName', label: t`Pool name` },
  { name: 'symbol', label: t`LP token symbol` },
] as const

export const CreatePoolNameFields = ({ disabled }: { disabled: boolean }) => (
  <Stack sx={{ ...CREATE_POOL_COLUMNS, gap: Spacing.sm }}>
    {FIELDS.map(({ name, label }) => (
      <CreatePoolField key={name} name={name} inputType="text" label={label} disabled={disabled} />
    ))}
  </Stack>
)
