import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { maybe } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { SliderInput } from '@ui-kit/shared/ui/SliderInput'
import { decimal } from '@ui-kit/utils'
import { PRESET_RANGES } from '../../../constants'

export const LiquidationRangeSlider = ({
  setRange,
  minBands,
  maxBands,
  range,
}: {
  minBands: number | undefined
  maxBands: number | undefined
  range: number
  setRange: (n: number) => void
}) => {
  const liqRanges = maybe(minBands, min =>
    maybe(maxBands, max => Array.from({ length: max - min + 1 }, (_, i) => ({ n: i + min }))),
  )

  const minValue = liqRanges?.[0]?.n ?? minBands ?? PRESET_RANGES.MaxLtv
  const maxValue = liqRanges?.[liqRanges.length - 1]?.n ?? maxBands ?? PRESET_RANGES.Safe
  return (
    <SliderInput
      name="range"
      onChange={val => setRange(parseInt(val))}
      aria-label={t`Bands`}
      value={decimal(range) ?? `${minValue}`}
      min={minValue}
      max={maxValue}
      sliderProps={{ 'data-rail-background': 'safe' }}
      inputProps={{ adornment: 'bands' }}
      sliderLabel={
        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
          {[t`Max LTV`, t`Conservative`].map(l => (
            <Typography key={l} variant="bodyXsRegular" color="textSecondary">
              {l}
            </Typography>
          ))}
        </Stack>
      }
    />
  )
}
