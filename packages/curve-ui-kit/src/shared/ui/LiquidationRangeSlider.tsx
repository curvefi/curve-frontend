import { ReactNode, useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Slider from '@mui/material/Slider'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'

type LiqRange = {
  n: number
}

export type LiqRangeSliderIdx = LiqRange & { sliderIdx: number }

export const LiquidationRangeSlider = ({
  liqRanges,
  loading,
  maxBands,
  minBands,
  selectedLiqRange,
  showEditLiqRange,
  handleSelLiqRange,
}: {
  bands: [number, number]
  detailInfoLeverage?: ReactNode
  liqRanges: LiqRange[]
  loading: boolean
  minBands: number | undefined
  maxBands: number | undefined
  selectedLiqRange: LiqRangeSliderIdx | undefined
  showEditLiqRange: boolean
  handleSelLiqRange: (n: number) => void
}) => {
  const [sliderValue, setSliderValue] = useState<number>(selectedLiqRange?.n ?? minBands ?? 5)

  useEffect(() => {
    if (selectedLiqRange?.n) {
      setSliderValue(selectedLiqRange.n)
    }
  }, [selectedLiqRange?.n])

  const haveLiqRanges = loading || (Array.isArray(liqRanges) && liqRanges.length > 0)
  const minValue = liqRanges?.[0]?.n ?? minBands ?? 5
  const maxValue = liqRanges?.[liqRanges.length - 1]?.n ?? maxBands ?? 50

  const format = (value: number) => formatNumber(value, { style: 'currency', currency: 'USD' })

  if (!showEditLiqRange) {
    return null
  }
  return (
    <WithSkeleton loading={!haveLiqRanges}>
      <Box
        sx={{
          minHeight: '2.5rem', //49px
          marginTop: '1rem',
          position: 'relative',
        }}
      >
        <Typography variant="bodySBold">{t`Adjust N:`}</Typography>
        <Slider
          aria-label={t`Liquidation range`}
          getAriaValueText={format}
          value={sliderValue}
          onChange={(_, n) => setSliderValue(n as number)}
          onChangeCommitted={(_, n) => handleSelLiqRange(n as number)}
          min={minValue}
          max={maxValue}
        />
      </Box>
    </WithSkeleton>
  )
}
