import type { Property } from 'csstype'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { CLASS_BORDERLESS, SLIDER_BACKGROUND_VAR } from '@ui-kit/themes/components/slider'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { NumericTextField } from './NumericTextField'

const { Spacing, FontSize, FontWeight, Sizing } = SizesAndSpaces

type Props = {
  /** Current percentage value (0-100) */
  percentage: number | undefined
  /** Callback when percentage changes on the slider */
  onChange?: (percentage: number | undefined) => void
  /** Callback when percentage changes by releasing the slider or entering a number */
  onCommit?: (percentage: number | undefined) => void
  /** Step increment for the slider and input */
  step?: number
  /** Text alignment for the input field */
  textAlign?: Property.TextAlign
}

export const TradingSlider = ({ percentage, onChange, onCommit, step = 1, textAlign = 'left' }: Props) => (
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
      value={percentage ?? 0}
      onChange={(_event, newValue) => onChange?.(Array.isArray(newValue) ? newValue[0] : newValue)}
      onChangeCommitted={(_event, newValue) => onCommit?.(Array.isArray(newValue) ? newValue[0] : newValue)}
      min={0}
      max={100}
      step={step}
      sx={{ [SLIDER_BACKGROUND_VAR]: (t) => t.design.Color.Primary[200] }}
    />

    <NumericTextField
      placeholder="0"
      size="extraSmall"
      variant="standard"
      value={percentage}
      min={0}
      max={100}
      onChange={(newPercentage) => onChange?.(newPercentage)}
      onBlur={(newPercentage) => onCommit?.(newPercentage)}
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
