import type { Property } from 'csstype'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { SLIDER_BACKGROUND_VAR } from '@ui-kit/themes/components/slider'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing, FontSize, FontWeight, Sizing } = SizesAndSpaces

type Props = {
  /** Current percentage value (0-100) */
  percentage: number
  /** Callback when percentage changes on the slider */
  onPercentageChange?: (percentage: number) => void
  /** Callback when percentage changes by rleasing the slider or entering a number */
  onPercentageCommitted?: (percentage: number) => void
  /** Step increment for the slider and input */
  step?: number
  /** Text alignment for the input field */
  textAlign?: Property.TextAlign
}

export const TradingSlider = ({
  percentage,
  onPercentageChange,
  onPercentageCommitted,
  step = 1,
  textAlign = 'left',
}: Props) => (
  <Stack
    direction="row"
    alignItems="center"
    gap={Spacing.md}
    sx={{
      flexGrow: 1,
      marginInlineStart: Spacing.md,
    }}
  >
    <Slider
      size="medium"
      value={percentage}
      onChange={(_event, newValue) => onPercentageChange?.(Array.isArray(newValue) ? newValue[0] : newValue)}
      onChangeCommitted={(_event, newValue) =>
        onPercentageCommitted?.(Array.isArray(newValue) ? newValue[0] : newValue)
      }
      min={0}
      max={100}
      step={step}
      sx={{ [SLIDER_BACKGROUND_VAR]: (t) => t.design.Color.Primary[200] }}
    />

    <TextField
      type="number"
      placeholder="0"
      size="small"
      variant="standard"
      value={percentage}
      onChange={(event) => {
        const numValue = Number(event.target.value)
        const clampedValue = Math.min(Math.max(numValue, 0), 100)

        if (!isNaN(numValue) && percentage !== clampedValue) {
          event.target.value = String(clampedValue) // remove leading zeros
          onPercentageCommitted?.(clampedValue)
        }
      }}
      slotProps={{
        htmlInput: {
          min: 0,
          max: 100,
          step,
        },
        input: {
          sx: {
            fontFamily: (t) => t.typography.bodySBold.fontFamily,
            fontSize: FontSize.sm,
            fontWeight: FontWeight.Bold,
            height: Sizing.sm,
            '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
              display: 'none',
            },
            '& input': {
              padding: 0,
              marginInline: Spacing.sm,
              textAlign,
            },
          },
          endAdornment: (
            <Typography variant="bodySBold" color="textTertiary">
              %
            </Typography>
          ),
        },
      }}
      sx={{ minWidth: '7ch' }} // just enough for comma value with 2 digits like 99,99%
    />
  </Stack>
)
