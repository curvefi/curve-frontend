import { styled } from 'styled-components'
import { useStore } from '@/dao/store/useStore'
import { GaugeFormattedData } from '@/dao/types/dao.types'
import { formatNumber } from '@primitives/number.utils'

type GaugeListColumnsProps = { gaugeData: GaugeFormattedData }

export const GaugeListColumns = ({ gaugeData }: GaugeListColumnsProps) => {
  const gaugeListSortBy = useStore(state => state.gauges.gaugeListSortBy)

  return (
    <>
      <BoxColumn>
        <GaugeData className={`${gaugeListSortBy.key === 'weightRelative' ? 'bold' : ''}`}>
          {formatNumber(gaugeData.weightRelative, { decimals: 5, abbreviate: true })}%
        </GaugeData>
      </BoxColumn>
      <BoxColumn>
        <GaugeData
          className={`${
            gaugeData.weightRelativeDelta7d ? (gaugeData.weightRelativeDelta7d > 0 ? 'green' : 'red') : ''
          } ${gaugeListSortBy.key === 'weightRelativeDelta7d' ? 'bold' : ''}`}
        >
          {gaugeData.weightRelativeDelta7d
            ? `${formatNumber(gaugeData.weightRelativeDelta7d, { decimals: 5, abbreviate: true })}%`
            : 'N/A'}
        </GaugeData>
      </BoxColumn>
      <BoxColumn>
        <GaugeData
          className={`${
            gaugeData.weightRelativeDelta60d ? (gaugeData.weightRelativeDelta60d > 0 ? 'green' : 'red') : ''
          } ${gaugeListSortBy.key === 'weightRelativeDelta60d' ? 'bold' : ''}`}
        >
          {gaugeData.weightRelativeDelta60d
            ? `${formatNumber(gaugeData.weightRelativeDelta60d, { abbreviate: true })}%`
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
