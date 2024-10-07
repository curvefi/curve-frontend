import SliderSingleThumb from '@/ui/SliderSingleThumb'
import { t } from '@lingui/macro'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import type { FormDetailInfoSharedProps } from '@/components/PageLoanCreate/types'
import type { LiqRange, LiqRangeSliderIdx } from '@/store/types'



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
  detailInfoLeverage?: React.ReactNode
  liqRanges: LiqRange[]
  loading: boolean
  minBands: number | undefined
  maxBands: number | undefined
  selectedLiqRange: LiqRangeSliderIdx | undefined
  showEditLiqRange: boolean
  handleSelLiqRange: FormDetailInfoSharedProps['handleSelLiqRange']
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
