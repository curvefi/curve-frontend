import { useEffect, useState } from 'react'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormLabel from '@mui/material/FormLabel'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { ModalDialog } from '@ui-kit/shared/ui/ModalDialog'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing, IconSize } = SizesAndSpaces

type FormValues = {
  selected: string
  customValue: string
  error?: keyof typeof inputErrorMapper
}

const SLIPPAGE_PRESETS = {
  STABLE: 0.1,
  CRYPTO: 0.5,
}

const MIN_SLIPPAGE = 0.01
const MAX_RECOMMENDED_SLIPPAGE = 5

const FORMATTED_01 = formatNumber(SLIPPAGE_PRESETS.STABLE, { style: 'percent', maximumFractionDigits: 1 })
const FORMATTED_05 = formatNumber(SLIPPAGE_PRESETS.CRYPTO, { style: 'percent', maximumFractionDigits: 1 })

const inputErrorMapper = {
  'too-high': { message: t`Too high`, helperText: t`This can result in unexpected losses` },
  'too-low': { message: t`Too low`, helperText: t`Min. slippage is ${MIN_SLIPPAGE}%` },
}

/** Validates a custom slippage value */
function validateCustomValue(value: string): FormValues['error'] {
  const numValue = Number(value)

  if (numValue === 0) return undefined // empty value, not really an error
  if (numValue > MAX_RECOMMENDED_SLIPPAGE) return 'too-high'
  if (numValue < MIN_SLIPPAGE) return 'too-low'

  return undefined
}

/**
 * Initializes form values based on the provided max slippage
 *
 * @param maxSlippage - The current maximum slippage value as a string
 * @returns FormValues object containing:
 *   - selected: Either '0.1', '0.5', or 'custom' based on the maxSlippage value
 *   - customValue: The custom slippage value if not one of the preset options
 *   - error: Validation error if the custom value is invalid
 */
function initFormValues(maxSlippage: string): FormValues {
  const isCustomValue = !Object.values(SLIPPAGE_PRESETS).includes(Number(maxSlippage))

  return {
    selected: isCustomValue ? 'custom' : maxSlippage,
    customValue: isCustomValue ? maxSlippage : '',
    error: isCustomValue ? validateCustomValue(maxSlippage) : undefined,
  }
}

export type SlippageSettingsProps = {
  /** Whether the modal is currently open */
  isOpen: boolean
  /** Current maximum slippage value as a string */
  maxSlippage: string
}

export type SlippageSettingsCallbacks = {
  /** Function to close the modal */
  onClose: () => void
  /** Callback function when slippage value is saved */
  onSave: (slippage: string) => void
}

export type Props = SlippageSettingsProps & SlippageSettingsCallbacks

/**
 * Modal component for configuring slippage settings
 *
 * Slippage rules:
 * - Min slippage: 0.01% (values below this are considered too low)
 * - Max recommended slippage: 5% (values above this trigger a warning)
 */
export const SlippageSettingsModal = ({ isOpen, maxSlippage, onSave, onClose }: Props) => {
  const [formValues, setFormValues] = useState(initFormValues(maxSlippage))
  const { error, selected, customValue } = formValues

  useEffect(() => {
    setFormValues(initFormValues(maxSlippage))
  }, [maxSlippage])

  // To save: require a selected value, and if 'custom', the custom value must be non-empty and pass validation
  // Allow 'too-high' error as it's discouraged but sometimes necessary for low-liquidity pools
  const canSave = selected && (selected !== 'custom' || (customValue && (!error || error === 'too-high')))
  const footer = (
    <Button fullWidth disabled={!canSave} onClick={() => onSave(selected === 'custom' ? customValue : selected)}>
      {t`Save`}
    </Button>
  )

  const customTextField = (
    <TextField
      variant="standard"
      type="number"
      value={customValue}
      placeholder={t`Custom slippage`}
      slotProps={{
        input: {
          endAdornment: '%',
          sx: {
            color: (t) => (selected === 'custom' ? 'inherit' : t.design.Text.TextColors.Disabled),
            paddingLeft: '1ch', // TODO: rely on input styling in different PR
          },
        },
      }}
      error={!!error}
      onChange={(e) =>
        setFormValues({
          selected: 'custom',
          customValue: e.target.value,
          error: validateCustomValue(e.target.value),
        })
      }
      // Toggle to 'custom' the moment you click the text input
      onClick={() => setFormValues({ ...formValues, selected: 'custom' })}
      sx={{
        flexGrow: 1,
        '& .MuiInputBase-adornedEnd': {
          color: (t) => (selected === 'custom' ? 'inherit' : t.design.Text.TextColors.Disabled),
          paddingRight: '1ch', // TODO: rely on input styling in different PR
        },
      }}
    />
  )

  const tooltipText = t`Maximum difference between expected price of the trade, versus the price when the trade is executed.`
  const tooltip = (
    <Tooltip arrow placement="top" title={tooltipText}>
      <InfoOutlinedIcon sx={{ width: IconSize.xs, height: IconSize.xs }} />
    </Tooltip>
  )

  return (
    <ModalDialog
      open={isOpen}
      onClose={onClose}
      title={t`Slippage Settings`}
      footer={footer}
      // Compact modal
      sx={{ '& .MuiPaper-root': { height: 'auto', minHeight: 'auto' } }}
    >
      <Stack gap={Spacing.md}>
        <FormControl fullWidth>
          {/* Labels become blue on focus, but in this one-off we don't want that as it's the only form option */}
          <FormLabel sx={{ color: 'text.secondary', '&.Mui-focused': { color: 'text.secondary' } }}>
            {t`Max Slippage`} {tooltip}
          </FormLabel>

          <Stack direction={{ mobile: 'column', tablet: 'row' }} justifyContent="space-between" gap={Spacing.sm}>
            <RadioGroup
              row
              value={formValues.selected}
              onChange={(e) => setFormValues({ ...formValues, selected: e.target.value })}
              sx={{
                flexGrow: 1,
                justifyContent: { mobile: 'space-between', tablet: 'start' },
                gap: Spacing.xs,
              }}
            >
              <FormControlLabel value={SLIPPAGE_PRESETS.STABLE.toString()} label={FORMATTED_01} control={<Radio />} />
              <FormControlLabel value={SLIPPAGE_PRESETS.CRYPTO.toString()} label={FORMATTED_05} control={<Radio />} />
            </RadioGroup>

            <Box display="flex" flexGrow={1} justifyContent={{ mobile: 'start', tablet: 'end' }}>
              {customTextField}
            </Box>
          </Stack>
        </FormControl>

        {/* Going for an alert instead of textfield helpertext because it looks better wrt layout */}
        {error && selected === 'custom' && (
          <Alert variant="filled" severity={error === 'too-low' ? 'error' : 'warning'}>
            <AlertTitle>{inputErrorMapper[error].message}</AlertTitle>
            {inputErrorMapper[error].helperText}
          </Alert>
        )}
      </Stack>
    </ModalDialog>
  )
}
