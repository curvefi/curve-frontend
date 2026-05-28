import { type ReactNode, useState } from 'react'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormHelperText from '@mui/material/FormHelperText'
import FormLabel from '@mui/material/FormLabel'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import type { UseFormReturn } from '@ui-kit/features/forms'
import { t } from '@ui-kit/lib/i18n'
import { HelperMessage } from '@ui-kit/shared/ui/LargeTokenInput'
import { NumericTextField } from '@ui-kit/shared/ui/NumericTextField'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { decimal, formatNumber } from '@ui-kit/utils'
import {
  HIGH_SLIPPAGE_PRESETS,
  MAX_RECOMMENDED_SLIPPAGE,
  MIN_SLIPPAGE,
  SLIPPAGE_PRESETS,
  type SlippageType,
} from './slippage.utils'
import { type SlippageSettingsFormData } from './useSlipageSettingsForm'

const { Spacing } = SizesAndSpaces

const formatOptions = { maximumFractionDigits: 1, unit: 'percentage', abbreviate: false } as const

export const SlippageFormField = ({
  type,
  title,
  form: {
    update,
    watchValue,
    formState: { errors },
  },
  isActive,
  helper,
}: {
  type: SlippageType
  helper: ReactNode
  title: ReactNode
  isActive: boolean
  form: UseFormReturn<SlippageSettingsFormData>
}) => {
  const presets = [SLIPPAGE_PRESETS[type], HIGH_SLIPPAGE_PRESETS[type]]
  const value = watchValue(type)
  const [isCustom, setIsCustom] = useState(!presets.includes(value))
  const error = errors[type]
  return (
    <Stack>
      {/* Labels become blue on focus, but in this one-off we don't want that as it's the only form option */}

      <Stack direction="row" justifyContent="space-between">
        <FormLabel>{title}</FormLabel>
        {isActive && <Chip color="active" size="extraSmall" label={t`Current`} />}
      </Stack>
      <Stack direction={{ mobile: 'column', tablet: 'row' }} justifyContent="space-between" gap={Spacing.md}>
        <RadioGroup
          row
          value={isCustom ? null : value}
          onChange={e => {
            setIsCustom(false)
            update({ [type]: e.target.value as Decimal })
          }}
          sx={{ flexGrow: 1, justifyContent: 'space-between', gap: Spacing.xs }}
          data-testid="slippage-radio-group"
        >
          {presets.map((preset, index) => (
            <FormControlLabel
              key={index}
              value={preset}
              label={formatNumber(preset, formatOptions)}
              control={<Radio />}
            />
          ))}
        </RadioGroup>

        <Box display="flex" flexGrow={1} justifyContent={{ mobile: 'start', tablet: 'end' }}>
          <NumericTextField
            fullWidth
            variant="standard"
            value={isCustom ? value : undefined}
            placeholder={t`Custom slippage`}
            adornment="percentage"
            slotProps={{ input: { sx: { color: t => (isCustom ? 'inherit' : t.design.Text.TextColors.Disabled) } } }}
            error={!!error}
            onChange={value => update({ [type]: decimal(value) })}
            // Toggle to 'custom' the moment you click the text input
            onFocus={() => setIsCustom(true)}
            onBlur={() => setIsCustom(!presets.includes(value))}
          />
        </Box>
      </Stack>
      {error && <HelperMessage message={error.message} isError />}
      {+value > +MAX_RECOMMENDED_SLIPPAGE && (
        <Alert severity="warning" variant="standard">
          <AlertTitle>{t`High slippage selected!`}</AlertTitle>
          {t`This may lead to fewer tokens received and potential loss of funds. Proceed with caution.`}{' '}
          {t`Max. recommended slippage is ${formatNumber(MAX_RECOMMENDED_SLIPPAGE, formatOptions)}`}
        </Alert>
      )}
      {+value < +MIN_SLIPPAGE && (
        <Alert severity="warning" variant="standard">
          <AlertTitle>{t`Low slippage selected!`}</AlertTitle>
          {t`Your transaction may fail if price moves slightly. Consider increasing slippage if it doesn't go through.`}{' '}
          {t`Min. slippage is ${formatNumber(MIN_SLIPPAGE, formatOptions)}`}
        </Alert>
      )}
      <FormHelperText>{helper}</FormHelperText>
    </Stack>
  )
}
