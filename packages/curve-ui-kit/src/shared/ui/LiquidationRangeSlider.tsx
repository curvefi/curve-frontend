import { ReactNode, useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { Slider } from './Slider'

// the real type has more fields, but we only use this one
type LiqRange = { n: number }

const format = (value: number) => formatNumber(value, { style: 'currency', currency: 'USD' })

export const LiquidationRangeSlider = ({
  liqRanges,
  loading,
  maxBands,
  minBands,
  selectedLiqRange,
  showEditLiqRange,
  handleSelLiqRange,
}: {
  detailInfoLeverage?: ReactNode
  liqRanges: LiqRange[]
  loading: boolean
  minBands: number | undefined
  maxBands: number | undefined
  selectedLiqRange: LiqRange | undefined
  showEditLiqRange: boolean
  handleSelLiqRange: (n: number) => void
}) => {
  const [sliderValue, setSliderValue] = useState<number>(selectedLiqRange?.n ?? minBands ?? 5)

  useEffect(() => {
    if (selectedLiqRange?.n) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSliderValue(selectedLiqRange.n)
    }
  }, [selectedLiqRange?.n])

  const minValue = liqRanges?.[0]?.n ?? minBands ?? 5
  const maxValue = liqRanges?.[liqRanges.length - 1]?.n ?? maxBands ?? 50

  return (
    showEditLiqRange && (
      <WithSkeleton loading={loading && !liqRanges?.length}>
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
            size="medium"
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
  )
}
