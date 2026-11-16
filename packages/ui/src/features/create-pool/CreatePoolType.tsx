import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { SelectableCard } from '@ui/components/SelectableCard'
import type { UseFormReturn } from '@ui/features/forms'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import type { CreatePoolFormValues, PoolTypeOption } from './types'

const { Spacing } = SizesAndSpaces

export const CreatePoolType = ({
  poolTypes,
  disabled,
  poolType,
  update,
}: {
  poolTypes: readonly PoolTypeOption[]
  disabled: boolean
  poolType: CreatePoolFormValues['poolType']
  update: UseFormReturn<CreatePoolFormValues>['update']
}) =>
  poolTypes.map(({ id, label, description, defaultPreset, presets, disabled: unavailable }) => (
    <SelectableCard
      key={id}
      data-testid={`create-pool-type-${id}`}
      isSelected={poolType === id}
      disabled={disabled || unavailable}
      onClick={() =>
        update({ poolType: id, preset: defaultPreset, ...presets.find(preset => preset.id === defaultPreset)?.values })
      }
      sx={{ padding: Spacing.sm, justifyContent: 'flex-start', textAlign: 'start' }}
    >
      <Stack sx={{ gap: Spacing.xs }}>
        <Typography variant="bodyMBold">{label}</Typography>
        <Typography variant="bodyXsRegular">{unavailable ? t`Coming soon` : description}</Typography>
      </Stack>
    </SelectableCard>
  ))
