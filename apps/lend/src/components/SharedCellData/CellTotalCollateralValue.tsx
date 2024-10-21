import { useEffect } from 'react'
import styled from 'styled-components'

import { formatNumber } from '@/ui/utils'
import useStore from '@/store/useStore'

import TextCaption from '@/ui/TextCaption'
import { useOneWayMarket } from '@/entities/chain'

const CellTotalCollateralValue = ({ rChainId, rOwmId }: { rChainId: ChainId; rOwmId: string }) => {
  const market = useOneWayMarket(rChainId, rOwmId)?.data
  const isAdvanceMode = useStore((state) => state.isAdvanceMode)
  const totalCollateralValue = useStore((state) => state.markets.totalCollateralValuesMapper[rChainId]?.[rOwmId])
  const fetchTotalCollateralValue = useStore((state) => state.markets.fetchTotalCollateralValue)

  const { total = null, tooltipContent = [], error } = totalCollateralValue ?? {}

  useEffect(() => {
    if (market) fetchTotalCollateralValue(rChainId, market)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rChainId, market])

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
