import { useEffect, useState } from 'react'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import Grid from '@mui/material/Grid'
import Slider from '@mui/material/Slider'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { NumericTextField } from '@ui-kit/shared/ui/NumericTextField'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { BORROW_PRESET_RANGES } from '../constants'

const { Spacing } = SizesAndSpaces
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
        {/* we need 10 px padding, and -4px marginBottom, because the slider is overflowing its container */}
        <Grid size={12} paddingInline="10px" marginBottom="-4px">
          <Slider
            aria-label={t`Bands`}
            getAriaValueText={format}
            value={sliderValue}
            onChange={(_, n) => setSliderValue(n as number)}
            onChangeCommitted={(_, n) => setRange(n as number)}
            min={minValue}
            max={maxValue}
            size="medium"
          />
        </Grid>
      </Grid>
      <Grid size={4} display="flex" alignItems="flex-end" direction="row">
        <NumericTextField
          dataType="number"
          aria-label={t`Bands`}
          value={sliderValue}
          name="range"
          variant="standard"
          size="tiny"
          min={minValue}
          max={maxValue}
          onChange={(val) => val && setSliderValue(val)}
          onBlur={() => setRange(sliderValue)}
          slotProps={{
            input: {
              sx: { '& input': { color: 'text.tertiary' } },
              endAdornment: (
                <Typography sx={{ marginInlineEnd: Spacing.sm }} variant="highlightM">{t`Bands`}</Typography>
              ),
            },
          }}
        />
      </Grid>
    </Grid>
  )
}
