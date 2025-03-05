import styled from 'styled-components'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import useStore from '@/loan/store/useStore'
import InternalLink from '@ui/Link/InternalLink'
import TextCaption from '@ui/TextCaption'
import { useAppStatsTotalCrvusdSupply } from '@/loan/entities/appstats-total-crvusd-supply'

const TableCellMarketsTotalDebt = () => {
  const chainId = useStore((state) => state.curve?.chainId)
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

const StyledLink = styled(InternalLink)`
  color: inherit;
  font-size: var(--font-size-2);
  margin-top: var(--spacing-2);
  text-transform: initial;
`

export default TableCellMarketsTotalDebt
