import { useEffect, useState } from 'react'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { SliderInput } from '@ui-kit/shared/ui/SliderInput'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { BORROW_PRESET_RANGES } from '../constants'

const { Spacing, MaxWidth } = SizesAndSpaces
const format = (value: number) => formatNumber(value, { style: 'currency', currency: 'USD' })

export const LiquidationRangeSlider = ({
  setRange,
  market,
  range,
}: {
  market: LlamaMarketTemplate | undefined
  range: number
  setRange: (n: number) => void
}) => {
  const liqRanges =
    market && Array.from({ length: +market.maxBands - +market.minBands + 1 }, (_, i) => ({ n: i + market.minBands }))
  const [sliderValue, setSliderValue] = useState<number>(range ?? market?.minBands ?? 5)

  useEffect(() => setSliderValue(range), [range])

  const minValue = liqRanges?.[0]?.n ?? market?.minBands ?? BORROW_PRESET_RANGES.MaxLtv
  const maxValue = liqRanges?.[liqRanges.length - 1]?.n ?? market?.maxBands ?? BORROW_PRESET_RANGES.Safe
  return (
    <Grid container columnSpacing={Spacing.sm}>
      <Grid container size={8}>
        <Grid size={12} container>
          <Grid size={6}>
            <Typography variant="bodyXsRegular" color="textTertiary">{t`Max LTV`}</Typography>
          </Grid>
          <Grid size={6} sx={{ textAlign: 'right' }}>
            <Typography variant="bodyXsRegular" color="textTertiary">{t`Safe`}</Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid size={12}>
        <SliderInput
          onChange={(val) => val && setSliderValue(Number(val))}
          aria-label={t`Bands`}
          value={sliderValue}
          min={minValue}
          max={maxValue}
          sliderProps={{
            onChangeCommitted: (_, n) => setRange(n as number),
            getAriaValueText: format,
            'data-rail-background': 'safe',
          }}
          inputProps={{
            variant: 'standard',
            name: 'range',
            onBlur: (clamped) => clamped && setRange(Number(clamped)),
            // the input is not wide enough for the "Bands" adornments
            // value chosen for the slier to match the width of the labels
            sx: { flexShrink: 0, width: MaxWidth.sliderInput.bands },
            slotProps: {
              // the normal input font size is too small for this component
              input: {
                sx: { '& input': { color: 'text.primary', fontSize: 'bodyMBold' } },
                endAdornment: (
                  <Typography
                    sx={{ marginInlineEnd: Spacing.sm }}
                    variant="highlightM"
                    color="text.secondary"
                  >{t`Bands`}</Typography>
                ),
              },
            },
          }}
        />
      </Grid>
    </Grid>
  )
}
