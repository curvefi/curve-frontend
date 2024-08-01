import type { ChipProps } from '@/ui/Typography/types'

import { useEffect } from 'react'
import styled from 'styled-components'

import { formatNumber } from '@/ui/utils'
import useStore from '@/store/useStore'

import Chip from '@/ui/Typography/Chip'
import TextCaption from '@/ui/TextCaption'

const CellTotalCollateralValue = ({
  rChainId,
  rOwmId,
  ...props
}: ChipProps & {
  rChainId: ChainId
  rOwmId: string
}) => {
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
      {typeof totalCollateralValue === 'undefined' || total === null ? null : error ? (
        '?'
      ) : (
        <>
          <StyledChip {...props}>{formatNumber(total, { notation: 'compact', currency: 'USD' })}</StyledChip>
          {isAdvanceMode && (
            <>
              {+total > 0 && (
                <TotalSummary>
                  {' '}
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
      )}
    </>
  )
}

const StyledChip = styled(Chip)`
  display: block;
`

const TotalSummary = styled(TextCaption)`
  white-space: nowrap;
`

export default CellTotalCollateralValue
