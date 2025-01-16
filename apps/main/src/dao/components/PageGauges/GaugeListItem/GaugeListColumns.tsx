import React from 'react'
import styled from 'styled-components'

import { formatNumber } from '@ui/utils'

import useStore from '@/dao/store/useStore'

type GaugeListColumnsProps = {
  gaugeData: GaugeFormattedData
}

const GaugeListColumns = ({ gaugeData }: GaugeListColumnsProps) => {
  const { gaugeListSortBy } = useStore((state) => state.gauges)

  return (
    <>
      <BoxColumn>
        <GaugeData className={`${gaugeListSortBy.key === 'gauge_relative_weight' ? 'bold' : ''}`}>
          {formatNumber(gaugeData.gauge_relative_weight, {
            notation: 'compact',
          })}
          %
        </GaugeData>
      </BoxColumn>
      <BoxColumn>
        <GaugeData
          className={`${
            gaugeData.gauge_relative_weight_7d_delta
              ? gaugeData.gauge_relative_weight_7d_delta > 0
                ? 'green'
                : 'red'
              : ''
          } ${gaugeListSortBy.key === 'gauge_relative_weight_7d_delta' ? 'bold' : ''}`}
        >
          {gaugeData.gauge_relative_weight_7d_delta
            ? `${formatNumber(gaugeData.gauge_relative_weight_7d_delta, {
                notation: 'compact',
              })}%`
            : 'N/A'}
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
          } ${gaugeListSortBy.key === 'gauge_relative_weight_60d_delta' ? 'bold' : ''}`}
        >
          {gaugeData.gauge_relative_weight_60d_delta
            ? `${formatNumber(gaugeData.gauge_relative_weight_60d_delta, {
                notation: 'compact',
              })}%`
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
  &.bold {
    font-weight: var(--bold);
  }
`

export default GaugeListColumns
