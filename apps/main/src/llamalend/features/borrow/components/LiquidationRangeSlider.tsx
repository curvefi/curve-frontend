import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { SliderInput } from '@ui-kit/shared/ui/SliderInput'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { decimal } from '@ui-kit/utils'
import { PRESET_RANGES } from '../../../constants'

const { Spacing } = SizesAndSpaces

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

  const minValue = liqRanges?.[0]?.n ?? market?.minBands ?? PRESET_RANGES.MaxLtv
  const maxValue = liqRanges?.[liqRanges.length - 1]?.n ?? market?.maxBands ?? PRESET_RANGES.Safe
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
          onChange={(val) => setRange(parseInt(val))}
          aria-label={t`Bands`}
          value={decimal(range) ?? `${minValue}`}
          min={minValue}
          max={maxValue}
          sliderProps={{
            'data-rail-background': 'safe',
          }}
          inputProps={{
            variant: 'standard',
            name: 'range',
            adornment: 'bands',
          }}
        />
      </Grid>
    </Grid>
  )
}
