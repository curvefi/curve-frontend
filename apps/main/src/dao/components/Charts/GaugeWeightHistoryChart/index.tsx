import { MouseEvent, useEffect } from 'react'
import { styled } from 'styled-components'
import { LineChartComponent } from '@/dao/components/Charts/LineChartComponent'
import { ErrorMessage } from '@/dao/components/ErrorMessage'
import { useStore } from '@/dao/store/useStore'
import { SpinnerWrapper, Spinner } from '@ui/Spinner'
import { t } from '@ui-kit/lib/i18n'

interface GaugeWeightHistoryChartProps {
  gaugeAddress: string
  minHeight: number
}

export const GaugeWeightHistoryChart = ({ gaugeAddress, minHeight }: GaugeWeightHistoryChartProps) => {
  const gaugeWeightHistoryMapper = useStore((state) => state.gauges.gaugeWeightHistoryMapper)
  const getHistoricGaugeWeights = useStore((state) => state.gauges.getHistoricGaugeWeights)

  const error = gaugeWeightHistoryMapper[gaugeAddress]?.loadingState === 'ERROR'
  const loading = gaugeWeightHistoryMapper[gaugeAddress]?.loadingState === 'LOADING'
  const success = gaugeWeightHistoryMapper[gaugeAddress]?.loadingState === 'SUCCESS'

  useEffect(() => {
    if (!gaugeWeightHistoryMapper[gaugeAddress]) {
      void getHistoricGaugeWeights(gaugeAddress)
    }
  }, [gaugeAddress, gaugeWeightHistoryMapper, getHistoricGaugeWeights])

  return (
    <>
      {error && (
        <ErrorWrapper $minHeight={minHeight} onClick={(e) => e.stopPropagation()}>
          <ErrorMessage
            message={t`Error fetching historical gauge weights data`}
            onClick={(e?: MouseEvent) => {
              e?.stopPropagation()
              void getHistoricGaugeWeights(gaugeAddress)
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
