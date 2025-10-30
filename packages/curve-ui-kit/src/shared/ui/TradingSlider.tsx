import Typography from '@mui/material/Typography'
import { decimal, type Decimal } from '@ui-kit/utils'
import { SliderInput } from './SliderInput'

type Props = {
  /** Current percentage value (0-100) */
  percentage: Decimal | undefined
  /** Callback when percentage changes on the slider */
  onChange?: (percentage: Decimal | undefined) => void
  /** Callback when percentage changes by releasing the slider or entering a number */
  onCommit?: (percentage: Decimal | undefined) => void
  /** Whether the slider and input are disabled */
  disabled?: boolean
}

export const TradingSlider = ({ percentage, onChange, onCommit, disabled }: Props) => (
  <SliderInput
    disabled={disabled}
    value={percentage ? +percentage : 0}
    onChange={(val) => onChange?.(decimal(`${val}`))}
    sliderProps={{
      onChangeCommitted: (_e, val) => onCommit?.(decimal(`${val}`)),
      'data-rail-background': 'danger',
    }}
    min={0}
    max={100}
    inputProps={{
      onBlur: onCommit,
      variant: 'standard',
      slotProps: {
        input: {
          sx: {
            paddingInlineEnd: 0,
          },
          endAdornment: (
            <Typography variant="bodySBold" color="textTertiary">
              %
            </Typography>
          ),
        },
      },
    }}
  />
)
