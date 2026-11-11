import FormControlLabel from '@mui/material/FormControlLabel'
import Grid from '@mui/material/Grid'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Stack from '@mui/material/Stack'
import { formatNumber, UNAVAILABLE_NOTATION } from '@primitives/number.utils'
import { Accordion } from '@ui/components/Accordion'
import type { UseFormReturn } from '@ui/features/forms'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { EMPTY_POOL_PARAMETERS } from './constants'
import { CreatePoolField } from './CreatePoolField'
import type { CreatePoolFormValues, PoolParameter, PoolParameterRanges, PoolPreset, PoolTypeOption } from './types'

const { Spacing } = SizesAndSpaces
const CREATE_POOL_GRID_SIZE = { mobile: 12, tablet: 6 } as const

const ParameterField = ({
  name,
  label,
  unit,
  helperText,
  disabled,
}: PoolParameter & { disabled: boolean; helperText: string }) => (
  <Grid size={CREATE_POOL_GRID_SIZE}>
    <CreatePoolField
      name={name}
      label={label}
      helperText={helperText}
      unit={unit}
      disabled={disabled}
      additionalUpdates={{ preset: 'custom' }}
    />
  </Grid>
)

export const CreatePoolParameters = ({
  disabled,
  poolType,
  preset,
  ranges,
  values,
  update,
  errors,
  tokenSymbol,
}: {
  disabled: boolean
  poolType: PoolTypeOption | undefined
  preset: PoolPreset | undefined
  ranges: PoolParameterRanges
  values: Pick<CreatePoolFormValues, 'feeMultiplier' | 'amplification' | 'tokenCount'>
  tokenSymbol: string | undefined
  update: UseFormReturn<CreatePoolFormValues>['update']
  errors: UseFormReturn<CreatePoolFormValues>['formState']['errors']
}) => {
  if (!poolType) {
    return (
      // empty state until the pool type is chosen
      <Grid container spacing={Spacing.sm}>
        {EMPTY_POOL_PARAMETERS.map(parameter => (
          <Grid key={parameter.name} size={CREATE_POOL_GRID_SIZE}>
            <CreatePoolField
              name={parameter.name}
              label={parameter.label}
              unit={parameter.unit}
              placeholder={UNAVAILABLE_NOTATION}
              disabled
            />
          </Grid>
        ))}
      </Grid>
    )
  }
  const { CurvePreview, presets, parameters } = poolType
  const helperText = {
    amplification: t`Range ${formatNumber(ranges.amplification.min, 'pool.parameter')} to ${formatNumber(ranges.amplification.max, 'pool.parameter')}`,
    fee: t`Range ${ranges.fee.min}% to ${ranges.fee.max}%`,
    feeMultiplier: t`Raises the fee up to ${formatNumber(values.feeMultiplier, 'multiplier')} when the pool is imbalanced`,
    priceOracleAveragingWindow: t`Smooths the price oracle`,
  }
  return (
    <>
      <RadioGroup row value={preset?.id ?? 'custom'}>
        {presets.map(({ id, label, values: presetValues }) => (
          <FormControlLabel
            key={id}
            value={id}
            control={
              <Radio size="small" disabled={disabled} onChange={() => update({ preset: id, ...presetValues })} />
            }
            label={label}
          />
        ))}
        <FormControlLabel
          value="custom"
          control={<Radio size="small" disabled={disabled} onChange={() => update({ preset: 'custom' })} />}
          label={t`Custom`}
        />
      </RadioGroup>
      <Stack sx={{ gap: Spacing.md }}>
        {CurvePreview && (
          <CurvePreview
            amplification={errors.amplification ? undefined : values.amplification}
            tokenCount={values.tokenCount}
            tokenSymbol={tokenSymbol}
          />
        )}
        <Grid container spacing={Spacing.sm}>
          {parameters
            .filter(parameter => !parameter.advanced)
            .map(parameter => (
              <ParameterField
                key={parameter.name}
                {...parameter}
                helperText={helperText[parameter.name]}
                disabled={disabled}
              />
            ))}
        </Grid>
      </Stack>
      <Accordion title={t`Advanced settings`} ghost>
        <Grid container spacing={Spacing.sm}>
          {parameters
            .filter(parameter => parameter.advanced)
            .map(parameter => (
              <ParameterField
                key={parameter.name}
                {...parameter}
                helperText={helperText[parameter.name]}
                disabled={disabled}
              />
            ))}
        </Grid>
      </Accordion>
    </>
  )
}
