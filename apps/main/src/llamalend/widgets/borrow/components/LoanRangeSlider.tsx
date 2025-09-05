import { useEffect, useState } from 'react'
import Grid from '@mui/material/Grid'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { NumericTextField } from '@ui-kit/shared/ui/NumericTextField'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { LlamaMarketTemplate } from '../borrow.types'
import { BORROW_PRESET_RANGES } from '../borrow.util'

const { Spacing } = SizesAndSpaces
const format = (value: number) => formatNumber(value, { style: 'currency', currency: 'USD' })

export const LoanRangeSlider = ({
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
    <Stack gap={Spacing.sm}>
      <Typography variant="bodyXsRegular">{t`Bands`}</Typography>
      <Grid container columnSpacing={Spacing.sm}>
        <Grid size={8} paddingInline={Spacing.sm}>
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
        <Grid size={4}>
          <NumericTextField
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
    </Stack>
  )
}
