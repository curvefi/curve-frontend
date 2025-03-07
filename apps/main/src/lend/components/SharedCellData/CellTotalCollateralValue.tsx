import { useEffect } from 'react'
import styled from 'styled-components'
import { useOneWayMarket } from '@/lend/entities/chain'
import useStore from '@/lend/store/useStore'
import { ChainId } from '@/lend/types/lend.types'
import TextCaption from '@ui/TextCaption'
import { formatNumber } from '@ui/utils'
import { useUserProfileStore } from '@ui-kit/features/user-profile'

const CellTotalCollateralValue = ({ rChainId, rOwmId }: { rChainId: ChainId; rOwmId: string }) => {
  const market = useOneWayMarket(rChainId, rOwmId).data
  const totalCollateralValue = useStore((state) => state.markets.totalCollateralValuesMapper[rChainId]?.[rOwmId])
  const fetchTotalCollateralValue = useStore((state) => state.markets.fetchTotalCollateralValue)

  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)

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
          {isAdvancedMode && +total > 0 && (
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
