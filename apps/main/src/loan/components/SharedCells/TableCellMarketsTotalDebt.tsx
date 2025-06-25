import styled from 'styled-components'
import { useAppStatsTotalCrvusdSupply } from '@/loan/entities/appstats-total-crvusd-supply'
import type { ChainId } from '@/loan/types/loan.types'
import TextCaption from '@ui/TextCaption'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import { useConnection } from '@ui-kit/features/connect-wallet'

const TableCellMarketsTotalDebt = () => {
  const chainId = useConnection().llamaApi?.chainId as ChainId
  const { data: crvusdTotalSupply } = useAppStatsTotalCrvusdSupply({ chainId })

  const { total, minted, pegKeepersDebt, error } = crvusdTotalSupply ?? {}

  const formattedDebtFraction =
    !total || !minted ? '-' : formatNumber(((+total - +minted) / +total) * 100, FORMAT_OPTIONS.PERCENT)

  return typeof crvusdTotalSupply === 'undefined' ? null : error ? (
    '?'
  ) : (
    <StyledTotalSupply>
      {formatNumber(pegKeepersDebt, { defaultValue: '-' })}
      <TextCaption>{formattedDebtFraction} of total supply</TextCaption>
    </StyledTotalSupply>
  )
}

const StyledTotalSupply = styled.div`
  display: grid;
  grid-gap: 0.1rem;
`

export default TableCellMarketsTotalDebt
