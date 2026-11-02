import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Accordion } from '@ui/components/Accordion'
import { useFormContext } from '@ui/features/forms'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { CREATE_POOL_COLUMNS } from './constants'
import { CreatePoolField } from './CreatePoolField'
import type { CreatePoolFormValues, PoolParameter, PoolType } from './types'

const { Spacing } = SizesAndSpaces

const ParameterField = ({ name, label, unit, helperText, disabled }: PoolParameter & { disabled: boolean }) => (
  <CreatePoolField
    name={name}
    label={label}
    helperText={helperText}
    unit={unit}
    disabled={disabled}
    additionalUpdates={{ preset: 'custom' }}
  />
)

export const CreatePoolParameters = ({ disabled, poolType }: { disabled: boolean; poolType: PoolType | undefined }) => {
  const {
    values,
    update,
    formState: { errors },
  } = useFormContext<CreatePoolFormValues>()
  if (!poolType) return <Typography variant="bodySRegular">{t`Choose a pool type to preview its curve.`}</Typography>
  const { LiquidityDepthPreview, presets, parameters } = poolType
  return (
    <>
      <RadioGroup
        row
        value={values.preset}
        onChange={(_, preset) => update({ preset, ...presets.find(option => option.id === preset)?.values })}
      >
        {presets.map(({ id, label }) => (
          <FormControlLabel key={id} value={id} control={<Radio size="small" disabled={disabled} />} label={label} />
        ))}
        <FormControlLabel value="custom" control={<Radio size="small" disabled={disabled} />} label={t`Custom`} />
      </RadioGroup>
      {LiquidityDepthPreview && (
        <LiquidityDepthPreview
          amplification={errors.amplification ? undefined : values.amplification}
          tokenCount={values.tokens.length}
        />
      )}
      <Stack sx={{ ...CREATE_POOL_COLUMNS, gap: Spacing.sm }}>
        {parameters
          .filter(parameter => !parameter.advanced)
          .map(parameter => (
            <ParameterField key={parameter.name} {...parameter} disabled={disabled} />
          ))}
      </Stack>
      <Accordion title={t`Advanced settings`} ghost>
        {parameters
          .filter(parameter => parameter.advanced)
          .map(parameter => (
            <ParameterField key={parameter.name} {...parameter} disabled={disabled} />
          ))}
      </Accordion>
    </>
  )
}
