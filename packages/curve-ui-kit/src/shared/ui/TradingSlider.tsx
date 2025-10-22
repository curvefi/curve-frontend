import type { Property } from 'csstype'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { CLASS_BORDERLESS, SLIDER_BACKGROUND_VAR } from '@ui-kit/themes/components/slider'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { decimal, type Decimal } from '@ui-kit/utils'
import { NumericTextField } from './NumericTextField'

const { Spacing } = SizesAndSpaces

type Props = {
  /** Current percentage value (0-100) */
  percentage: Decimal | undefined
  /** Callback when percentage changes on the slider */
  onChange?: (percentage: Decimal | undefined) => void
  /** Callback when percentage changes by releasing the slider or entering a number */
  onCommit?: (percentage: Decimal | undefined) => void
  /** Step increment for the slider and input */
  step?: number
  /** Text alignment for the input field */
  textAlign?: Property.TextAlign
  /** Whether the slider and input are disabled */
  disabled?: boolean
}

export const TradingSlider = ({ percentage, onChange, onCommit, step = 1, textAlign = 'left', disabled }: Props) => (
  <Stack
    direction="row"
    alignItems="center"
    gap={Spacing.md}
    sx={{
      flexGrow: 1,
      marginInlineStart: Spacing.sm,
    }}
  >
    <Slider
      className={CLASS_BORDERLESS}
      size="medium"
      value={percentage ? +percentage : 0}
      onChange={(_event, newValue) => onChange?.(Array.isArray(newValue) ? newValue[0] : newValue)}
      onChangeCommitted={(_event, newValue) => onCommit?.(Array.isArray(newValue) ? newValue[0] : newValue)}
      min={0}
      max={100}
      step={step}
      disabled={disabled}
      sx={{
        [SLIDER_BACKGROUND_VAR]: (t) => t.design.Color.Primary[200],
        '&.MuiSlider-root::after': {
          zIndex: -1, // probably due to the background above, the slider is behind the background and becomes invisible
        },
      }}
    />

    <NumericTextField
      placeholder="0"
      size="tiny"
      variant="standard"
      value={percentage}
      min="0"
      max="100"
      onChange={(newPercentage) => onChange?.(decimal(newPercentage))}
      onBlur={(newPercentage) => onCommit?.(newPercentage)}
      disabled={disabled}
      slotProps={{
        input: {
          sx: { '& input': { textAlign } },
          endAdornment: (
            <Typography variant="bodySBold" color="textTertiary">
              %
            </Typography>
          ),
        },
      }}
      sx={{ maxWidth: '9ch' }} // just enough for comma value with 2 digits like 99,99%
    />
  </Stack>
)
