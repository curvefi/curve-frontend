import { useState } from 'react'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormHelperText from '@mui/material/FormHelperText'
import FormLabel from '@mui/material/FormLabel'
import Grid from '@mui/material/Grid'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import type { UseFormReturn } from '@ui-kit/features/forms'
import { t } from '@ui-kit/lib/i18n'
import { Badge } from '@ui-kit/shared/ui/Badge'
import { NumericTextField } from '@ui-kit/shared/ui/NumericTextField'
import { decimal, decimalGreaterThan, formatPercent } from '@ui-kit/utils'
import { SLIPPAGE, type SlippageType } from './slippage.utils'
import { type SlippageSettingsFormData } from './useSlipageSettingsForm'

export const SlippageFormField = ({
  type,
  form: {
    update,
    watchValue,
    formState: { errors },
  },
  isActive,
}: {
  type: SlippageType
  isActive: boolean
  form: UseFormReturn<SlippageSettingsFormData>
}) => {
  const { title, helper, presets, min, max } = SLIPPAGE[type]
  const value = watchValue(type)
  const [isCustom, setIsCustom] = useState(!presets.includes(value))
  const error = errors[type]
  return (
    <Stack>
      {/* Labels become blue on focus, but in this one-off we don't want that as it's the only form option */}
      <Stack sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <FormLabel>{title}</FormLabel>
        {isActive && <Badge color="active" size="extraSmall" label={t`Current`} />}
      </Stack>
      <Grid
        container
        component={RadioGroup}
        name={type}
        value={isCustom ? null : value}
        onChange={e => {
          setIsCustom(false)
          update({ [type]: e.target.value as Decimal })
        }}
        data-testid="slippage-radio-group"
      >
        {presets.map((preset, i) => (
          <Grid size={6 / presets.length} key={i}>
            <FormControlLabel value={preset} label={formatPercent(preset)} control={<Radio />} />
          </Grid>
        ))}
        <Grid size={6}>
          <NumericTextField
            fullWidth
            variant="standard"
            value={isCustom ? value : undefined}
            placeholder={t`Custom`}
            adornment="percentage"
            data-testid="slippage-input"
            slotProps={{ input: { sx: { color: t => (isCustom ? 'inherit' : t.design.Text.TextColors.Disabled) } } }}
            error={!!error}
            onChange={value => update({ [type]: decimal(value) })}
            // Toggle to 'custom' the moment you click the text input
            onFocus={() => setIsCustom(true)}
            onBlur={() => setIsCustom(!presets.includes(value))}
          />
        </Grid>
      </Grid>
      {error ? (
        <Alert severity="error" variant="outlined">
          <AlertTitle>{error.message}</AlertTitle>
        </Alert>
      ) : decimalGreaterThan(value, max) ? (
        <Alert severity="warning" variant="outlined">
          <AlertTitle>{t`High ${type} slippage selected!`}</AlertTitle>
          {t`This may lead to fewer tokens received and potential loss of funds. Proceed with caution.`}{' '}
          {t`Max. recommended slippage is ${formatPercent(max)}`}
        </Alert>
      ) : (
        decimalGreaterThan(min, value) && (
          <Alert severity="warning" variant="outlined">
            <AlertTitle>{t`Low ${type} slippage selected!`}</AlertTitle>
            {t`Your transaction may fail if price moves slightly. Consider increasing slippage if it doesn't go through.`}{' '}
            {t`Min. slippage is ${formatPercent(min)}`}
          </Alert>
        )
      )}
      <FormHelperText>{helper}</FormHelperText>
    </Stack>
  )
}
