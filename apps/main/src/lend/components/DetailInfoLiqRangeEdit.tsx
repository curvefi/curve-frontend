import { ReactNode, useEffect, useState } from 'react'
import styled from 'styled-components'
import type { LiqRange, LiqRangeSliderIdx } from '@/lend/store/types'
import SliderSingleThumb from '@ui/SliderSingleThumb'
import { t } from '@ui-kit/lib/i18n'

const DetailInfoLiqRangeEdit = ({
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
  handleSelLiqRange(n: number): void
}) => {
  const [sliderValue, setSliderValue] = useState<number>(selectedLiqRange?.n ?? minBands ?? 5)

  useEffect(() => {
    if (showEditLiqRange && selectedLiqRange?.n) {
      setSliderValue(selectedLiqRange.n)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showEditLiqRange])

  const haveLiqRanges = !loading || (Array.isArray(liqRanges) && liqRanges.length > 0)
  const minValue = liqRanges?.[0]?.n ?? minBands ?? 5
  const maxValue = liqRanges?.[liqRanges.length - 1]?.n ?? maxBands ?? 50

  return showEditLiqRange ? (
    <LiqRangeSliderWrapper>
      <SliderSingleThumb
        hideValue
        label={<strong>{t`Adjust N:`}</strong>}
        loading={!haveLiqRanges}
        formatOptions={{ style: 'currency', currency: 'USD' }}
        minValue={minValue}
        maxValue={maxValue}
        value={sliderValue}
        onChange={(n) => {
          setSliderValue(n as number)
        }}
        onChangeEnd={(n) => {
          handleSelLiqRange(n as number)
        }}
      />
    </LiqRangeSliderWrapper>
  ) : null
}

const LiqRangeSliderWrapper = styled.div`
  min-height: 2.5rem; //49px
  margin-top: 1rem;
  position: relative;
`

export default DetailInfoLiqRangeEdit
