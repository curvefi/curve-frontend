import styled from 'styled-components'

type GaugeListColumnsProps = {
  gaugeData: GaugeFormattedData
}

const GaugeListColumns = ({ gaugeData }: GaugeListColumnsProps) => {
  return (
    <>
      <BoxColumn>
        <GaugeData>{gaugeData.gauge_relative_weight.toFixed(2)}%</GaugeData>
      </BoxColumn>
      <BoxColumn>
        <GaugeData
          className={`${
            gaugeData.gauge_relative_weight_7d_delta
              ? gaugeData.gauge_relative_weight_7d_delta > 0
                ? 'green'
                : 'red'
              : ''
          }`}
        >
          {gaugeData.gauge_relative_weight_7d_delta ? `${gaugeData.gauge_relative_weight_7d_delta.toFixed(2)}%` : 'N/A'}
        </GaugeData>
      </BoxColumn>
      <BoxColumn>
        <GaugeData
          className={`${
            gaugeData.gauge_relative_weight_60d_delta
              ? gaugeData.gauge_relative_weight_60d_delta > 0
                ? 'green'
                : 'red'
              : ''
          }`}
        >
          {gaugeData.gauge_relative_weight_60d_delta
            ? `${gaugeData.gauge_relative_weight_60d_delta.toFixed(2)}%`
            : 'N/A'}
        </GaugeData>
      </BoxColumn>
    </>
  )
}

const BoxColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--spacing-1);
  padding: 0 var(--spacing-2);
  margin: auto 0 auto auto;
  &:first-child {
    margin-left: var(--spacing-2);
  }
  &:last-child {
    margin-right: var(--spacing-2);
  }
`

const GaugeData = styled.p`
  font-size: var(--font-size-2);
  font-weight: var(--bold);
  text-align: right;
  &.green {
    color: var(--chart-green);
  }
  &.red {
    color: var(--chart-red);
  }
  &.open {
    font-size: var(--font-size-2);
  }
`

export default GaugeListColumns
