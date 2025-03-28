import styled from 'styled-components'
import { useAppStatsTotalCrvusdSupply } from '@/loan/entities/appstats-total-crvusd-supply'
import TextCaption from '@ui/TextCaption'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import { useApiStore } from '@ui-kit/shared/useApiStore'

const TableCellMarketsTotalDebt = () => {
  const chainId = useApiStore((state) => state.stable?.chainId)
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
