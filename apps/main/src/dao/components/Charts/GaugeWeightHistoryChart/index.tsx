import { useEffect } from 'react'
import styled from 'styled-components'
import { t } from '@lingui/macro'

import useStore from '@/store/useStore'

import Spinner, { SpinnerWrapper } from '@/ui/Spinner'
import LineChartComponent from '@/components/Charts/LineChartComponent'
import ErrorMessage from '@/components/ErrorMessage'

interface GaugeWeightHistoryChartProps {
  gaugeAddress: string
  minHeight: number
}

const GaugeWeightHistoryChart = ({ gaugeAddress, minHeight }: GaugeWeightHistoryChartProps) => {
  const { gaugeWeightHistoryMapper, getHistoricGaugeWeights } = useStore((state) => state.gauges)

  const error = gaugeWeightHistoryMapper[gaugeAddress]?.loadingState === 'ERROR'
  const loading = gaugeWeightHistoryMapper[gaugeAddress]?.loadingState === 'LOADING'
  const success = gaugeWeightHistoryMapper[gaugeAddress]?.loadingState === 'SUCCESS'

  useEffect(() => {
    if (!gaugeWeightHistoryMapper[gaugeAddress]) {
      getHistoricGaugeWeights(gaugeAddress)
    }
  }, [gaugeAddress, gaugeWeightHistoryMapper, getHistoricGaugeWeights])

  return (
    <>
      {error && (
        <ErrorWrapper $minHeight={minHeight} onClick={(e) => e.stopPropagation()}>
          <ErrorMessage
            message={t`Error fetching historical gauge weights data`}
            onClick={(e?: React.MouseEvent) => {
              e?.stopPropagation()
              getHistoricGaugeWeights(gaugeAddress)
            }}
          />
        </ErrorWrapper>
      )}
      {(loading ||
        !gaugeWeightHistoryMapper[gaugeAddress] ||
        (gaugeWeightHistoryMapper[gaugeAddress]?.data.length === 0 && error)) && (
        <StyledSpinnerWrapper $minHeight={minHeight}>
          <Spinner size={16} />
        </StyledSpinnerWrapper>
      )}
      {gaugeWeightHistoryMapper[gaugeAddress]?.data.length !== 0 && success && (
        <LineChartComponent height={minHeight * 16} data={gaugeWeightHistoryMapper[gaugeAddress]?.data} />
      )}
    </>
  )
}

const ErrorWrapper = styled.div<{ $minHeight: number }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: ${({ $minHeight }) => `${$minHeight}rem`};
`

const StyledSpinnerWrapper = styled(SpinnerWrapper)<{ $minHeight: number }>`
  height: ${({ $minHeight }) => `${$minHeight}rem`};
`

export default GaugeWeightHistoryChart
