import styled from 'styled-components'

import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import useStore from '@/store/useStore'

import TextCaption from '@/ui/TextCaption'

const TableCellMarketsTotalDebt = () => {
  const totalSupplyResp = useStore((state) => state.crvusdTotalSupply)

  const { total, minted, pegKeepersDebt, error } = totalSupplyResp ?? {}

  const formattedDebtFraction =
    total === '' && minted === '' ? '-' : formatNumber(((+total - +minted) / +total) * 100, FORMAT_OPTIONS.PERCENT)

  return (
    <>
      {typeof totalSupplyResp === 'undefined' ? null : error ? (
        '?'
      ) : (
        <StyledTotalSupply>
          {formatNumber(pegKeepersDebt, { defaultValue: '-' })}
          <TextCaption>{formattedDebtFraction} of total supply</TextCaption>
        </StyledTotalSupply>
      )}
    </>
  )
}

const StyledTotalSupply = styled.div`
  display: grid;
  grid-gap: 0.1rem;
`

export default TableCellMarketsTotalDebt
