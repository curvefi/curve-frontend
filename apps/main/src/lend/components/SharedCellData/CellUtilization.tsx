import { useMemo } from 'react'
import styled from 'styled-components'
import CellUtilizationTooltip from '@/lend/components/SharedCellData/CellUtilizationTooltip'
import useStore from '@/lend/store/useStore'
import { ChainId } from '@/lend/types/lend.types'
import { OneWayMarketTemplate } from '@curvefi/lending-api/lib/markets'
import ProgressBar from '@ui/ProgressBar'
import Chip from '@ui/Typography/Chip'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'

type Props = {
  isMobile?: boolean
  rChainId: ChainId
  rOwmId: string
  market: OneWayMarketTemplate
}
const CellUtilization = ({ isMobile, rChainId, rOwmId, market }: Props) => {
  const resp = useStore((state) => state.markets.statsCapAndAvailableMapper[rChainId]?.[rOwmId])
  const totalResp = useStore((state) => state.markets.statsTotalsMapper[rChainId]?.[rOwmId])

  const { cap } = resp ?? {}
  const { totalDebt } = totalResp ?? {}

  const utilization = useMemo(() => {
    const haveCap = typeof cap !== 'undefined' && +(+cap) > 0
    const haveTotalDebt = typeof totalDebt !== 'undefined'
    return haveTotalDebt && haveCap ? (+(totalDebt ?? '0') / +cap) * 100 : 0
  }, [cap, totalDebt])

  return (
    <StyledChip
      tooltip={<CellUtilizationTooltip rChainId={rChainId} rOwmId={rOwmId} market={market} />}
      tooltipProps={isMobile ? {} : {}}
    >
      {formatNumber(utilization, FORMAT_OPTIONS.PERCENT)}
      <ProgressBar $height={'14px'} progress={utilization} />
    </StyledChip>
  )
}

const StyledChip = styled(Chip)`
  display: grid;
  grid-gap: var(--spacing-1);
  min-width: 100px;
`

export default CellUtilization
