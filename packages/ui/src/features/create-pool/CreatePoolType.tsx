import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { SelectableCard } from '@ui/components/SelectableCard'
import { useFormContext } from '@ui/features/forms'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import type { CreatePoolFormValues, PoolType } from './types'

const { Spacing } = SizesAndSpaces

export const CreatePoolType = ({ poolTypes, disabled }: { poolTypes: readonly PoolType[]; disabled: boolean }) => {
  const { values, update } = useFormContext<CreatePoolFormValues>()
  return poolTypes.map(({ id, label, description, defaultPreset, presets, disabled: unavailable }) => (
    <SelectableCard
      key={id}
      isSelected={values.poolType === id}
      disabled={disabled || unavailable}
      onClick={() =>
        update({ poolType: id, preset: defaultPreset, ...presets.find(preset => preset.id === defaultPreset)?.values })
      }
      sx={{ padding: Spacing.sm, justifyContent: 'flex-start', textAlign: 'start' }}
    >
      <Stack sx={{ gap: Spacing.xs }}>
        <Typography variant="bodyMBold">{label}</Typography>
        <Typography variant="bodySRegular">{description}</Typography>
      </Stack>
    </SelectableCard>
  ))
}
