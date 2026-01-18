import { useCallback, useEffect, useState } from 'react'
import { recordValues } from '@curvefi/prices-api/objects.util'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormLabel from '@mui/material/FormLabel'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { ModalDialog } from '@ui-kit/shared/ui/ModalDialog'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { decimal, Decimal } from '@ui-kit/utils'
import { MAX_RECOMMENDED_SLIPPAGE, MIN_SLIPPAGE, SLIPPAGE_PRESETS } from './slippage.utils'

const { Spacing, IconSize } = SizesAndSpaces

type Error = keyof typeof inputErrorMapper

type FormValues = {
  selected: Decimal | 'custom'
  customValue: string
  error?: Error
}

const FORMATTED_STABLE = formatNumber(SLIPPAGE_PRESETS.STABLE, { style: 'percent', maximumFractionDigits: 1 })
const FORMATTED_CRYPTO = formatNumber(SLIPPAGE_PRESETS.CRYPTO, { style: 'percent', maximumFractionDigits: 1 })

const inputErrorMapper = {
  'too-high': {
    message: t`High slippage selected`,
    helperText: (
      <>
        {t`This may lead to fewer tokens received and potential loss of funds.`}
        <br />
        {t`Proceed with caution.`}
      </>
    ),
  },
  'too-low': {
    message: t`Low slippage selected`,
    helperText: (
      <>
        {t`Your transaction may fail if price moves slightly.`}
        <br />
        {t`Consider increasing slippage if it doesn't go through.`}
        <br />
        <br />
        {t`Min. slippage is ${MIN_SLIPPAGE}%`}
      </>
    ),
  },
}

/** Validates a custom slippage value */
function validateCustomValue(value: string): FormValues['error'] {
  const numValue = Number(value)

  if (numValue === 0) return undefined // empty value, not really an error
  if (numValue > +MAX_RECOMMENDED_SLIPPAGE) return 'too-high'
  if (numValue < +MIN_SLIPPAGE) return 'too-low'

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
function initFormValues(maxSlippage: Decimal): FormValues {
  const isCustomValue = !recordValues(SLIPPAGE_PRESETS).includes(maxSlippage)

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
  maxSlippage: Decimal
}

export type SlippageSettingsCallbacks = {
  /** Function to close the modal */
  onClose: () => void
  /** Callback function when slippage value is saved */
  onSave: (slippage: Decimal) => void
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

  /**
   * Stores the last error to ensure the collapse animation transitions smoothly.
   * Without this, the error message would disappear before the collapse animation completes.
   */
  const [lastError, setLastError] = useState<Error | undefined>(undefined)

  useEffect(() => {
    setFormValues(initFormValues(maxSlippage))
  }, [maxSlippage])

  useEffect(() => {
    if (error) {
      setLastError(error)
    }
  }, [error])

  const onButtonClick = useCallback(() => {
    const value = decimal(selected === 'custom' ? customValue : selected)
    return value != null && onSave(value)
  }, [onSave, selected, customValue])

  // To save: require a selected value, and if 'custom', the custom value must be non-empty and pass validation
  // Allow 'too-high' error as it's discouraged but sometimes necessary for low-liquidity pools
  const canSave = selected && (selected !== 'custom' || (customValue && (!error || error === 'too-high')))
  const footer = (
    <Button fullWidth disabled={!canSave} onClick={onButtonClick} data-testid="slippage-save-button">
      {t`Save`}
    </Button>
  )

  const customTextField = (
    <TextField
      data-testid={'slippage-input' + (selected === 'custom' ? '-selected' : '-disabled')}
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
      onTransitionExited={() => setFormValues(initFormValues(maxSlippage))}
      title={t`Slippage Settings`}
      footer={footer}
      compact
    >
      <Stack gap={Spacing.md}>
        <FormControl fullWidth>
          {/* Labels become blue on focus, but in this one-off we don't want that as it's the only form option */}
          <FormLabel sx={{ '&.Mui-focused': { color: 'text.secondary' } }}>
            <Typography variant="bodyMRegular">
              {t`Max slippage`} {tooltip}
            </Typography>
          </FormLabel>

          <Stack direction={{ mobile: 'column', tablet: 'row' }} justifyContent="space-between" gap={Spacing.sm}>
            <RadioGroup
              row
              value={formValues.selected}
              onChange={(e) => setFormValues({ ...formValues, selected: e.target.value as Decimal })}
              sx={{
                flexGrow: 1,
                justifyContent: { mobile: 'space-between', tablet: 'start' },
                gap: Spacing.xs,
              }}
              data-testid="slippage-radio-group"
            >
              <FormControlLabel value={SLIPPAGE_PRESETS.STABLE} label={FORMATTED_STABLE} control={<Radio />} />
              <FormControlLabel value={SLIPPAGE_PRESETS.CRYPTO} label={FORMATTED_CRYPTO} control={<Radio />} />
            </RadioGroup>

            <Box display="flex" flexGrow={1} justifyContent={{ mobile: 'start', tablet: 'end' }}>
              {customTextField}
            </Box>
          </Stack>
        </FormControl>

        {/* Going for an alert instead of textfield helpertext because it looks better wrt layout */}
        <Collapse in={error && selected === 'custom'}>
          <Alert variant="outlined" severity={lastError === 'too-low' ? 'error' : 'warning'} sx={{ boxShadow: 'none' }}>
            <AlertTitle>{lastError ? inputErrorMapper[lastError].message : ''}</AlertTitle>
            {lastError ? inputErrorMapper[lastError].helperText : ''}
          </Alert>
        </Collapse>
      </Stack>
    </ModalDialog>
  )
}
