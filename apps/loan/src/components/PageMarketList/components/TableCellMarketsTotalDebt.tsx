import type { ChipProps } from '@/ui/Typography/types'

import styled from 'styled-components'

import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import useStore from '@/store/useStore'

import Chip from '@/ui/Typography/Chip'

const TableCellMarketsTotalDebt = (props: ChipProps) => {
  const totalSupplyResp = useStore((state) => state.crvusdTotalSupply)

  const { total, minted, pegKeepersDebt, error } = totalSupplyResp ?? {}

  const formattedDebtFraction =
    total === '' && minted === '' ? '-' : formatNumber(((+total - +minted) / +total) * 100, FORMAT_OPTIONS.PERCENT)

  return (
    <>
      {typeof totalSupplyResp === 'undefined' ? null : error ? (
        '?'
      ) : (
        <Chip {...props}>
          {formatNumber(pegKeepersDebt, { defaultValue: '-' })}{' '}
          <DebtFraction>({formattedDebtFraction} of total supply)</DebtFraction>
        </Chip>
      )}
    </>
  )
}

const DebtFraction = styled.span`
  font-weight: normal;
`

export default TableCellMarketsTotalDebt
