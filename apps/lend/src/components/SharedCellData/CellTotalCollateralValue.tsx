import TextCaption from '@/ui/TextCaption'
import { formatNumber } from '@/ui/utils'
import { useEffect } from 'react'
import styled from 'styled-components'

import useStore from '@/store/useStore'


const CellTotalCollateralValue = ({ rChainId, rOwmId }: { rChainId: ChainId; rOwmId: string }) => {
  const isAdvanceMode = useStore((state) => state.isAdvanceMode)
  const owmData = useStore((state) => state.markets.owmDatasMapper[rChainId]?.[rOwmId])
  const totalCollateralValue = useStore((state) => state.markets.totalCollateralValuesMapper[rChainId]?.[rOwmId])
  const fetchTotalCollateralValue = useStore((state) => state.markets.fetchTotalCollateralValue)

  const { total = null, tooltipContent = [], error } = totalCollateralValue ?? {}

  useEffect(() => {
    if (owmData) fetchTotalCollateralValue(rChainId, owmData)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rChainId, owmData])

  return (
    <>
      {typeof totalCollateralValue === 'undefined' || total === null ? (
        '-'
      ) : error ? (
        '?'
      ) : (
        <>
          {formatNumber(total, { notation: 'compact', currency: 'USD' })}
          <br />
          {isAdvanceMode && +total > 0 && (
            <TotalSummary>
              {tooltipContent.map(({ label, value }, idx) => {
                const isLast = tooltipContent.length - 1 === idx
                return `${idx === 0 ? '' : ''}${formatNumber(value, { notation: 'compact' })} ${label}${
                  isLast ? '' : ' + '
                }`
              })}
            </TotalSummary>
          )}
        </>
      )}
    </>
  )
}

const TotalSummary = styled(TextCaption)`
  margin-top: 0.2rem;
  white-space: nowrap;
`

export default CellTotalCollateralValue
