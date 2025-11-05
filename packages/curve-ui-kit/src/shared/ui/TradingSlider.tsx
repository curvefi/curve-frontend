import Typography from '@mui/material/Typography'
import { type Decimal } from '@ui-kit/utils'
import { SliderInput } from './SliderInput'

type Props = {
  /** Current percentage value (0-100) */
  percentage: Decimal | undefined
  /** Callback when percentage changes on the slider */
  onChange: (percentage: Decimal) => void
  /** Whether the slider and input are disabled */
  disabled?: boolean
}

export const TradingSlider = ({ percentage, onChange, disabled }: Props) => {
  const minValue = 0
  const maxValue = 100
  return (
    <SliderInput
      disabled={disabled}
      value={percentage ?? `${minValue}`}
      onChange={(value) => onChange(value as Decimal)}
      sliderProps={{
        'data-rail-background': 'danger',
      }}
      min={minValue}
      max={maxValue}
      inputProps={{
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
}
