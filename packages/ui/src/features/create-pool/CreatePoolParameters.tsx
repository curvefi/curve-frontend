import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Stack from '@mui/material/Stack'
import { formatNumber, UNAVAILABLE_NOTATION } from '@primitives/number.utils'
import { Accordion } from '@ui/components/Accordion'
import type { UseFormReturn } from '@ui/features/forms'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { CREATE_POOL_COLUMNS, EMPTY_POOL_PARAMETERS } from './constants'
import { CreatePoolField } from './CreatePoolField'
import type { CreatePoolFormValues, PoolParameter, PoolParameterRanges, PoolTypeOption } from './types'

const { Spacing } = SizesAndSpaces

const ParameterField = ({
  name,
  label,
  unit,
  helperText,
  disabled,
}: PoolParameter & { disabled: boolean; helperText: string }) => (
  <CreatePoolField
    name={name}
    label={label}
    helperText={helperText}
    unit={unit}
    disabled={disabled}
    additionalUpdates={{ preset: 'custom' }}
  />
)

export const CreatePoolParameters = ({
  disabled,
  poolType,
  ranges,
  values,
  update,
  errors,
  tokenSymbol,
}: {
  disabled: boolean
  poolType: PoolTypeOption | undefined
  ranges: PoolParameterRanges
  values: Pick<CreatePoolFormValues, 'preset' | 'feeMultiplier' | 'amplification' | 'tokenCount'>
  tokenSymbol: string | undefined
  update: UseFormReturn<CreatePoolFormValues>['update']
  errors: UseFormReturn<CreatePoolFormValues>['formState']['errors']
}) => {
  if (!poolType)
    return (
      <Stack sx={{ ...CREATE_POOL_COLUMNS, gap: Spacing.sm }}>
        {EMPTY_POOL_PARAMETERS.map(parameter => (
          <CreatePoolField
            key={parameter.name}
            name={parameter.name}
            label={parameter.label}
            unit={parameter.unit}
            placeholder={UNAVAILABLE_NOTATION}
            disabled
          />
        ))}
      </Stack>
    )
  const { CurvePreview, presets, parameters } = poolType
  const helperText = {
    amplification: t`Range ${formatNumber(ranges.amplification.min, 'pool.parameter')} to ${formatNumber(ranges.amplification.max, 'pool.parameter')}`,
    fee: t`Range ${ranges.fee.min}% to ${ranges.fee.max}%`,
    feeMultiplier: t`Raises the fee up to ${formatNumber(values.feeMultiplier, 'multiplier')} when the pool is imbalanced`,
    priceOracleAveragingWindow: t`Smooths the price oracle`,
  }
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
      {CurvePreview && (
        <CurvePreview
          amplification={errors.amplification ? undefined : values.amplification}
          tokenCount={values.tokenCount}
          tokenSymbol={tokenSymbol}
        />
      )}
      <Stack sx={{ ...CREATE_POOL_COLUMNS, gap: Spacing.sm }}>
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
      </Stack>
      <Accordion title={t`Advanced settings`} ghost>
        <Stack sx={{ ...CREATE_POOL_COLUMNS, gap: Spacing.sm }}>
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
        </Stack>
      </Accordion>
    </>
  )
}
